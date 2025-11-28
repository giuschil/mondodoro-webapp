import os
import sys
import django
import stripe

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mondodoro.settings')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from apps.payments.models import StripeAccount

User = get_user_model()
stripe.api_key = settings.STRIPE_SECRET_KEY

def check_user_onboarding(email):
    print(f"Searching for user with email: {email}")
    try:
        user = User.objects.get(email=email)
        print(f"Found User: {user.username} (ID: {user.id})")
        
        try:
            stripe_account = StripeAccount.objects.get(jeweler=user)
            acct_id = stripe_account.stripe_account_id
            print(f"Associated Stripe Account ID: {acct_id}")
            
            # Check Stripe API
            print(f"Querying Stripe API for account {acct_id}...")
            account = stripe.Account.retrieve(acct_id)
            
            print(f"\n--- Stripe Status for {email} ---")
            print(f"Charges Enabled: {account.charges_enabled}")
            print(f"Payouts Enabled: {account.payouts_enabled}")
            print(f"Details Submitted: {account.details_submitted}")
            
            if account.details_submitted and (account.charges_enabled or account.payouts_enabled):
                print("\n✅ SUCCESS: User is fully onboarded!")
            else:
                print("\n⚠️ INCOMPLETE: User has started but not finished onboarding.")
                print("Requirements due:", account.requirements.currently_due)

        except StripeAccount.DoesNotExist:
            print("❌ No StripeAccount record found for this user in local DB.")
            
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found in database.")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_user_status.py <email>")
    else:
        check_user_onboarding(sys.argv[1])
