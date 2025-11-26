#!/usr/bin/env python3
"""
Test completo del flusso ListDreams
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mondodoro.settings')
django.setup()

import stripe
from decimal import Decimal
from django.conf import settings
from apps.accounts.models import User
from apps.gift_lists.models import GiftList, Contribution
from apps.payments.models import StripeAccount, PaymentIntent, PlatformSettings
from apps.payments.stripe_utils import create_stripe_checkout_session

stripe.api_key = settings.STRIPE_SECRET_KEY

print("=" * 60)
print("TEST COMPLETO LISTDREAMS")
print("=" * 60)

# ============================================
# TEST 1: Registrazione nuovo gioielliere
# ============================================
print("\n[TEST 1] Registrazione nuovo gioielliere...")
test_email = "test.gioielliere@example.com"

# Pulisci eventuali dati precedenti
User.objects.filter(email=test_email).delete()

new_jeweler = User.objects.create_user(
    email=test_email,
    password="TestPassword123!",
    first_name="Mario",
    last_name="Rossi",
    role="jeweler",
    business_name="Gioielleria Rossi"
)
print(f"   ✓ Creato gioielliere: {new_jeweler.email}")
print(f"   ✓ Business: {new_jeweler.business_name}")

# ============================================
# TEST 2: Creazione liste regalo (vari tipi)
# ============================================
print("\n[TEST 2] Creazione liste regalo...")

# Lista 1: Matrimonio
lista_matrimonio = GiftList.objects.create(
    jeweler=new_jeweler,
    title="Matrimonio Mario e Giulia",
    description="Lista regalo per il nostro matrimonio",
    target_amount=Decimal("5000.00"),
    status="active",
    is_public=True,
    list_type="wedding"
)
print(f"   ✓ Lista Matrimonio: {lista_matrimonio.id}")

# Lista 2: Battesimo
lista_battesimo = GiftList.objects.create(
    jeweler=new_jeweler,
    title="Battesimo di Sofia",
    description="Festeggiamo insieme il battesimo",
    target_amount=Decimal("1000.00"),
    status="active",
    is_public=True,
    list_type="baptism"
)
print(f"   ✓ Lista Battesimo: {lista_battesimo.id}")

# Lista 3: Compleanno
lista_compleanno = GiftList.objects.create(
    jeweler=new_jeweler,
    title="50 anni di Papà",
    description="Regalo collettivo per i 50 anni",
    target_amount=Decimal("500.00"),
    status="active",
    is_public=True,
    list_type="birthday"
)
print(f"   ✓ Lista Compleanno: {lista_compleanno.id}")

# ============================================
# TEST 3: Contributi di varie cifre (SENZA Stripe del gioielliere)
# ============================================
print("\n[TEST 3] Contributi senza Stripe Connect del gioielliere...")
print("   (I soldi andranno a ListDreams)")

test_amounts = [
    (Decimal("10.00"), "contributo piccolo"),
    (Decimal("50.00"), "contributo medio"),
    (Decimal("150.00"), "contributo grande"),
    (Decimal("5.50"), "contributo con centesimi"),
]

for amount, desc in test_amounts:
    contrib = Contribution.objects.create(
        gift_list=lista_matrimonio,
        contributor_name=f"Donatore {desc}",
        contributor_email=f"donatore.{amount}@example.com",
        amount=amount,
        payment_status="pending",
        is_anonymous=False
    )
    
    try:
        result = create_stripe_checkout_session(contrib)
        print(f"   ✓ €{amount} ({desc}): Checkout URL generato")
    except Exception as e:
        print(f"   ✗ €{amount} ({desc}): ERRORE - {e}")

# ============================================
# TEST 4: Test con gioielliere CON Stripe Connect
# ============================================
print("\n[TEST 4] Contributi con Stripe Connect del gioielliere...")

# Usa giuschil che ha già Stripe Connect
giuschil = User.objects.get(email="giuschil@gmail.com")
lista_giuschil = GiftList.objects.filter(jeweler=giuschil, status="active").first()

if lista_giuschil:
    sa = StripeAccount.objects.filter(jeweler=giuschil).first()
    print(f"   Gioielliere: {giuschil.email}")
    print(f"   Stripe Account: {sa.stripe_account_id if sa else 'NESSUNO'}")
    
    contrib = Contribution.objects.create(
        gift_list=lista_giuschil,
        contributor_name="Test Con Stripe Connect",
        contributor_email="test.connect@example.com",
        amount=Decimal("25.00"),
        payment_status="pending"
    )
    
    try:
        result = create_stripe_checkout_session(contrib)
        print(f"   ✓ €25.00 con Connect: Checkout URL generato")
        print(f"   → I soldi andranno a {giuschil.business_name} con commissione a ListDreams")
    except Exception as e:
        print(f"   ✗ ERRORE: {e}")

# ============================================
# TEST 5: Contributo anonimo
# ============================================
print("\n[TEST 5] Contributo anonimo...")
contrib_anon = Contribution.objects.create(
    gift_list=lista_battesimo,
    contributor_name="Anonimo",
    contributor_email="anonimo@example.com",
    amount=Decimal("30.00"),
    payment_status="pending",
    is_anonymous=True
)

try:
    result = create_stripe_checkout_session(contrib_anon)
    print(f"   ✓ Contributo anonimo €30: Checkout URL generato")
except Exception as e:
    print(f"   ✗ ERRORE: {e}")

# ============================================
# TEST 6: Verifica Platform Settings
# ============================================
print("\n[TEST 6] Verifica commissioni piattaforma...")
ps = PlatformSettings.load()
print(f"   Commissione %: {ps.platform_fee_percentage}%")
print(f"   Commissione fissa: €{ps.platform_fee_fixed}")

# Calcolo esempio
amount = Decimal("100.00")
fee = (amount * ps.platform_fee_percentage / 100) + ps.platform_fee_fixed
print(f"   Esempio su €100: commissione = €{fee:.2f}")

# ============================================
# TEST 7: Statistiche finali
# ============================================
print("\n[TEST 7] Statistiche...")
print(f"   Totale utenti: {User.objects.count()}")
print(f"   Gioiellieri: {User.objects.filter(role='jeweler').count()}")
print(f"   Liste regalo attive: {GiftList.objects.filter(status='active').count()}")
print(f"   Contributi totali: {Contribution.objects.count()}")
print(f"   - Pending: {Contribution.objects.filter(payment_status='pending').count()}")
print(f"   - Completed: {Contribution.objects.filter(payment_status='completed').count()}")

# Pulizia test
print("\n[PULIZIA] Rimozione dati di test...")
User.objects.filter(email=test_email).delete()
print("   ✓ Dati di test rimossi")

print("\n" + "=" * 60)
print("TEST COMPLETATI!")
print("=" * 60)
