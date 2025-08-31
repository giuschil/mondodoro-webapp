from django.urls import path
from . import views

urlpatterns = [
    # Stripe Connect onboarding
    path('stripe/onboard/', views.stripe_onboard_view, name='stripe_onboard'),
    path('stripe/onboard/return/', views.stripe_onboard_return_view, name='stripe_onboard_return'),
    path('stripe/onboard/refresh/', views.stripe_onboard_view, name='stripe_onboard_refresh'),
    
    # Stripe payments
    path('stripe/create-payment-intent/', views.create_payment_intent_view, name='create_payment_intent'),
    path('stripe/webhook/', views.stripe_webhook_view, name='stripe_webhook'),
]