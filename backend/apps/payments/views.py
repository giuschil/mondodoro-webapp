import stripe
import json
from decimal import Decimal
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import StripeAccount, PaymentIntent, WebhookEvent, PlatformSettings
from .stripe_utils import (
    create_stripe_account,
    create_onboarding_link,
    create_stripe_checkout_session,
    handle_payment_succeeded,
    handle_payment_failed,
    handle_checkout_session_completed,
    handle_account_updated
)
from apps.gift_lists.models import Contribution
from apps.accounts.models import User

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Debug: Check if Stripe is configured
print(f"DEBUG: Stripe configured with key: {stripe.api_key[:20] if stripe.api_key else 'None'}...")


@extend_schema(
    summary="Create Stripe onboarding link",
    description="Create Stripe Connect onboarding link for jeweler",
    tags=["Stripe Connect"]
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def stripe_onboard_view(request):
    """Create Stripe Connect onboarding link for jeweler"""
    user = request.user
    
    if user.role != User.UserRole.JEWELER:
        return Response(
            {'error': 'Only jewelers can create Stripe accounts'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Check if user already has a Stripe account
        stripe_account, created = StripeAccount.objects.get_or_create(
            jeweler=user,
            defaults={'stripe_account_id': ''}
        )
        
        if not stripe_account.stripe_account_id:
            # Create Stripe Connect account
            account = create_stripe_account(user)
            stripe_account.stripe_account_id = account.id
            stripe_account.save()
        
        # Create onboarding link
        base_url = settings.BASE_URL
        account_link = create_onboarding_link(
            stripe_account.stripe_account_id,
            f'{base_url}/dashboard/profile?stripe=refresh',
            f'{base_url}/dashboard/profile?stripe=success'
        )
        
        return Response({
            'onboarding_url': account_link.url,
            'account_id': stripe_account.stripe_account_id
        })
        
    except stripe.error.StripeError as e:
        return Response(
            {'error': f'Stripe error: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Handle Stripe onboarding return",
    description="Handle return from Stripe Connect onboarding and get account status",
    tags=["Stripe Connect"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stripe_onboard_return_view(request):
    """Handle return from Stripe Connect onboarding and get account status"""
    user = request.user
    
    if user.role != User.UserRole.JEWELER:
        return Response(
            {'error': 'Only jewelers can access Stripe account'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        stripe_account = StripeAccount.objects.get(jeweler=user)
        
        # Retrieve account from Stripe to check status
        account = stripe.Account.retrieve(stripe_account.stripe_account_id)
        
        # Update local account status
        stripe_account.charges_enabled = account.charges_enabled
        stripe_account.payouts_enabled = account.payouts_enabled
        stripe_account.onboarding_completed = account.details_submitted
        stripe_account.country = account.country
        stripe_account.currency = account.default_currency or 'eur'
        
        if account.charges_enabled and account.payouts_enabled:
            stripe_account.account_status = StripeAccount.AccountStatus.ACTIVE
        else:
            stripe_account.account_status = StripeAccount.AccountStatus.RESTRICTED
        
        stripe_account.save()
        
        # Update user model
        user.stripe_account_id = stripe_account.stripe_account_id
        user.stripe_onboarding_completed = stripe_account.onboarding_completed
        user.save()
        
        return Response({
            'success': True,
            'onboarding_completed': stripe_account.onboarding_completed,
            'charges_enabled': stripe_account.charges_enabled,
            'payouts_enabled': stripe_account.payouts_enabled,
            'account_id': stripe_account.stripe_account_id,
            'account_status': stripe_account.account_status,
            'country': stripe_account.country,
            'currency': stripe_account.currency.upper(),
        })
        
    except StripeAccount.DoesNotExist:
        return Response({
            'success': False,
            'onboarding_completed': False,
            'charges_enabled': False,
            'payouts_enabled': False,
            'account_id': None,
            'account_status': 'pending',
            'message': 'Stripe account not found. Please complete onboarding.'
        })
    except Exception as e:
        return Response(
            {'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Create payment intent",
    description="Create Stripe payment intent for contribution",
    tags=["Payments"]
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_payment_intent_view(request):
    """Create Stripe payment intent for contribution"""
    # Configure Stripe API key at function level
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        # Parse JSON data
        data = request.data
        
        contribution_id = data.get('contribution_id')
        
        if not contribution_id:
            return Response(
                {'error': 'contribution_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get contribution
        try:
            contribution = Contribution.objects.get(id=contribution_id)
        except Contribution.DoesNotExist:
            return Response(
                {'error': 'Contribution not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Always create a new Stripe Checkout session (simplest approach)
        payment_intent_obj = create_stripe_checkout_session(contribution)
        
        return Response({
            'checkout_url': payment_intent_obj.client_secret,  # This is the checkout URL
            'session_id': payment_intent_obj.stripe_payment_intent_id
        })
        
    except stripe.error.StripeError as e:
        import traceback
        print(f"DEBUG: Stripe error in create_payment_intent_view: {e}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return Response(
            {'error': f'Stripe error: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        import traceback
        print(f"DEBUG: Error in create_payment_intent_view: {e}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return Response(
            {'error': f'Server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Stripe webhook handler",
    description="Handle Stripe webhook events",
    tags=["Webhooks"]
)
@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook_view(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return HttpResponse(status=400)
    
    # Store webhook event
    webhook_event, created = WebhookEvent.objects.get_or_create(
        stripe_event_id=event['id'],
        defaults={
            'event_type': event['type'],
            'data': event['data'],
            'processed': False
        }
    )
    
    if not created and webhook_event.processed:
        # Event already processed
        return HttpResponse(status=200)
    
    try:
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            handle_checkout_session_completed(event['data']['object'])
        elif event['type'] == 'payment_intent.succeeded':
            handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'payment_intent.payment_failed':
            handle_payment_failed(event['data']['object'])
        elif event['type'] == 'account.updated':
            handle_account_updated(event['data']['object'])
        
        # Mark event as processed
        webhook_event.processed = True
        webhook_event.save()
        
    except Exception as e:
        # Log error
        webhook_event.error_message = str(e)
        webhook_event.save()
        return HttpResponse(status=500)
    
    return HttpResponse(status=200)


@extend_schema(
    summary="Confirm payment",
    description="Confirm payment completion",
    tags=["Payments"]
)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def confirm_payment_view(request):
    """Confirm payment completion"""
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response(
                {'error': 'payment_intent_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get payment intent from database
        try:
            payment_intent_obj = PaymentIntent.objects.get(stripe_payment_intent_id=payment_intent_id)
        except PaymentIntent.DoesNotExist:
            return Response(
                {'error': 'Payment intent not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Retrieve from Stripe to get latest status
        stripe_pi = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Update local payment intent
        payment_intent_obj.status = stripe_pi.status
        payment_intent_obj.save()
        
        # Update contribution if payment succeeded
        if stripe_pi.status == 'succeeded':
            contribution = payment_intent_obj.contribution
            contribution.payment_status = Contribution.PaymentStatus.COMPLETED
            contribution.completed_at = timezone.now()
            contribution.save()
            
            return Response({
                'success': True,
                'message': 'Payment confirmed successfully'
            })
        else:
            return Response({
                'success': False,
                'message': f'Payment status: {stripe_pi.status}'
            })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Get platform settings",
    description="Get platform payment settings (admin only)",
    tags=["Platform"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def platform_settings_view(request):
    """Get platform settings"""
    try:
        settings_obj, created = PlatformSettings.objects.get_or_create(
            defaults={
                'stripe_platform_fee_percentage': 2.5,
                'stripe_application_fee_percentage': 1.0
            }
        )
        
        return Response({
            'stripe_platform_fee_percentage': settings_obj.stripe_platform_fee_percentage,
            'stripe_application_fee_percentage': settings_obj.stripe_application_fee_percentage,
            'stripe_webhook_enabled': settings_obj.stripe_webhook_enabled,
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )