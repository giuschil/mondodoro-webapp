"""
Tests for the payments app: Stripe checkout, webhooks, and utility functions.
All Stripe API calls are mocked — no real network requests are made.
"""
import json
import uuid
from decimal import Decimal
from unittest.mock import patch, MagicMock
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token

from apps.accounts.models import User
from apps.gift_lists.models import GiftList, Contribution
from .models import PaymentIntent, StripeAccount, PlatformSettings
from .stripe_utils import (
    handle_payment_succeeded,
    handle_payment_failed,
    handle_checkout_session_completed,
    handle_account_updated,
)


# ─── Helpers ────────────────────────────────────────────────────────────────

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
    return GiftList.objects.create(
        jeweler=jeweler,
        title=kwargs.get('title', 'Lista Matrimonio'),
        target_amount=kwargs.get('target_amount', Decimal('500.00')),
        status=kwargs.get('status', GiftList.Status.ACTIVE),
        is_public=kwargs.get('is_public', True),
        list_type=kwargs.get('list_type', GiftList.ListType.MONEY_COLLECTION),
        allow_anonymous_contributions=kwargs.get('allow_anonymous_contributions', True),
    )


def make_contribution(gift_list, amount='100.00', payment_status=None):
    return Contribution.objects.create(
        gift_list=gift_list,
        contributor_name='Anna Verdi',
        contributor_email='anna@test.com',
        amount=Decimal(amount),
        payment_status=payment_status or Contribution.PaymentStatus.PENDING,
    )


def make_payment_intent(contribution, session_id='cs_test_123', url='https://checkout.stripe.com/test'):
    return PaymentIntent.objects.create(
        contribution=contribution,
        stripe_payment_intent_id=session_id,
        amount=contribution.amount,
        currency='EUR',
        status='pending',
        client_secret=url,
        metadata={'checkout_url': url},
    )


# ─── Payment Intent Creation ─────────────────────────────────────────────────

class CreatePaymentIntentViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/payments/create-payment-intent/'
        self.jeweler = make_user('pi@test.com', role='jeweler')
        self.gift_list = make_gift_list(self.jeweler)
        self.contribution = make_contribution(self.gift_list)

    def _mock_checkout_session(self):
        session = MagicMock()
        session.id = 'cs_test_abc123'
        session.url = 'https://checkout.stripe.com/pay/cs_test_abc123'
        return session

    @patch('apps.payments.stripe_utils.stripe.checkout.Session.create')
    def test_create_payment_intent_success(self, mock_create):
        mock_create.return_value = self._mock_checkout_session()
        response = self.client.post(self.url, {
            'contribution_id': str(self.contribution.id),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('checkout_url', response.data)
        self.assertIn('session_id', response.data)

    @patch('apps.payments.stripe_utils.stripe.checkout.Session.create')
    def test_create_payment_intent_creates_db_record(self, mock_create):
        mock_create.return_value = self._mock_checkout_session()
        self.client.post(self.url, {
            'contribution_id': str(self.contribution.id),
        }, format='json')
        self.assertTrue(PaymentIntent.objects.filter(contribution=self.contribution).exists())

    def test_create_payment_intent_missing_contribution_id(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_intent_nonexistent_contribution(self):
        response = self.client.post(self.url, {
            'contribution_id': str(uuid.uuid4()),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('apps.payments.stripe_utils.stripe.checkout.Session.create')
    def test_create_payment_intent_already_processed_blocked(self, mock_create):
        self.contribution.payment_status = Contribution.PaymentStatus.COMPLETED
        self.contribution.save()
        response = self.client.post(self.url, {
            'contribution_id': str(self.contribution.id),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_create.assert_not_called()

    @patch('apps.payments.stripe_utils.stripe.checkout.Session.create')
    def test_create_payment_intent_expired_contribution_blocked(self, mock_create):
        # Directly update the created_at using queryset update to bypass auto_now logic
        Contribution.objects.filter(id=self.contribution.id).update(
            created_at=timezone.now() - timedelta(hours=2)
        )
        response = self.client.post(self.url, {
            'contribution_id': str(self.contribution.id),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_create.assert_not_called()

    @patch('apps.payments.stripe_utils.stripe.checkout.Session.create')
    def test_create_payment_intent_inactive_list_blocked(self, mock_create):
        self.gift_list.status = GiftList.Status.CANCELLED
        self.gift_list.save()
        response = self.client.post(self.url, {
            'contribution_id': str(self.contribution.id),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_create.assert_not_called()

    @patch('apps.payments.stripe_utils.stripe.checkout.Session.create')
    def test_create_payment_intent_stripe_error_handled(self, mock_create):
        import stripe
        mock_create.side_effect = stripe.StripeError('Card declined')
        response = self.client.post(self.url, {
            'contribution_id': str(self.contribution.id),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Stripe error', response.data.get('error', ''))


# ─── Webhook Handler ─────────────────────────────────────────────────────────

class StripeWebhookViewTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/payments/stripe/webhook/'
        self.jeweler = make_user('wh@test.com')
        self.gift_list = make_gift_list(self.jeweler)
        self.contribution = make_contribution(self.gift_list)
        self.payment_intent = make_payment_intent(self.contribution)

    def _post_webhook(self, event_type, data, event_id=None):
        event = {
            'id': event_id or f'evt_{uuid.uuid4().hex}',
            'type': event_type,
            'data': {'object': data},
        }
        with patch('stripe.Webhook.construct_event', return_value=event):
            return self.client.post(
                self.url,
                data=json.dumps({'type': event_type}),
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE='t=123,v1=sig',
            )

    def test_checkout_session_completed_updates_contribution(self):
        self._post_webhook('checkout.session.completed', {
            'id': self.payment_intent.stripe_payment_intent_id,
            'metadata': {'contribution_id': str(self.contribution.id)},
        })
        self.contribution.refresh_from_db()
        self.assertEqual(self.contribution.payment_status, Contribution.PaymentStatus.COMPLETED)

    def test_webhook_invalid_signature_returns_400(self):
        import stripe
        with patch('stripe.Webhook.construct_event',
                   side_effect=stripe.SignatureVerificationError('Bad sig', 'sig')):
            response = self.client.post(
                self.url,
                data=json.dumps({}),
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE='bad',
            )
        self.assertEqual(response.status_code, 400)

    def test_webhook_idempotency_duplicate_event_ignored(self):
        event_id = f'evt_{uuid.uuid4().hex}'
        data = {
            'id': self.payment_intent.stripe_payment_intent_id,
            'metadata': {'contribution_id': str(self.contribution.id)},
        }
        # First call processes the event
        self._post_webhook('checkout.session.completed', data, event_id=event_id)
        # Second call with same event_id should return 200 without reprocessing
        response = self._post_webhook('checkout.session.completed', data, event_id=event_id)
        self.assertEqual(response.status_code, 200)


# ─── Stripe Utility Functions ────────────────────────────────────────────────

class HandlePaymentSucceededTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('hps@test.com')
        self.gift_list = make_gift_list(self.jeweler)
        self.contribution = make_contribution(self.gift_list)
        self.pi = make_payment_intent(self.contribution)

    def test_handle_payment_succeeded_updates_db(self):
        result = handle_payment_succeeded({'id': self.pi.stripe_payment_intent_id})
        self.assertTrue(result)
        self.pi.refresh_from_db()
        self.assertEqual(self.pi.status, 'succeeded')
        self.contribution.refresh_from_db()
        self.assertEqual(self.contribution.payment_status, Contribution.PaymentStatus.COMPLETED)
        self.assertIsNotNone(self.contribution.completed_at)

    def test_handle_payment_succeeded_unknown_id_returns_false(self):
        result = handle_payment_succeeded({'id': 'pi_nonexistent'})
        self.assertFalse(result)


class HandlePaymentFailedTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('hpf@test.com')
        self.gift_list = make_gift_list(self.jeweler)
        self.contribution = make_contribution(self.gift_list)
        self.pi = make_payment_intent(self.contribution)

    def test_handle_payment_failed_updates_db(self):
        result = handle_payment_failed({'id': self.pi.stripe_payment_intent_id})
        self.assertTrue(result)
        self.pi.refresh_from_db()
        self.assertEqual(self.pi.status, 'payment_failed')
        self.contribution.refresh_from_db()
        self.assertEqual(self.contribution.payment_status, Contribution.PaymentStatus.FAILED)

    def test_handle_payment_failed_unknown_id_returns_false(self):
        result = handle_payment_failed({'id': 'pi_nonexistent'})
        self.assertFalse(result)


class HandleCheckoutSessionCompletedTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('hcs@test.com')
        self.gift_list = make_gift_list(self.jeweler)
        self.contribution = make_contribution(self.gift_list)
        self.pi = make_payment_intent(self.contribution)

    def test_checkout_session_completed_marks_contribution_completed(self):
        result = handle_checkout_session_completed({
            'id': self.pi.stripe_payment_intent_id,
            'metadata': {'contribution_id': str(self.contribution.id)},
        })
        self.assertTrue(result)
        self.contribution.refresh_from_db()
        self.assertEqual(self.contribution.payment_status, Contribution.PaymentStatus.COMPLETED)

    def test_checkout_session_no_metadata_returns_false(self):
        result = handle_checkout_session_completed({
            'id': self.pi.stripe_payment_intent_id,
            'metadata': {},
        })
        self.assertFalse(result)

    def test_checkout_session_unknown_session_id_returns_false(self):
        result = handle_checkout_session_completed({
            'id': 'cs_nonexistent',
            'metadata': {'contribution_id': str(self.contribution.id)},
        })
        self.assertFalse(result)


class HandleAccountUpdatedTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('hau@test.com')
        self.stripe_account = StripeAccount.objects.create(
            jeweler=self.jeweler,
            stripe_account_id='acct_test123',
            account_status=StripeAccount.AccountStatus.PENDING,
        )

    def test_account_updated_to_active(self):
        result = handle_account_updated({
            'id': 'acct_test123',
            'charges_enabled': True,
            'payouts_enabled': True,
            'details_submitted': True,
        })
        self.assertTrue(result)
        self.stripe_account.refresh_from_db()
        self.assertEqual(self.stripe_account.account_status, StripeAccount.AccountStatus.ACTIVE)
        self.assertTrue(self.stripe_account.onboarding_completed)

    def test_account_updated_restricted(self):
        result = handle_account_updated({
            'id': 'acct_test123',
            'charges_enabled': False,
            'payouts_enabled': False,
            'details_submitted': False,
        })
        self.assertTrue(result)
        self.stripe_account.refresh_from_db()
        self.assertEqual(self.stripe_account.account_status, StripeAccount.AccountStatus.RESTRICTED)

    def test_account_updated_unknown_account_returns_false(self):
        result = handle_account_updated({
            'id': 'acct_nonexistent',
            'charges_enabled': True,
            'payouts_enabled': True,
            'details_submitted': True,
        })
        self.assertFalse(result)


# ─── Stripe Onboarding ───────────────────────────────────────────────────────

class StripeOnboardingViewTests(TestCase):

    def setUp(self):
        self.jeweler = make_user('onboard@test.com')
        self.client = auth_client(self.jeweler)
        self.url = '/api/payments/stripe/onboard/'

    @patch('apps.payments.views.create_stripe_account')
    @patch('apps.payments.views.create_onboarding_link')
    def test_jeweler_can_start_onboarding(self, mock_link, mock_create):
        mock_acct = MagicMock()
        mock_acct.id = 'acct_new123'
        mock_create.return_value = mock_acct

        mock_link_obj = MagicMock()
        mock_link_obj.url = 'https://connect.stripe.com/setup/s/acct_new123'
        mock_link.return_value = mock_link_obj

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('onboarding_url', response.data)

    def test_guest_cannot_start_onboarding(self):
        guest = make_user('guest_onb@test.com', role='guest')
        client = auth_client(guest)
        response = client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_start_onboarding(self):
        response = APIClient().post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ─── Platform Settings ───────────────────────────────────────────────────────

class PlatformSettingsTests(TestCase):

    def test_load_creates_default_settings(self):
        settings_obj = PlatformSettings.load()
        self.assertEqual(settings_obj.platform_fee_percentage, Decimal('2.5'))
        self.assertEqual(settings_obj.platform_fee_fixed, Decimal('0.30'))

    def test_singleton_only_one_instance(self):
        PlatformSettings.load()
        PlatformSettings.load()
        self.assertEqual(PlatformSettings.objects.count(), 1)
