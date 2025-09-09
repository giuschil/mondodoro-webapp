# 🚀 Guida Deploy Mondodoro su Hostinger VPS

## 📋 Pre-requisiti

1. **Analizza il tuo setup attuale** eseguendo:
   ```bash
   bash hostinger-analysis.sh
   ```

2. **Scegli la strategia di deploy** in base ai risultati

---

## 🌟 Strategia 1: Sottodominio (Consigliato)

### 1. 🏷️ Configura DNS
Nel pannello Hostinger, aggiungi record DNS:
```
Type: A
Name: mondodoro
Value: [IP del tuo VPS]
```

### 2. 📁 Upload del progetto
```bash
# Sul tuo VPS
cd /var/www/
git clone https://github.com/giuschil/mondodoro-webapp.git
cd mondodoro-webapp

# Copia file di produzione
cp env.prod.example .env
```

### 3. ⚙️ Configura ambiente
Modifica `.env`:
```bash
nano .env
```
```env
DOMAIN=mondodoro.tuodominio.com
ALLOWED_HOSTS=mondodoro.tuodominio.com
API_URL=https://mondodoro.tuodominio.com/api
DB_PASSWORD=password_sicura_123
REDIS_PASSWORD=redis_password_456
SECRET_KEY=chiave_segreta_molto_lunga_almeno_50_caratteri
```

### 4. 🚀 Deploy
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🌟 Strategia 2: Porta Diversa

### 1. 📁 Setup progetto
```bash
cd /var/www/
git clone https://github.com/giuschil/mondodoro-webapp.git
cd mondodoro-webapp
cp env.prod.example .env
```

### 2. ⚙️ Configura porta
Modifica `docker-compose.prod.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Mondodoro su porta 8080
```

### 3. 🔧 Configura ambiente
```env
DOMAIN=tuodominio.com:8080
ALLOWED_HOSTS=tuodominio.com
API_URL=https://tuodominio.com:8080/api
```

### 4. 🚀 Deploy
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Accesso: `https://tuodominio.com:8080`

---

## 🌟 Strategia 3: Reverse Proxy Globale

Se hai già Nginx/Traefik globale, aggiungi configurazione:

### Nginx globale
```nginx
# /etc/nginx/sites-available/mondodoro
server {
    listen 80;
    server_name mondodoro.tuodominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/mondodoro /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 🔧 Comandi Utili

### Monitoraggio
```bash
# Status containers
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart
```

### Backup Database
```bash
# Backup
docker exec mondodoro_postgres pg_dump -U postgres mondodoro > backup.sql

# Restore
docker exec -i mondodoro_postgres psql -U postgres mondodoro < backup.sql
```

### SSL (Let's Encrypt)
```bash
# Installa certbot
apt install certbot python3-certbot-nginx

# Genera certificato
certbot --nginx -d mondodoro.tuodominio.com
```

---

## 🎯 Checklist Deploy

- [ ] DNS configurato
- [ ] `.env` compilato con dati reali
- [ ] Stripe keys di produzione
- [ ] Containers avviati
- [ ] SSL configurato
- [ ] Backup automatico configurato
- [ ] Monitoring attivo

---

## 🆘 Troubleshooting

### Porta già in uso
```bash
# Trova processo su porta
netstat -tlnp | grep :80
# Termina processo se necessario
kill -9 [PID]
```

### Containers non si avviano
```bash
# Debug logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

### Database connection error
```bash
# Verifica network
docker network inspect mondodoro_network
# Restart database
docker-compose -f docker-compose.prod.yml restart postgres
```

