"""
Tests for the gift_lists app: CRUD, contributions, permissions, public access.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from decimal import Decimal

from apps.accounts.models import User
from .models import GiftList, Contribution


def make_user(email, role='jeweler', password='TestPass123!'):
    return User.objects.create_user(
        username=email.split('@')[0],
        email=email,
        password=password,
        first_name='Test',
        last_name='User',
        role=role,
        business_name='Gioielleria Test' if role == 'jeweler' else None,
    )


def auth_client(user):
    token = Token.objects.create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return client


def make_gift_list(jeweler, **kwargs):
    defaults = {
        'title': 'Lista Matrimonio',
        'description': 'Lista regalo per il matrimonio',
        'target_amount': Decimal('1000.00'),
        'status': GiftList.Status.ACTIVE,
        'is_public': True,
        'list_type': GiftList.ListType.MONEY_COLLECTION,
    }
    defaults.update(kwargs)
    return GiftList.objects.create(jeweler=jeweler, **defaults)


class GiftListCRUDTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('jeweler@test.com', role='jeweler')
        self.other_jeweler = make_user('other@test.com', role='jeweler')
        self.guest = make_user('guest@test.com', role='guest')
        self.client = auth_client(self.jeweler)
        self.list_url = '/api/gift-lists/'

    def test_create_gift_list_as_jeweler(self):
        response = self.client.post(self.list_url, {
            'title': 'Lista Compleanno',
            'target_amount': '500.00',
            'list_type': 'money_collection',
            'status': 'active',
            'is_public': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Lista Compleanno')

    def test_create_gift_list_as_guest_forbidden(self):
        client = auth_client(self.guest)
        response = client.post(self.list_url, {
            'title': 'Lista Ospite',
            'target_amount': '500.00',
            'list_type': 'money_collection',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_gift_lists_only_own(self):
        make_gift_list(self.jeweler, title='Mia Lista')
        make_gift_list(self.other_jeweler, title='Altra Lista')
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [gl['title'] for gl in response.data.get('results', response.data)]
        self.assertIn('Mia Lista', titles)
        self.assertNotIn('Altra Lista', titles)

    def test_update_own_gift_list(self):
        gl = make_gift_list(self.jeweler)
        response = self.client.patch(f'{self.list_url}{gl.id}/', {'title': 'Titolo Aggiornato'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Titolo Aggiornato')

    def test_update_other_jeweler_list_forbidden(self):
        gl = make_gift_list(self.other_jeweler)
        response = self.client.patch(f'{self.list_url}{gl.id}/', {'title': 'Hack'}, format='json')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_delete_own_gift_list(self):
        gl = make_gift_list(self.jeweler)
        response = self.client.delete(f'{self.list_url}{gl.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(GiftList.objects.filter(id=gl.id).exists())

    def test_delete_other_jeweler_list_forbidden(self):
        gl = make_gift_list(self.other_jeweler)
        response = self.client.delete(f'{self.list_url}{gl.id}/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
        self.assertTrue(GiftList.objects.filter(id=gl.id).exists())

    def test_unauthenticated_access_blocked(self):
        client = APIClient()
        response = client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PublicGiftListTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('public@test.com', role='jeweler')
        self.client = APIClient()

    def test_public_list_accessible_without_auth(self):
        gl = make_gift_list(self.jeweler, is_public=True)
        response = self.client.get(f'/api/gift-lists/public/{gl.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_private_list_not_accessible_without_auth(self):
        gl = make_gift_list(self.jeweler, is_public=False)
        response = self.client.get(f'/api/gift-lists/public/{gl.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ContributionTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('contrib@test.com', role='jeweler')
        self.gift_list = make_gift_list(self.jeweler, allow_anonymous_contributions=True)
        self.client = APIClient()

    def _contrib_url(self):
        return f'/api/gift-lists/{self.gift_list.id}/contributions/'

    def test_create_contribution(self):
        response = self.client.post(self._contrib_url(), {
            'contributor_name': 'Anna Verdi',
            'contributor_email': 'anna@test.com',
            'contributor_message': 'Auguri!',
            'is_anonymous': False,
            'amount': '50.00',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_contribution_amount_must_be_positive(self):
        response = self.client.post(self._contrib_url(), {
            'contributor_name': 'Test',
            'contributor_email': 'test@test.com',
            'is_anonymous': False,
            'amount': '-10.00',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_jeweler_can_list_contributions(self):
        Contribution.objects.create(
            gift_list=self.gift_list,
            contributor_name='Mario',
            contributor_email='mario@test.com',
            amount=Decimal('100.00'),
            payment_status=Contribution.PaymentStatus.COMPLETED,
        )
        client = auth_client(self.jeweler)
        response = client.get(self._contrib_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class GiftListModelTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('model@test.com', role='jeweler')

    def test_total_contributions_counts_only_completed(self):
        gl = make_gift_list(self.jeweler, target_amount=Decimal('200.00'))
        Contribution.objects.create(
            gift_list=gl,
            contributor_name='A',
            contributor_email='a@test.com',
            amount=Decimal('100.00'),
            payment_status=Contribution.PaymentStatus.COMPLETED,
        )
        Contribution.objects.create(
            gift_list=gl,
            contributor_name='B',
            contributor_email='b@test.com',
            amount=Decimal('50.00'),
            payment_status=Contribution.PaymentStatus.PENDING,
        )
        self.assertEqual(gl.total_contributions, Decimal('100.00'))

    def test_progress_percentage(self):
        gl = make_gift_list(self.jeweler, target_amount=Decimal('200.00'))
        Contribution.objects.create(
            gift_list=gl,
            contributor_name='A',
            contributor_email='a@test.com',
            amount=Decimal('100.00'),
            payment_status=Contribution.PaymentStatus.COMPLETED,
        )
        self.assertEqual(gl.progress_percentage, 50)

    def test_is_completed_when_target_reached(self):
        gl = make_gift_list(self.jeweler, target_amount=Decimal('100.00'))
        Contribution.objects.create(
            gift_list=gl,
            contributor_name='A',
            contributor_email='a@test.com',
            amount=Decimal('100.00'),
            payment_status=Contribution.PaymentStatus.COMPLETED,
        )
        self.assertTrue(gl.is_completed)
