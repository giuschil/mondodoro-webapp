# Mondodoro - Gift Lists and Collections Platform for Jewelers

A comprehensive platform for creating gift lists and online collections dedicated to jewelry stores. Guests can easily contribute with credit cards (Stripe), while jewelers have a dashboard to manage payments and lists.

## 🏗️ Architecture

- **Frontend**: Next.js + Tailwind CSS (responsive UI, SEO friendly)
- **Backend**: Django REST Framework (REST API + user management)
- **Database**: PostgreSQL
- **Payments**: Stripe (Checkout + Connect)
- **Containerization**: Docker + Docker Compose
- **CI/CD & Versioning**: Git
- **Hosting**: Hostinger VPS

## 🚀 MVP Features

### SuperAdmin (Mondodoro)
- Manages jewelry stores and fees
- Platform administration

### Jeweler (Gioielliere)
- Create gift lists/collections
- Dashboard with received contributions
- Stripe Connect account integration

### Guest (Invitato)
- View lists via public link
- Pay through Stripe Checkout
- Simple contribution process

## 📋 Main Flow

1. Jeweler creates gift list from panel
2. Gets unique link to share
3. Guest opens link → sees target and products
4. Guest pays with Stripe Checkout
5. Stripe handles payments (Mondodoro fee + jeweler credit)
6. Webhook updates jeweler dashboard

## 🛠️ Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Account Stripe (chiavi già configurate per il testing)

### Avvio Rapido con Docker

1. **Clona il repository:**
```bash
git clone https://github.com/giuschil/mondodoro-webapp.git
cd mondodoro-webapp
```

2. **Configura le variabili d'ambiente:**
```bash
cp env.example .env
```
Le chiavi Stripe sono già configurate per il testing.

3. **Avvia tutti i servizi con Docker:**
```bash
docker-compose up --build -d
```

4. **Accedi all'applicazione:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs/
- **Admin Django**: http://localhost:8000/admin/

### Comandi Docker Utili

```bash
# Visualizza i logs
docker-compose logs -f

# Riavvia un servizio
docker-compose restart backend

# Ferma tutti i servizi
docker-compose down

# Ricostruisci e riavvia
docker-compose up --build

# Esegui le migrazioni Django
docker-compose exec backend python manage.py migrate

# Crea un superuser Django
docker-compose exec backend python manage.py createsuperuser

# Accedi al database PostgreSQL
docker-compose exec postgres psql -U postgres -d mondodoro

# Esegui shell Django
docker-compose exec backend python manage.py shell
```

## 🧪 Testing e Sviluppo

### Account Demo
L'applicazione include account demo preconfigurati:
- **Gioielliere**: jeweler@demo.com / password123
- **Invitato**: guest@demo.com / password123

### Stripe Test Mode
- **Publishable Key**: `pk_test_51S290YKEjZQBnFGO...` (già configurata)
- **Secret Key**: `sk_test_51S290YKEjZQBnFGO...` (già configurata)
- **Webhook Endpoint**: `https://yourdomain.com/api/payments/stripe/webhook/`

### Carte di Test Stripe
- **Successo**: 4242 4242 4242 4242
- **Fallimento**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## 📊 Monitoraggio

### Logs Disponibili
```bash
# Backend Django
docker-compose logs backend

# Frontend Next.js  
docker-compose logs frontend

# Database PostgreSQL
docker-compose logs postgres

# Redis (Celery)
docker-compose logs redis
```

### Health Checks
- **Backend**: http://localhost:8000/api/docs/
- **Frontend**: http://localhost:3000
- **Database**: Connessione tramite container postgres

### Local Development

#### Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
mondodoro/
├── backend/                 # Django REST API
│   ├── mondodoro/          # Django project
│   ├── apps/               # Django apps
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Next.js application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Container orchestration
├── env.example            # Environment variables template
└── README.md              # This file
```

## 🔧 Development

### Database Migrations
```bash
# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate
```

### Create Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 🚀 Deployment

The application is designed to be deployed on Hostinger VPS using Docker containers.

## 📄 API Documentation

API documentation will be available at `/api/docs/` when the backend is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is proprietary software for Mondodoro.
# Test auto-deploy - Wed Sep 24 23:22:33 CEST 2025
