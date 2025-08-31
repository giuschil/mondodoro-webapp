from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Stripe Connect onboarding
    path('stripe/onboard/', views.stripe_onboard_view, name='stripe_onboard'),
    path('stripe/onboard/return/', views.stripe_onboard_return_view, name='stripe_onboard_return'),
    path('stripe/onboard/refresh/', views.stripe_onboard_refresh_view, name='stripe_onboard_refresh'),
    
    # Payment processing
    path('create-payment-intent/', views.create_payment_intent_view, name='create_payment_intent'),
    path('confirm-payment/', views.confirm_payment_view, name='confirm_payment'),
    
    # Webhooks
    path('stripe/webhook/', views.stripe_webhook_view, name='stripe_webhook'),
    
    # Platform settings (admin only)
    path('settings/', views.platform_settings_view, name='platform_settings'),
]
