import stripe
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from .models import StripeAccount, PaymentIntent, PlatformSettings
from apps.gift_lists.models import Contribution

# Configure Stripe - moved to function level to ensure settings are loaded


def create_stripe_account(user):
    """Create Stripe Connect account for jeweler"""
    # Configure Stripe API key
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
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
    # Configure Stripe API key
    stripe.api_key = settings.STRIPE_SECRET_KEY

    account_link = stripe.AccountLink.create(
        account=account_id,
        refresh_url=refresh_url,
        return_url=return_url,
        type='account_onboarding',
    )
    return account_link


def create_stripe_checkout_session(contribution):
    """Create Stripe Checkout session for contribution with Stripe Connect support"""
    # Configure Stripe API key at function level
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    if not stripe.api_key:
        raise Exception("Stripe API key not configured")
    
    jeweler = contribution.gift_list.jeweler
    amount_cents = int(contribution.amount * 100)  # Convert to cents
    
    # Get platform settings
    platform_settings = PlatformSettings.load()
    
    # Calculate platform fee (percentage + fixed)
    platform_fee_percentage = platform_settings.platform_fee_percentage
    platform_fee_fixed = platform_settings.platform_fee_fixed
    platform_fee_amount = (contribution.amount * platform_fee_percentage / 100) + platform_fee_fixed
    platform_fee_cents = int(platform_fee_amount * 100)
    
    # Get the base URL from settings
    base_url = getattr(settings, 'BASE_URL', 'https://www.listdreams.it')
    
    # Check if jeweler has Stripe Connect account
    stripe_account_id = None
    application_fee_amount = None
    
    try:
        stripe_account = StripeAccount.objects.get(jeweler=jeweler)
        if stripe_account.stripe_account_id and stripe_account.charges_enabled:
            stripe_account_id = stripe_account.stripe_account_id
            application_fee_amount = platform_fee_cents
    except StripeAccount.DoesNotExist:
        pass
    
    # Build checkout session parameters
    checkout_params = {
        'payment_method_types': ['card'],
        'line_items': [{
            'price_data': {
                'currency': 'eur',
                'product_data': {
                    'name': f'Contributo per {contribution.gift_list.title}',
                    'description': f'Regalo per {contribution.gift_list.title} - {contribution.contributor_name}',
                },
                'unit_amount': amount_cents,
            },
            'quantity': 1,
        }],
        'mode': 'payment',
        'success_url': f'{base_url}/lists/{contribution.gift_list.id}?payment=success&session_id={{CHECKOUT_SESSION_ID}}',
        'cancel_url': f'{base_url}/lists/{contribution.gift_list.id}?payment=cancelled',
        'metadata': {
            'contribution_id': str(contribution.id),
            'gift_list_id': str(contribution.gift_list.id),
            'jeweler_id': str(jeweler.id),
            'contributor_name': contribution.contributor_name,
            'contributor_email': contribution.contributor_email,
        },
        'customer_email': contribution.contributor_email,
        'custom_text': {
            'submit': {
                'message': 'Grazie per il tuo contributo! ❤️'
            }
        },
    }
    
    # If jeweler has Stripe Connect account, use it
    if stripe_account_id:
        checkout_params['stripe_account'] = stripe_account_id
        checkout_params['payment_intent_data'] = {
            'application_fee_amount': application_fee_amount,
        }
    
    # Create Stripe Checkout session
    checkout_session = stripe.checkout.Session.create(**checkout_params)
    
    # Save checkout session to database
    payment_intent_obj = PaymentIntent.objects.create(
        contribution=contribution,
        stripe_payment_intent_id=checkout_session.id,  # Use session ID
        amount=contribution.amount,
        currency='EUR',
        status='pending',
        client_secret=checkout_session.url,  # Use checkout URL as client_secret
        application_fee_amount=Decimal(str(platform_fee_amount)),
        metadata={
            'checkout_mode': True,
            'session_id': checkout_session.id,
            'checkout_url': checkout_session.url,
            'stripe_account_id': stripe_account_id,
            'platform_fee': str(platform_fee_amount),
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


def handle_checkout_session_completed(session_data):
    """Handle completed Stripe Checkout session webhook"""
    try:
        # Get contribution ID from metadata
        contribution_id = session_data.get('metadata', {}).get('contribution_id')
        
        if not contribution_id:
            print(f"DEBUG: No contribution_id in session metadata: {session_data.get('metadata')}")
            return False
        
        # Find payment intent by session ID
        pi_obj = PaymentIntent.objects.get(
            stripe_payment_intent_id=session_data['id']
        )
        
        # Update payment intent
        pi_obj.status = 'succeeded'
        pi_obj.save()
        
        # Update contribution
        contribution = pi_obj.contribution
        contribution.payment_status = Contribution.PaymentStatus.COMPLETED
        contribution.completed_at = timezone.now()
        contribution.save()
        
        print(f"DEBUG: Successfully processed checkout session for contribution {contribution_id}")
        return True
        
    except PaymentIntent.DoesNotExist:
        print(f"DEBUG: PaymentIntent not found for session {session_data['id']}")
        return False
    except Exception as e:
        print(f"DEBUG: Error in handle_checkout_session_completed: {e}")
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
