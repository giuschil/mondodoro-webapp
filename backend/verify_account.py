import os
import sys
import django
import stripe

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def verify_account(account_id):
    print(f"Checking status for Stripe Account: {account_id}")
    
    try:
        account = stripe.Account.retrieve(account_id)
        
        charges_enabled = account.charges_enabled
        payouts_enabled = account.payouts_enabled
        details_submitted = account.details_submitted
        
        print(f"\n--- Account Status: {account_id} ---")
        print(f"Charges Enabled: {charges_enabled}")
        print(f"Payouts Enabled: {payouts_enabled}")
        print(f"Details Submitted: {details_submitted}")
        
        if details_submitted and (charges_enabled or payouts_enabled):
            print("\nSUCCESS: Account is fully onboarded and ready!")
        else:
            print("\nPENDING: Account is not yet fully active.")
            print("Requirements due:", account.requirements.currently_due)
            
    except Exception as e:
        print(f"Error retrieving account: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_account.py <acct_ID>")
    else:
        verify_account(sys.argv[1])
