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

def generate_link(email):
    try:
        user = User.objects.get(email=email)
        stripe_account = StripeAccount.objects.get(jeweler=user)
        acct_id = stripe_account.stripe_account_id
        
        print(f"Generating dashboard link for {email} ({acct_id})...")
        
        # Create a login link for the Express Dashboard
        link = stripe.Account.create_login_link(acct_id)
        
        print("\n>>> LINK DASHBOARD GIOIELLIERE (Express) <<<")
        print(link.url)
        print("--------------------------------------------")
        print("Questo link permette al gioielliere di vedere il proprio saldo e i pagamenti ricevuti.")
        
    except User.DoesNotExist:
        print(f"User {email} not found.")
    except StripeAccount.DoesNotExist:
        print(f"No Stripe account found for {email}.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_dashboard_link.py <email>")
    else:
        generate_link(sys.argv[1])
