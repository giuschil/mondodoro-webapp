# Guida ai Test API con Postman - Mondodoro WebApp

Questa guida ti permette di testare manualmente il flusso di pagamento e gestione liste usando Postman.

## Prerequisiti
- Backend in esecuzione su `http://localhost:8000`
- ID di una Lista Regalo esistente (puoi trovarlo nel database o creandone una nuova)

---

## 1. Login (Opzionale per i contributi, necessario per creare liste)
Ottieni il token di autenticazione per agire come utente registrato.

- **Metodo:** `POST`
- **URL:** `http://localhost:8000/api/auth/login/`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
      "username": "gioielliere",
      "password": "password123"
  }
  ```
- **Risposta Attesa:**
  ```json
  {
      "token": "d83j...",
      "user": { ... }
  }
  ```
> **Nota:** Se vuoi fare richieste autenticate, aggiungi l'header `Authorization: Token IL_TUO_TOKEN` nelle chiamate successive.

---

## 2. Crea un Contributo (Step 1 del Pagamento)
Registra l'intenzione di un utente di contribuire a una lista.

- **Metodo:** `POST`
- **URL:** `http://localhost:8000/api/gift-lists/{LIST_ID}/contributions/`
  *(Sostituisci `{LIST_ID}` con l'UUID della lista, es: `fdc3bdf1-b7fb-4990-bc03-2f6ed0106a1a`)*
- **Body (JSON):**
  ```json
  {
      "contributor_name": "Mario Rossi",
      "contributor_email": "mario@test.com",
      "amount": 50.00,
      "contributor_message": "Tanti auguri!",
      "is_anonymous": false
  }
  ```
- **Risposta Attesa:**
  ```json
  {
      "id": "ab775fc4-...",  <-- COPIA QUESTO ID
      "amount": "50.00",
      "payment_status": "pending",
      ...
  }
  ```

---

## 3. Inizia il Pagamento Stripe (Step 2 del Pagamento)
Genera la sessione di checkout su Stripe.

- **Metodo:** `POST`
- **URL:** `http://localhost:8000/api/payments/create-payment-intent/`
- **Body (JSON):**
  ```json
  {
      "contribution_id": "INCOLLA_QUI_ID_CONTRIBUTO",
      "amount": 50.00
  }
  ```
- **Risposta Attesa:**
  ```json
  {
      "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
      "session_id": "cs_test_..."
  }
  ```

---

## 4. Finalizzazione (Manuale)
1. Copia il `checkout_url` dalla risposta del punto 3.
2. Incollalo nel tuo browser.
3. Usa i dati di test di Stripe per pagare:
   - **Numero Carta:** `4242 4242 4242 4242`
   - **Scadenza:** Qualsiasi data futura (es. 12/30)
   - **CVC:** Qualsiasi 3 cifre (es. 123)
4. Dopo il pagamento verrai reindirizzato alla pagina di successo locale.

---

## 5. Verifica Stato (Opzionale)
Controlla se il contributo risulta pagato (Nota: in locale senza Stripe CLI lo stato rimarrà "pending" a meno che non usi lo script di simulazione).

- **Metodo:** `GET`
- **URL:** `http://localhost:8000/api/gift-lists/{LIST_ID}/contributions/`
- **Risposta Attesa:** Cerca il tuo contributo e controlla `payment_status`.

---

## 6. Test Onboarding Stripe (Per Gioiellieri)
Simula il processo con cui un gioielliere collega il proprio account bancario per ricevere i pagamenti.

### Prerequisiti
- Devi essere loggato come **Gioielliere** (usa le credenziali del punto 1).
- Devi avere il Token di autenticazione.

### Step A: Richiedi Link di Onboarding
- **Metodo:** `POST`
- **URL:** `http://localhost:8000/api/payments/stripe/onboard/`
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Token IL_TUO_TOKEN` (Token ottenuto al punto 1)
- **Body:** (Vuoto)
- **Risposta Attesa:**
  ```json
  {
      "onboarding_url": "https://connect.stripe.com/express/...",
      "account_id": "acct_..."
  }
  ```

### Step B: Esegui Onboarding
1. Copia l'`onboarding_url`.
2. Incollalo nel browser.
3. Segui la procedura guidata di Stripe (in modalità Test puoi usare dati fittizi, il numero di telefono `000 000 0000` e il codice di verifica `000 000`).
4. Al termine verrai reindirizzato alla dashboard locale.

### Step C: Verifica Stato Account
Controlla se l'account risulta collegato correttamente.

- **Metodo:** `GET`
- **URL:** `http://localhost:8000/api/payments/stripe/onboard/return/`
- **Headers:** `Authorization: Token IL_TUO_TOKEN`
- **Risposta Attesa:**
  ```json
  {
      "success": true,
      "onboarding_completed": true,
      "charges_enabled": true,
      "payouts_enabled": true,
      ...
  }
  ```
