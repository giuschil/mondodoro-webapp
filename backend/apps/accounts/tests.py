"""
Tests for the accounts app: registration, login, profile, password change, password reset.
"""
from django.test import TestCase
from django.urls import reverse
from django.core import mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import User


def make_user(email='test@example.com', password='TestPass123!', role='jeweler', **kwargs):
    """Helper to create a user."""
    return User.objects.create_user(
        username=email.split('@')[0],
        email=email,
        password=password,
        first_name=kwargs.get('first_name', 'Mario'),
        last_name=kwargs.get('last_name', 'Rossi'),
        role=role,
    )


class RegisterViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = reverse('accounts:register')

    def _payload(self, **overrides):
        data = {
            'username': 'gioielliere1',
            'email': 'gioielliere@test.com',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'first_name': 'Luca',
            'last_name': 'Bianchi',
            'role': 'jeweler',
        }
        data.update(overrides)
        return data

    def test_register_jeweler_success(self):
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['role'], 'jeweler')

    def test_register_guest_success(self):
        response = self.client.post(self.url, self._payload(role='guest'), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_password_mismatch(self):
        response = self.client.post(
            self.url,
            self._payload(password_confirm='WrongPass!'),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        make_user(email='gioielliere@test.com')
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_superadmin_blocked(self):
        response = self.client.post(self.url, self._payload(role='superadmin'), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password_blocked(self):
        response = self.client.post(
            self.url,
            self._payload(password='short', password_confirm='short'),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = reverse('accounts:login')
        self.user = make_user(email='login@test.com', password='TestPass123!')

    def test_login_with_email(self):
        response = self.client.post(
            self.url,
            {'email': 'login@test.com', 'password': 'TestPass123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_with_username(self):
        response = self.client.post(
            self.url,
            {'username': self.user.username, 'password': 'TestPass123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_wrong_password(self):
        response = self.client.post(
            self.url,
            {'email': 'login@test.com', 'password': 'WrongPass!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self):
        response = self.client.post(
            self.url,
            {'email': 'nobody@test.com', 'password': 'TestPass123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_inactive_user_blocked(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.post(
            self.url,
            {'email': 'login@test.com', 'password': 'TestPass123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ProfileViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(email='profile@test.com')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.url = reverse('accounts:profile')

    def test_get_profile_authenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@test.com')

    def test_get_profile_unauthenticated(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile(self):
        response = self.client.patch(
            self.url,
            {'first_name': 'Giulia', 'phone': '+393331234567'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Giulia')


class ChangePasswordViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(email='chpw@test.com', password='OldPass123!')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.url = reverse('accounts:change_password')

    def test_change_password_success(self):
        response = self.client.post(self.url, {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        # Old token should be invalidated
        old_token_exists = Token.objects.filter(key=self.token.key).exists()
        self.assertFalse(old_token_exists)

    def test_change_password_wrong_old_password(self):
        response = self.client.post(self.url, {
            'old_password': 'WrongOld!',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_mismatch(self):
        response = self.client.post(self.url, {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'DifferentPass!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ForgotPasswordViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = reverse('accounts:forgot_password')
        self.user = make_user(email='forgot@test.com')

    def test_forgot_password_sends_email(self):
        response = self.client.post(self.url, {'email': 'forgot@test.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('forgot@test.com', mail.outbox[0].to)
        self.assertIn('reset', mail.outbox[0].body.lower())

    def test_forgot_password_nonexistent_email_still_200(self):
        """Must not reveal whether the email exists."""
        response = self.client.post(self.url, {'email': 'nobody@test.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_forgot_password_invalid_email_format(self):
        response = self.client.post(self.url, {'email': 'not-an-email'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_forgot_password_inactive_user_no_email(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.post(self.url, {'email': 'forgot@test.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)


class ResetPasswordViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = reverse('accounts:reset_password')
        self.user = make_user(email='reset@test.com', password='OldPass123!')

    def _make_reset_payload(self, new_password='NewPass456!', confirm=None):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        return {
            'uid': uid,
            'token': token,
            'new_password': new_password,
            'new_password_confirm': confirm if confirm is not None else new_password,
        }

    def test_reset_password_success(self):
        payload = self._make_reset_payload()
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456!'))

    def test_reset_password_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        response = self.client.post(self.url, {
            'uid': uid,
            'token': 'invalid-token',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_invalid_uid(self):
        response = self.client.post(self.url, {
            'uid': 'invalid-uid',
            'token': 'some-token',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_mismatch(self):
        payload = self._make_reset_payload(confirm='DifferentPass!')
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_token_used_only_once(self):
        """After a successful reset the old token must no longer work."""
        payload = self._make_reset_payload()
        self.client.post(self.url, payload, format='json')
        # Try to reuse the same token
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class MeViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = make_user(email='me@test.com')
        self.token = Token.objects.create(user=self.user)

    def test_me_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get(reverse('accounts:me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'me@test.com')

    def test_me_unauthenticated(self):
        response = self.client.get(reverse('accounts:me'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
