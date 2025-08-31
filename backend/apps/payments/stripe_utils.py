import stripe
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from .models import StripeAccount, PaymentIntent, PlatformSettings
from apps.gift_lists.models import Contribution

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


def create_stripe_account(user):
    """Create Stripe Connect account for jeweler"""
    account = stripe.Account.create(
        type='express',
        country='IT',
        email=user.email,
        capabilities={
            'card_payments': {'requested': True},
            'transfers': {'requested': True},
        },
        business_type='individual',
        individual={
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        },
        business_profile={
            'name': user.business_name or f"{user.first_name} {user.last_name}",
            'product_description': 'Gioielleria - Liste regalo online',
            'support_email': user.email,
        }
    )
    return account


def create_onboarding_link(account_id, refresh_url, return_url):
    """Create Stripe onboarding link"""
    account_link = stripe.AccountLink.create(
        account=account_id,
        refresh_url=refresh_url,
        return_url=return_url,
        type='account_onboarding',
    )
    return account_link


def create_payment_intent_for_contribution(contribution):
    """Create Stripe payment intent for contribution"""
    # Get jeweler's Stripe account
    jeweler = contribution.gift_list.jeweler
    stripe_account = StripeAccount.objects.get(
        jeweler=jeweler,
        account_status=StripeAccount.AccountStatus.ACTIVE
    )
    
    # Calculate platform fee
    platform_settings = PlatformSettings.load()
    amount_cents = int(contribution.amount * 100)  # Convert to cents
    
    # Calculate application fee (platform commission)
    fee_percentage = platform_settings.platform_fee_percentage / 100
    fee_fixed_cents = int(platform_settings.platform_fee_fixed * 100)
    application_fee = int(amount_cents * fee_percentage) + fee_fixed_cents
    
    # Create payment intent
    payment_intent = stripe.PaymentIntent.create(
        amount=amount_cents,
        currency='eur',
        application_fee_amount=application_fee,
        transfer_data={
            'destination': stripe_account.stripe_account_id,
        },
        metadata={
            'contribution_id': str(contribution.id),
            'gift_list_id': str(contribution.gift_list.id),
            'jeweler_id': str(jeweler.id),
        }
    )
    
    # Save payment intent to database
    payment_intent_obj = PaymentIntent.objects.create(
        contribution=contribution,
        stripe_payment_intent_id=payment_intent.id,
        amount=contribution.amount,
        currency='EUR',
        status=payment_intent.status,
        client_secret=payment_intent.client_secret,
        application_fee_amount=Decimal(application_fee) / 100,
        metadata={
            'platform_fee_percentage': float(platform_settings.platform_fee_percentage),
            'platform_fee_fixed': float(platform_settings.platform_fee_fixed),
        }
    )
    
    return payment_intent_obj


def handle_payment_succeeded(payment_intent_data):
    """Handle successful payment webhook"""
    try:
        pi_obj = PaymentIntent.objects.get(
            stripe_payment_intent_id=payment_intent_data['id']
        )
        
        # Update payment intent
        pi_obj.status = 'succeeded'
        pi_obj.save()
        
        # Update contribution
        contribution = pi_obj.contribution
        contribution.payment_status = Contribution.PaymentStatus.COMPLETED
        contribution.completed_at = timezone.now()
        contribution.save()
        
        return True
        
    except PaymentIntent.DoesNotExist:
        return False


def handle_payment_failed(payment_intent_data):
    """Handle failed payment webhook"""
    try:
        pi_obj = PaymentIntent.objects.get(
            stripe_payment_intent_id=payment_intent_data['id']
        )
        
        # Update payment intent
        pi_obj.status = 'payment_failed'
        pi_obj.save()
        
        # Update contribution
        contribution = pi_obj.contribution
        contribution.payment_status = Contribution.PaymentStatus.FAILED
        contribution.save()
        
        return True
        
    except PaymentIntent.DoesNotExist:
        return False


def handle_account_updated(account_data):
    """Handle Stripe account update webhook"""
    try:
        stripe_account = StripeAccount.objects.get(
            stripe_account_id=account_data['id']
        )
        
        # Update account status
        stripe_account.charges_enabled = account_data['charges_enabled']
        stripe_account.payouts_enabled = account_data['payouts_enabled']
        stripe_account.onboarding_completed = account_data['details_submitted']
        
        if account_data['charges_enabled'] and account_data['payouts_enabled']:
            stripe_account.account_status = StripeAccount.AccountStatus.ACTIVE
        else:
            stripe_account.account_status = StripeAccount.AccountStatus.RESTRICTED
        
        stripe_account.save()
        
        # Update user model
        user = stripe_account.jeweler
        user.stripe_onboarding_completed = stripe_account.onboarding_completed
        user.save()
        
        return True
        
    except StripeAccount.DoesNotExist:
        return False
