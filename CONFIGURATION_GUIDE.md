# 🔧 Configuration Management - SINFOMIK

## Masalah Hardcoded Configuration ❌

Sebelumnya banyak konfigurasi yang hardcoded:
- IP address VM (20.41.105.73)
- Azure URLs
- Port numbers
- Database credentials

## Solusi: Environment Variables ✅

Semua konfigurasi sekarang menggunakan **environment variables** yang fleksibel.

---

## 📁 File Konfigurasi

### Backend

| File | Purpose |
|------|---------|
| `.env.example` | Template untuk development |
| `.env.production.example` | Template untuk production |
| `.env` | **JANGAN COMMIT** - File aktual dengan data sensitif |

### Frontend

| File | Purpose |
|------|---------|
| `.env.example` | Template untuk development |
| `.env.production.example` | Template untuk production |
| `.env.production` | File aktual untuk production build |

---

## 🚀 Setup untuk Development

### 1. Backend Development
```bash
cd backend
cp .env.example .env
nano .env
```

Edit sesuai kebutuhan:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=dev_secret_key_min_32_chars
```

### 2. Frontend Development
```bash
cd frontend
# Tidak perlu .env untuk development, sudah ada default
# Atau buat dari template:
cp .env.example .env.local
```

### 3. Jalankan
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 🌐 Setup untuk Production (VM Linux)

### 1. Backend - Buat file `.env`

```bash
# SSH ke VM
ssh atha@20.41.105.73

# Buat .env dari template
cd ~/sinfomik/backend
cp .env.production.example .env
nano .env
```

**Edit dengan data production:**
```env
PORT=5000
NODE_ENV=production

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sinfomik_db
DB_USER=sinfomik_user
DB_PASSWORD=YOUR_SECURE_DB_PASSWORD

# Security
JWT_SECRET=GENERATE_RANDOM_STRING_32_CHARS

# CORS
FRONTEND_URL=http://20.41.105.73
ALLOWED_ORIGINS=http://20.41.105.73:3000,http://20.41.105.73:80

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX=50
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Frontend - Buat file `.env.production`

```bash
# Di local machine
cd frontend
cp .env.production.example .env.production
nano .env.production
```

**Edit dengan backend URL:**
```env
REACT_APP_API_BASE_URL=http://20.41.105.73:5000

# Atau jika pakai Nginx reverse proxy:
# REACT_APP_API_BASE_URL=http://20.41.105.73

REACT_APP_ENABLE_PWA=true
GENERATE_SOURCEMAP=false
```

### 3. Build & Deploy
```bash
# Build frontend dengan env production
npm run build

# Upload ke VM
scp -r build/ atha@20.41.105.73:~/sinfomik/frontend/
scp -r backend/ atha@20.41.105.73:~/sinfomik/
```

---

## 🔄 Ganti Server (Misal: IP Baru atau Domain)

**Tidak perlu edit kode!** Cukup update environment variables:

### Scenario 1: Ganti IP Server
```bash
# VM baru dengan IP: 30.50.60.70

# Backend .env
FRONTEND_URL=http://30.50.60.70
ALLOWED_ORIGINS=http://30.50.60.70:3000,http://30.50.60.70:80

# Frontend .env.production
REACT_APP_API_BASE_URL=http://30.50.60.70:5000
```

### Scenario 2: Dapat Domain
```bash
# Domain: sinfomik.com

# Backend .env
FRONTEND_URL=https://sinfomik.com
ALLOWED_ORIGINS=https://www.sinfomik.com,https://sinfomik.com

# Frontend .env.production
REACT_APP_API_BASE_URL=https://api.sinfomik.com
```

### Scenario 3: Multi-Environment
```bash
# Development
.env
.env.development

# Staging
.env.staging

# Production
.env.production
```

---

## 🔐 Security Best Practices

### 1. .gitignore (Sudah diatur)
```
# Environment files (jangan commit file actual)
.env
.env.local
.env.production
.env.staging

# Yang boleh commit (template only)
.env.example
.env.production.example
```

### 2. Sensitive Data
**JANGAN PERNAH:**
- ❌ Commit file `.env` ke Git
- ❌ Share JWT_SECRET di public
- ❌ Hardcode password di kode

