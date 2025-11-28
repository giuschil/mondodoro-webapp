import psycopg2
import sys

# Dati di connessione forniti
DB_HOST = "34.175.77.103"
DB_NAME = "postgres"  # Database di default per testare l'accesso
DB_USER = "admin"
DB_PASSWORD = "ibeb6eP5qryEq4Rf"
DB_PORT = "5432"

def test_connection():
    print(f"--- Test Connessione PostgreSQL ---")
    print(f"Host: {DB_HOST}")
    print(f"User: {DB_USER}")
    print("Tentativo di connessione...")

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        print("\n✅ SUCCESSO! Connessione stabilita correttamente.")
        
        # Verifica versione
        cur = conn.cursor()
        cur.execute("SELECT version();")
        db_version = cur.fetchone()
        print(f"Versione Server: {db_version[0]}")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ ERRORE DI CONNESSIONE:")
        print(e)
        print("\nSUGGERIMENTO: Se l'errore è 'timeout' o 'connection refused', assicurati di aver aggiunto il tuo IP attuale alle 'Reti autorizzate' (Authorized networks) su Google Cloud SQL.")
        return False

if __name__ == "__main__":
    success = test_connection()
    if not success:
        sys.exit(1)
