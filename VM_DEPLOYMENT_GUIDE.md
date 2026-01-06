# 🚀 Panduan Deployment ke VM (sinfokas.online)

**IP VM:** `34.123.111.227`  
**Domain:** `sinfokas.online`

## 📋 Persiapan Sebelum Deploy

### 1. Install Dependencies di VM

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (web server & reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager untuk Node.js)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

---

## ⚙️ Konfigurasi Backend

### 1. File `.env` di Backend

Buat file `.env` di folder `backend/`:

```env
# ============================================
# ENVIRONMENT CONFIGURATION
# ============================================
NODE_ENV=production

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
FRONTEND_URL=https://sinfokas.online

# ============================================
# DATABASE CONFIGURATION (PostgreSQL)
# ============================================
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sinfomik_db
DB_USER=sinfomik_user
DB_PASSWORD=YourStrongPassword123!

# ============================================
# JWT SECRET KEY
# ============================================
# PENTING: Ganti dengan random string yang kuat!
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2026
JWT_EXPIRES_IN=5h

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### 2. Setup PostgreSQL Database

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Di dalam PostgreSQL console:
CREATE DATABASE sinfomik_db;
CREATE USER sinfomik_user WITH PASSWORD 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE sinfomik_db TO sinfomik_user;

# Grant privileges untuk public schema
\c sinfomik_db
GRANT ALL ON SCHEMA public TO sinfomik_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sinfomik_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sinfomik_user;

# Exit
\q
```

### 3. Clone & Setup Backend

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/raihan7913/sinfomik.git
cd sinfomik/backend

# Install dependencies
npm install

# Buat file .env (copy dari template di atas)
sudo nano .env

# Test run backend
npm start
# Jika berhasil, Ctrl+C untuk stop
```

### 4. Run Backend dengan PM2

```bash
# Start backend dengan PM2
pm2 start src/server.js --name sinfomik-backend

# Set PM2 autostart on server reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs sinfomik-backend
```

---

## 🌐 Konfigurasi Frontend

### 1. File `.env` di Frontend

Buat file `.env` di folder `frontend/`:

```env
# ============================================
# API ENDPOINT
# ============================================
REACT_APP_API_BASE_URL=https://sinfokas.online/api

# ATAU jika backend di port berbeda:
# REACT_APP_API_BASE_URL=https://sinfokas.online:5000
```

### 2. Build Frontend

```bash
cd /var/www/sinfomik/frontend

# Install dependencies
npm install

# Build production
npm run build
```

Build akan generate folder `build/` yang berisi static files.

---

## 🔧 Konfigurasi Nginx

### 1. Buat Nginx Config File

```bash
sudo nano /etc/nginx/sites-available/sinfokas.online
```

**Isi file config:**

```nginx
# Frontend (React) - Serve static files
server {
    listen 80;
    listen [::]:80;
    server_name sinfokas.online www.sinfokas.online 34.123.111.227;

    # Redirect HTTP to HTTPS (setelah SSL setup)
    # return 301 https://$server_name$request_uri;

    # Root directory untuk frontend build
    root /var/www/sinfomik/frontend/build;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        
        # Headers untuk HTTP-only cookies & CORS
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cookie headers (PENTING untuk HTTP-only cookies!)
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        
        # Cache settings
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site & Test Config

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sinfokas.online /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Setup SSL/HTTPS dengan Let's Encrypt (RECOMMENDED!)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (automatic Nginx configuration)
sudo certbot --nginx -d sinfokas.online -d www.sinfokas.online

# Auto-renewal test
sudo certbot renew --dry-run
```

Certbot akan otomatis:
- Generate SSL certificate
- Update Nginx config untuk HTTPS
- Setup auto-renewal

**Setelah SSL aktif**, update backend `.env`:

```env
FRONTEND_URL=https://sinfokas.online
```

---

## 🔥 Firewall Configuration

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (PENTING! Jangan lupa ini!)
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## 📊 Monitoring & Debugging

### Check Backend Logs

```bash
# PM2 logs
pm2 logs sinfomik-backend

# PM2 status
pm2 status

# Restart backend
pm2 restart sinfomik-backend
```

### Check Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### Check PostgreSQL

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Connect to database
sudo -u postgres psql -d sinfomik_db
```

---

## ✅ Testing Checklist

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Frontend Access:**
   ```bash
   curl http://sinfokas.online
   ```

3. **API Test:**
   ```bash
   curl http://sinfokas.online/api/health
   ```

4. **Login Test:**
   - Buka `https://sinfokas.online`
   - Login dengan credentials
   - Cek DevTools → Network → Lihat API calls
   - Cek DevTools → Application → Cookies → Harus ada `authToken` dengan HttpOnly flag

---

## 🆚 Perbedaan Azure vs VM Deployment

| Aspect | Azure Static Web Apps | VM (sinfokas.online) |
|--------|----------------------|----------------------|
| **Frontend Hosting** | Azure CDN (automatic) | Nginx serve static files |
| **Backend** | Azure App Service | PM2 + Node.js |
| **Database** | Azure PostgreSQL | Self-hosted PostgreSQL |
| **SSL/HTTPS** | Automatic | Manual (Let's Encrypt) |
| **Auto-scaling** | Yes | No (manual) |
| **Cost** | Pay-as-you-go | Fixed VM cost |
| **Maintenance** | Minimal | Full control (updates, security, etc.) |

---

## 🔧 Troubleshooting

### CORS Error

**Error:** `Access-Control-Allow-Origin`

**Solution:**
1. Cek backend CORS config di `server.js`
2. Pastikan `https://sinfokas.online` ada di allowed origins
3. Restart backend: `pm2 restart sinfomik-backend`

### Cookie Not Sent

**Error:** `authToken` cookie tidak terkirim

**Solution:**
1. Pastikan backend set cookie dengan:
   ```javascript
   res.cookie('authToken', token, {
     httpOnly: true,
     secure: true, // HTTPS only
     sameSite: 'lax', // Same domain
     domain: 'sinfokas.online'
   });
   ```

2. Cek Nginx proxy headers (sudah ada di config di atas)

### 502 Bad Gateway

**Error:** Nginx error 502

**Solution:**
1. Cek backend running: `pm2 status`
2. Cek backend logs: `pm2 logs sinfomik-backend`
3. Cek port 5000 listening: `sudo netstat -tulpn | grep 5000`

---

## 🚀 Update Deployment

```bash
# 1. Pull latest code
cd /var/www/sinfomik
sudo git pull origin main

# 2. Update backend
cd backend
npm install
pm2 restart sinfomik-backend

# 3. Update frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## 📞 Support

Jika ada masalah, cek:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
