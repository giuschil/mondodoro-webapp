import os
import django
import stripe
import time
import json
import requests
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mondodoro.settings')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from apps.payments.models import StripeAccount
from apps.payments.stripe_utils import create_stripe_account, create_onboarding_link

User = get_user_model()

def simulate_onboarding():
    print("\n--- Starting Onboarding Simulation ---")
    
    # 1. Get or Create Jeweler User
    username = "test_jeweler_" + str(int(time.time()))
    email = f"{username}@example.com"
    
    try:
        jeweler = User.objects.create_user(
            username=username,
            email=email,
            password="password123",
            role=User.UserRole.JEWELER,
            business_name="Test Jewelry Store"
        )
        print(f"Created Test Jeweler: {jeweler.username}")
    except Exception as e:
        print(f"Error creating user: {e}")
        return

    # 2. Create Stripe Connect Account (Real call to Stripe API)
    print("Contacting Stripe to create Connect Account...")
    try:
        stripe_account_obj, created = StripeAccount.objects.get_or_create(
            jeweler=jeweler,
            defaults={'stripe_account_id': ''}
        )
        
        if not stripe_account_obj.stripe_account_id:
            account = create_stripe_account(jeweler)
            stripe_account_obj.stripe_account_id = account.id
            stripe_account_obj.save()
            print(f"Stripe Account Created: {account.id}")
        else:
            print(f"Using existing Stripe Account: {stripe_account_obj.stripe_account_id}")

    except Exception as e:
        print(f"Error creating Stripe account: {e}")
        return

    # 3. Generate Onboarding Link
    print("Generating Onboarding Link...")
    try:
        base_url = "http://localhost:3000"
        account_link = create_onboarding_link(
            stripe_account_obj.stripe_account_id,
            f'{base_url}/dashboard/profile?stripe=refresh',
            f'{base_url}/dashboard/profile?stripe=success'
        )
        print(f"\n>>> ONBOARDING URL: {account_link.url} <<<\n")
        print("ACTION REQUIRED: Copy the URL above and open it in your browser to complete onboarding.")
        print("Use these test values:")
        print("- Phone: 000 000 0000")
        print("- Code: 000 000")
        print("- IBAN: Use the test IBAN provided by Stripe button")
        
    except Exception as e:
        print(f"Error generating link: {e}")
        return

    # 4. Wait for user action or simulate webhook
    print("\nWaiting for you to complete onboarding in the browser...")
    print("Once you are done, press ENTER to verify status...")
    input()
    
    # 5. Verify Status via API (Simulating frontend check)
    print("Verifying account status with Stripe...")
    try:
        # We use the internal logic directly to verify
        stripe.api_key = settings.STRIPE_SECRET_KEY
        account = stripe.Account.retrieve(stripe_account_obj.stripe_account_id)
        
        print(f"Stripe Status: Charges Enabled={account.charges_enabled}, Payouts Enabled={account.payouts_enabled}")
        
        if account.details_submitted:
            print("SUCCESS: Onboarding completed!")
            
            # Update local DB to match
            stripe_account_obj.charges_enabled = account.charges_enabled
            stripe_account_obj.payouts_enabled = account.payouts_enabled
            stripe_account_obj.onboarding_completed = account.details_submitted
            stripe_account_obj.save()
            
            jeweler.stripe_onboarding_completed = True
            jeweler.save()
            print("Local database updated.")
        else:
            print("FAILURE: Onboarding not completed yet.")
            
    except Exception as e:
        print(f"Error verifying status: {e}")

if __name__ == "__main__":
    simulate_onboarding()
