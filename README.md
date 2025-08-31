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
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- Stripe account

### Environment Setup

1. Copy the environment file:
```bash
cp env.example .env
```

2. Update `.env` with your Stripe keys and other configurations

### Running with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

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
