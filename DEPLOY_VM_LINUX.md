# 🚀 Deploy SINFOMIK ke VM Linux

## Server Info
- **VM IP**: 20.41.105.73
- **User**: atha
- **Backend Port**: 5000
- **Frontend**: Same VM (port 80 atau 3000)

---

## 📦 File yang Perlu Di-Upload

### 1. Backend
Upload folder `backend/` ke VM:
```bash
# Dari komputer lokal
scp -r backend/ atha@20.41.105.73:~/sinfomik/
```

### 2. Frontend (Build)
Upload folder `frontend/build/` ke VM:
```bash
# Dari komputer lokal
scp -r frontend/build/ atha@20.41.105.73:~/sinfomik/frontend/
```

---

## 🔧 Setup di VM Linux

### 1. Install Dependencies

```bash
# SSH ke VM
ssh atha@20.41.105.73

# Install Node.js (jika belum)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 untuk manage process
sudo npm install -g pm2

# Install Nginx untuk serve frontend
sudo apt install nginx -y
```

### 2. Setup Backend

```bash
cd ~/sinfomik/backend

# Install dependencies
npm install --production

# Buat file .env
nano .env
```

**Isi file `.env`:**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=ganti_dengan_string_random_panjang_minimal_32_karakter
FRONTEND_URL=http://20.41.105.73

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sinfomik_db
DB_USER=postgres
DB_PASSWORD=your_db_password

# Atau SQLite (lebih simple)
DB_PATH=/home/atha/sinfomik/data/academic_dashboard.db
```

**Jalankan backend dengan PM2:**
```bash
# Start backend
pm2 start src/server.js --name sinfomik-backend

# Auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs sinfomik-backend
```

### 3. Setup Frontend dengan Nginx

```bash
# Buat config Nginx
sudo nano /etc/nginx/sites-available/sinfomik
```

**Isi config:**
```nginx
server {
    listen 80;
    server_name 20.41.105.73;

    root /home/atha/sinfomik/frontend/build;
    index index.html;

    # Frontend - serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests ke backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

**Aktifkan config:**
```bash
# Link config
sudo ln -s /etc/nginx/sites-available/sinfomik /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 4. Setup Database

**Jika pakai PostgreSQL:**
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Buat database
sudo -u postgres psql
CREATE DATABASE sinfomik_db;
CREATE USER sinfomik_user WITH PASSWORD 'password_anda';
GRANT ALL PRIVILEGES ON DATABASE sinfomik_db TO sinfomik_user;
\q

# Initialize database - CARA BARU (dengan validasi)
cd ~/sinfomik
bash init-database.sh

# Atau langsung (manual):
cd ~/sinfomik/backend
node src/init_db_postgres_simple.js
```

**Jika pakai SQLite (lebih simple):**
```bash
# Buat folder data
mkdir -p ~/sinfomik/data

# Initialize database
cd ~/sinfomik/backend
node src/init_db.js
```

### 5. Setup Firewall

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow Backend port (jika perlu direct access)
sudo ufw allow 5000/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

---

## 🧪 Testing

### 1. Test Backend
```bash
# Dari VM
curl http://localhost:5000/api/auth/login

# Dari luar (komputer Anda)
curl http://20.41.105.73:5000/api/auth/login
```

### 2. Test Frontend
Buka browser:
```
http://20.41.105.73
```

### 3. Test Login
- Username: admin
- Password: (sesuai yang di-set saat init database)

---

## 📝 Maintenance Commands

### PM2 Commands
```bash
pm2 status                    # Check status
pm2 logs sinfomik-backend     # View logs
pm2 restart sinfomik-backend  # Restart
pm2 stop sinfomik-backend     # Stop
pm2 delete sinfomik-backend   # Remove
```

### Nginx Commands
```bash
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart
sudo nginx -t                 # Test config
sudo tail -f /var/log/nginx/error.log  # View errors
```

### Update Application
```bash
# Upload file baru dari local
scp -r backend/ atha@20.41.105.73:~/sinfomik/
scp -r frontend/build/ atha@20.41.105.73:~/sinfomik/frontend/

# Di VM
cd ~/sinfomik/backend
npm install
pm2 restart sinfomik-backend

# Reload Nginx (jika ada perubahan frontend)
sudo systemctl reload nginx
```

---

## 🔒 Security Checklist (Optional)

### 1. Setup HTTPS dengan Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Jika punya domain (ganti example.com)
sudo certbot --nginx -d sinfomik.example.com

# Auto-renew
sudo certbot renew --dry-run
```

### 2. Hardening
```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Update sistem
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

---

## 🐛 Troubleshooting

### Backend tidak jalan
```bash
pm2 logs sinfomik-backend --lines 100
# Check error, biasanya:
# - Port sudah dipakai: sudo lsof -i :5000
# - Database connection error: check .env
# - Permission error: check folder permissions
```

### Frontend tidak muncul
```bash
sudo tail -f /var/log/nginx/error.log
# Check:
# - Path ke build folder benar
# - Permissions: sudo chown -R www-data:www-data /home/atha/sinfomik/frontend/build
```

### CORS Error
- Pastikan backend CORS sudah allow IP VM
- Check [backend/src/server.js](backend/src/server.js#L45-L55)

### Database Error
```bash
# Check database
cd ~/sinfomik/backend
node src/test_db.js
```

---

## 📊 Monitor Resources

```bash
# Check memory
free -h

# Check disk
df -h

# Check CPU
top

# Check processes
pm2 monit
```
