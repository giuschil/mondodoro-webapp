#!/usr/bin/env python3
"""
Test suite per verificare tutte le funzionalità di pagamento
Esegui con: python3 test_payments.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mondodoro.settings')
django.setup()

from django.conf import settings
from apps.accounts.models import User
from apps.gift_lists.models import GiftList, Contribution
from apps.payments.models import StripeAccount, PaymentIntent, PlatformSettings
from apps.payments.stripe_utils import create_stripe_account, create_onboarding_link, create_stripe_checkout_session
import stripe

# Colori per output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def ok(msg):
    print(f"{GREEN}✓ {msg}{RESET}")

def fail(msg):
    print(f"{RED}✗ {msg}{RESET}")

def warn(msg):
    print(f"{YELLOW}⚠ {msg}{RESET}")

def test_stripe_config():
    """Test 1: Verifica configurazione Stripe"""
    print("\n=== TEST 1: Configurazione Stripe ===")
    
    # Chiave segreta
    if settings.STRIPE_SECRET_KEY and settings.STRIPE_SECRET_KEY.startswith('sk_'):
        ok(f"STRIPE_SECRET_KEY configurata ({settings.STRIPE_SECRET_KEY[:20]}...)")
    else:
        fail("STRIPE_SECRET_KEY non configurata o invalida")
        return False
    
    # Chiave pubblica
    if settings.STRIPE_PUBLISHABLE_KEY and settings.STRIPE_PUBLISHABLE_KEY.startswith('pk_'):
        ok(f"STRIPE_PUBLISHABLE_KEY configurata ({settings.STRIPE_PUBLISHABLE_KEY[:20]}...)")
    else:
        fail("STRIPE_PUBLISHABLE_KEY non configurata o invalida")
        return False
    
    # Webhook secret
    if settings.STRIPE_WEBHOOK_SECRET and settings.STRIPE_WEBHOOK_SECRET.startswith('whsec_'):
        ok(f"STRIPE_WEBHOOK_SECRET configurata ({settings.STRIPE_WEBHOOK_SECRET[:15]}...)")
    else:
        warn("STRIPE_WEBHOOK_SECRET non configurata (i webhook non funzioneranno)")
    
    # Test connessione Stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        stripe.Account.retrieve()
        ok("Connessione a Stripe OK")
    except stripe.error.AuthenticationError as e:
        fail(f"Chiave Stripe non valida: {e}")
        return False
    except Exception as e:
        fail(f"Errore connessione Stripe: {e}")
        return False
    
    return True

def test_platform_settings():
    """Test 2: Verifica PlatformSettings"""
    print("\n=== TEST 2: Platform Settings ===")
    
    try:
        ps = PlatformSettings.load()
        ok(f"PlatformSettings caricato")
        ok(f"  - platform_fee_percentage: {ps.platform_fee_percentage}%")
        ok(f"  - platform_fee_fixed: €{ps.platform_fee_fixed}")
        return True
    except Exception as e:
        fail(f"Errore caricamento PlatformSettings: {e}")
        return False

def test_jeweler_user():
    """Test 3: Verifica utente gioielliere"""
    print("\n=== TEST 3: Utente Gioielliere ===")
    
    jeweler = User.objects.filter(role='jeweler').first()
    if not jeweler:
        fail("Nessun utente gioielliere trovato")
        return None
    
    ok(f"Gioielliere trovato: {jeweler.email}")
    ok(f"  - Nome: {jeweler.first_name} {jeweler.last_name}")
    ok(f"  - Business: {jeweler.business_name}")
    
    return jeweler

def test_stripe_account(jeweler):
    """Test 4: Verifica StripeAccount del gioielliere"""
    print("\n=== TEST 4: Stripe Account ===")
    
    if not jeweler:
        fail("Nessun gioielliere da testare")
        return None
    
    try:
        sa = StripeAccount.objects.get(jeweler=jeweler)
        ok(f"StripeAccount trovato: {sa.stripe_account_id}")
        ok(f"  - Status: {sa.account_status}")
        ok(f"  - Charges enabled: {sa.charges_enabled}")
        ok(f"  - Payouts enabled: {sa.payouts_enabled}")
        ok(f"  - Onboarding completed: {sa.onboarding_completed}")
        
        # Verifica su Stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            account = stripe.Account.retrieve(sa.stripe_account_id)
            ok(f"Account verificato su Stripe: {account.id}")
        except Exception as e:
            warn(f"Account non verificabile su Stripe: {e}")
        
        return sa
    except StripeAccount.DoesNotExist:
        warn("StripeAccount non trovato per questo gioielliere")
        return None

def test_onboarding_link(jeweler):
    """Test 5: Verifica creazione link onboarding"""
    print("\n=== TEST 5: Link Onboarding ===")
    
    if not jeweler:
        fail("Nessun gioielliere da testare")
        return False
    
    try:
        sa = StripeAccount.objects.filter(jeweler=jeweler).first()
        if sa and sa.stripe_account_id:
            link = create_onboarding_link(
                sa.stripe_account_id,
                f'{settings.BASE_URL}/dashboard/profile?stripe=refresh',
                f'{settings.BASE_URL}/dashboard/profile?stripe=success'
            )
            ok(f"Link onboarding creato: {link.url[:60]}...")
            return True
        else:
            warn("Nessun StripeAccount ID, impossibile creare link")
            return False
    except Exception as e:
        fail(f"Errore creazione link onboarding: {e}")
        return False

def test_gift_list(jeweler):
    """Test 6: Verifica liste regalo"""
    print("\n=== TEST 6: Liste Regalo ===")
    
    if not jeweler:
        fail("Nessun gioielliere da testare")
        return None
    
    gl = GiftList.objects.filter(jeweler=jeweler, status='active').first()
    if not gl:
        gl = GiftList.objects.filter(jeweler=jeweler).first()
    
    if not gl:
        warn("Nessuna lista regalo trovata")
        return None
    
    ok(f"Lista regalo trovata: {gl.title}")
    ok(f"  - ID: {gl.id}")
    ok(f"  - Status: {gl.status}")
    ok(f"  - Target: €{gl.target_amount}")
    ok(f"  - Collected: €{gl.current_amount}")
    
    return gl

def test_contribution(gift_list):
    """Test 7: Crea contributo di test"""
    print("\n=== TEST 7: Creazione Contributo ===")
    
    if not gift_list:
        fail("Nessuna lista regalo da testare")
        return None
    
    try:
        # Cerca contributo pending esistente o crea nuovo
        contrib = Contribution.objects.filter(
            gift_list=gift_list,
            contributor_email='test@test.com',
            payment_status='pending'
        ).first()
        
        if contrib:
            ok(f"Contributo test esistente: {contrib.id}")
        else:
            contrib = Contribution.objects.create(
                gift_list=gift_list,
                contributor_name='Test User',
                contributor_email='test@test.com',
                amount=1.00,
                payment_status='pending',
                is_anonymous=False
            )
            ok(f"Contributo test creato: {contrib.id}")
        
        ok(f"  - Amount: €{contrib.amount}")
        ok(f"  - Status: {contrib.payment_status}")
        
        return contrib
    except Exception as e:
        fail(f"Errore creazione contributo: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_checkout_session(contribution):
    """Test 8: Crea sessione checkout Stripe"""
    print("\n=== TEST 8: Sessione Checkout ===")
    
    if not contribution:
        fail("Nessun contributo da testare")
        return False
    
    try:
        result = create_stripe_checkout_session(contribution)
        ok(f"Sessione checkout creata!")
        ok(f"  - Session ID: {result.stripe_payment_intent_id}")
        ok(f"  - Checkout URL: {result.client_secret[:60]}...")
        return True
    except Exception as e:
        fail(f"Errore creazione sessione checkout: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoint():
    """Test 9: Verifica endpoint API"""
    print("\n=== TEST 9: Endpoint API ===")
    
    from django.test import Client
    from rest_framework.authtoken.models import Token
    
    client = Client()
    
    # Test endpoint pubblico
    response = client.get('/api/gift-lists/')
    if response.status_code in [200, 401]:
        ok(f"Endpoint /api/gift-lists/ raggiungibile (status: {response.status_code})")
    else:
        fail(f"Endpoint /api/gift-lists/ non raggiungibile (status: {response.status_code})")
    
    # Test endpoint payments
    jeweler = User.objects.filter(role='jeweler').first()
    if jeweler:
        token, _ = Token.objects.get_or_create(user=jeweler)
        response = client.post(
            '/api/payments/stripe/onboard/',
            HTTP_AUTHORIZATION=f'Token {token.key}',
            content_type='application/json'
        )
        if response.status_code in [200, 400]:
            ok(f"Endpoint /api/payments/stripe/onboard/ funziona (status: {response.status_code})")
        else:
            fail(f"Endpoint /api/payments/stripe/onboard/ errore (status: {response.status_code})")
            print(f"    Response: {response.content[:200]}")
    
    return True

def cleanup_test_data():
    """Pulizia dati di test"""
    print("\n=== PULIZIA ===")
    
    # Elimina contributi di test
    deleted = Contribution.objects.filter(contributor_email='test@test.com').delete()
    if deleted[0] > 0:
        ok(f"Eliminati {deleted[0]} contributi di test")
    else:
        ok("Nessun contributo di test da eliminare")

def main():
    print("=" * 60)
    print("   TEST SUITE - LISTDREAMS PAYMENTS")
    print("=" * 60)
    
    results = []
    
    # Esegui test
    results.append(("Configurazione Stripe", test_stripe_config()))
    results.append(("Platform Settings", test_platform_settings()))
    
    jeweler = test_jeweler_user()
    results.append(("Utente Gioielliere", jeweler is not None))
    
    sa = test_stripe_account(jeweler)
    results.append(("Stripe Account", sa is not None))
    
    results.append(("Link Onboarding", test_onboarding_link(jeweler)))
    
    gift_list = test_gift_list(jeweler)
    results.append(("Lista Regalo", gift_list is not None))
    
    contribution = test_contribution(gift_list)
    results.append(("Creazione Contributo", contribution is not None))
    
    results.append(("Sessione Checkout", test_checkout_session(contribution)))
    
    results.append(("Endpoint API", test_api_endpoint()))
    
    # Pulizia
    cleanup_test_data()
    
    # Riepilogo
    print("\n" + "=" * 60)
    print("   RIEPILOGO")
    print("=" * 60)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"  {name}: {status}")
    
    print(f"\n  Totale: {passed}/{total} test passati")
    
    if passed == total:
        print(f"\n{GREEN}TUTTI I TEST PASSATI!{RESET}")
    else:
        print(f"\n{RED}ALCUNI TEST FALLITI - Controlla i dettagli sopra{RESET}")

if __name__ == '__main__':
    main()
