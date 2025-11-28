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
from apps.gift_lists.models import GiftList, Contribution
from apps.payments.models import PaymentIntent
from apps.payments.stripe_utils import create_stripe_checkout_session

def simulate_transaction():
    print("--- Starting Transaction Simulation ---")
    
    # 1. Get a Gift List
    target_email = "giuschil@gmail.com"
    print(f"Searching for Gift List for jeweler: {target_email}")
    
    gift_list = GiftList.objects.filter(jeweler__email=target_email).first()
    
    if not gift_list:
        print(f"Warning: No gift list found for {target_email}. Falling back to any list.")
        gift_list = GiftList.objects.first()
        
    if not gift_list:
        print("Error: No gift list found in database. Create one first.")
        return

    print(f"Using Gift List: {gift_list.title} ({gift_list.id})")
    print(f"Jeweler: {gift_list.jeweler.email}")

    # 2. Create a new Contribution
    contribution = Contribution.objects.create(
        gift_list=gift_list,
        contributor_name="Simulated User",
        contributor_email="simulated@example.com",
        amount=Decimal("15.00"),
        payment_status=Contribution.PaymentStatus.PENDING
    )
    print(f"Created Contribution: {contribution.id} for €{contribution.amount}")

    # 3. Create Stripe Checkout Session (Real call to Stripe API)
    print("Contacting Stripe to create Checkout Session...")
    try:
        payment_intent_obj = create_stripe_checkout_session(contribution)
        session_id = payment_intent_obj.stripe_payment_intent_id
        print(f"Stripe Session Created: {session_id}")
        print(f"Checkout URL: {payment_intent_obj.client_secret}")
    except Exception as e:
        print(f"Error creating session: {e}")
        return

    # 4. Simulate Webhook (Since we can't pay with a browser in this script)
    print("\n--- Simulating Webhook Event (checkout.session.completed) ---")
    
    payload_data = {
        "id": "evt_test_webhook_" + str(int(time.time())),
        "object": "event",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": session_id,
                "object": "checkout.session",
                "payment_status": "paid",
                "metadata": {
                    "contribution_id": str(contribution.id)
                }
            }
        }
    }
    
    payload_json = json.dumps(payload_data)
    secret = settings.STRIPE_WEBHOOK_SECRET
    
    # Generate Signature
    timestamp = int(time.time())
    signed_payload = f"{timestamp}.{payload_json}"
    signature = stripe.WebhookSignature._compute_signature(
        signed_payload, 
        secret
    )
    header = f"t={timestamp},v1={signature}"
    
    print(f"Sending Webhook to http://localhost:8000/api/payments/stripe/webhook/ ...")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/payments/stripe/webhook/",
            data=payload_json,
            headers={
                "Content-Type": "application/json",
                "Stripe-Signature": header
            }
        )
        print(f"Webhook Response: {response.status_code} {response.text}")
        
        if response.status_code == 200:
            print("Webhook processed successfully!")
            
            # Verify DB update
            contribution.refresh_from_db()
            print(f"Final Contribution Status: {contribution.payment_status}")
            if contribution.payment_status == 'completed':
                print("SUCCESS: Transaction flow verified.")
            else:
                print("FAILURE: Contribution status not updated.")
        else:
            print("FAILURE: Webhook rejected.")
            
    except Exception as e:
        print(f"Error sending webhook: {e}")

if __name__ == "__main__":
    simulate_transaction()
