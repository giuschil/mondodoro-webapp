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
    create_payment_intent_for_contribution,
    handle_payment_succeeded,
    handle_payment_failed,
    handle_account_updated
)
from apps.gift_lists.models import Contribution
from apps.accounts.models import User

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


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
        account_link = create_onboarding_link(
            stripe_account.stripe_account_id,
            request.build_absolute_uri('/api/payments/stripe/onboard/refresh/'),
            request.build_absolute_uri('/api/payments/stripe/onboard/return/')
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
    description="Handle return from Stripe Connect onboarding",
    tags=["Stripe Connect"]
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stripe_onboard_return_view(request):
    """Handle return from Stripe Connect onboarding"""
    user = request.user
    
    try:
        stripe_account = StripeAccount.objects.get(jeweler=user)
        
        # Retrieve account from Stripe to check status
        account = stripe.Account.retrieve(stripe_account.stripe_account_id)
        
        # Update local account status
        stripe_account.charges_enabled = account.charges_enabled
        stripe_account.payouts_enabled = account.payouts_enabled
        stripe_account.onboarding_completed = account.details_submitted
        
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
            'payouts_enabled': stripe_account.payouts_enabled
        })
        
    except StripeAccount.DoesNotExist:
        return Response(
            {'error': 'Stripe account not found'},
            status=status.HTTP_404_NOT_FOUND
        )
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
    try:
        contribution_id = request.data.get('contribution_id')
        
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
        
        # Check if payment intent already exists
        if hasattr(contribution, 'payment_intent'):
            payment_intent_obj = contribution.payment_intent
            
            # Retrieve from Stripe to check status
            stripe_pi = stripe.PaymentIntent.retrieve(payment_intent_obj.stripe_payment_intent_id)
            
            if stripe_pi.status in ['succeeded', 'processing']:
                return Response(
                    {'error': 'Payment already processed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({
                'client_secret': payment_intent_obj.client_secret,
                'payment_intent_id': payment_intent_obj.stripe_payment_intent_id
            })
        
        # Create new payment intent
        payment_intent_obj = create_payment_intent_for_contribution(contribution)
        
        return Response({
            'client_secret': payment_intent_obj.client_secret,
            'payment_intent_id': payment_intent_obj.stripe_payment_intent_id
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
        if event['type'] == 'payment_intent.succeeded':
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