**WAJIB:**
- ✅ Gunakan `.env.example` sebagai template
- ✅ Generate JWT secret yang kuat
- ✅ Ganti default password
- ✅ Set permission `.env` di server: `chmod 600 .env`

### 3. Generate Secure Secrets
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Database Password (random)
openssl rand -base64 32

# Atau pakai password generator online (minimal 20 karakter)
```

---

## 📋 Environment Variables Reference

### Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Backend server port |
| `NODE_ENV` | No | development | Environment mode |
| `DB_TYPE` | Yes | - | postgres atau sqlite |
| `DB_HOST` | Yes* | - | PostgreSQL host |
| `DB_PORT` | Yes* | 5432 | PostgreSQL port |
| `DB_NAME` | Yes* | - | Database name |
| `DB_USER` | Yes* | - | Database username |
| `DB_PASSWORD` | Yes* | - | Database password |
| `DB_PATH` | Yes** | - | SQLite file path |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | 24h | Token expiration |
| `FRONTEND_URL` | Yes | localhost:3000 | Main frontend URL |
| `ALLOWED_ORIGINS` | No | - | Additional CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | 200 | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | No | 50 | Max auth attempts |
| `MAX_FILE_SIZE` | No | 10485760 | Max upload size (10MB) |
| `UPLOAD_DIR` | No | ./uploads | Upload directory |

\* Required if `DB_TYPE=postgres`  
\*\* Required if `DB_TYPE=sqlite`

### Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_BASE_URL` | Yes | localhost:5000 | Backend API URL |
| `REACT_APP_ENABLE_PWA` | No | true | Enable PWA features |
| `REACT_APP_NAME` | No | SINFOMIK | App name |
| `REACT_APP_VERSION` | No | 1.0.0 | App version |
| `GENERATE_SOURCEMAP` | No | true | Generate source maps |

---

## 🧪 Testing Configuration

### Cek Backend Config
```bash
cd backend
node -e "require('dotenv').config(); console.log(process.env)"
```

### Cek Frontend Build Config
```bash
# Lihat env yang dipakai saat build
npm run build | grep REACT_APP
```

### Test CORS
```bash
# Test dari browser console di frontend
fetch('http://20.41.105.73:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include'
}).then(r => console.log(r))
```

---

## 🔄 Update Configuration (Without Rebuild)

### Backend
```bash
# SSH ke VM
ssh atha@20.41.105.73

# Edit .env
cd ~/sinfomik/backend
nano .env

# Restart service
pm2 restart sinfomik-backend
```

### Frontend
Untuk update API URL, **harus rebuild**:
```bash
# Local machine
cd frontend
nano .env.production
npm run build

# Upload build baru
scp -r build/ atha@20.41.105.73:~/sinfomik/frontend/
```

---

## 📚 Migration Guide

### Dari Hardcoded ke Environment Variables

**Before:**
```javascript
const API_URL = 'http://20.41.105.73:5000';  // ❌ Hardcoded
```

**After:**
```javascript
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';  // ✅ Dynamic
```

### Checklist Migration
- [x] Backend: Semua hardcoded values dipindah ke `.env`
- [x] Backend: CORS origins menggunakan `ALLOWED_ORIGINS`
- [x] Frontend: API URL menggunakan `REACT_APP_API_BASE_URL`
- [x] Dokumentasi: `.env.example` untuk semua environment
- [x] Security: `.env` files di `.gitignore`

---

## 💡 Tips

1. **Development**: Copy `.env.example` ke `.env` dan edit sesuai local setup
2. **Production**: Gunakan `.env.production.example` sebagai template
3. **Multi-Server**: Buat `.env` terpisah untuk setiap server
4. **Backup**: Simpan `.env` production di password manager (1Password, LastPass)
5. **Documentation**: Update `.env.example` setiap ada variable baru
6. **Validation**: Tambah check di startup untuk validate required env vars

---

## 🚨 Troubleshooting

### CORS Error setelah ganti server
```bash
# Pastikan ALLOWED_ORIGINS sudah diupdate
# Restart backend
pm2 restart sinfomik-backend
```

### Frontend API call masih ke localhost
```bash
# .env.production belum dibaca
# Cek file ada dan rebuild
ls -la frontend/.env.production
cd frontend && npm run build
```

### Database connection error
```bash
# Cek environment variables
cd backend
node -e "require('dotenv').config(); console.log('DB:', process.env.DB_HOST)"
```
