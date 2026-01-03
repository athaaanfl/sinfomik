# 🔄 QUICK MIGRATION: Dari Hardcoded ke Environment Variables

## ✅ Yang Sudah Diperbaiki

### Before (Hardcoded ❌)
```javascript
// Backend
const corsOptions = {
    origin: ['http://20.41.105.73', 'https://azure...']  // ❌ Hardcoded IPs
}

// Frontend  
const API_BASE_URL = 'http://20.41.105.73:5000'  // ❌ Hardcoded IP
```

### After (Dynamic ✅)
```javascript
// Backend
const getAllowedOrigins = () => {
    return process.env.ALLOWED_ORIGINS.split(',');  // ✅ From .env
}

// Frontend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL  // ✅ From .env
```

---

## 🚀 Setup Cepat (5 Menit)

### 1. Backend Setup

```bash
cd backend

# Copy template & edit
cp .env.production.example .env
nano .env

# Atau pakai script otomatis (Linux/Mac)
bash setup-env.sh
```

**File `.env` minimal:**
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=GENERATE_RANDOM_32_CHARS
FRONTEND_URL=http://20.41.105.73
ALLOWED_ORIGINS=http://20.41.105.73:3000,http://20.41.105.73:80
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Frontend Setup

```bash
cd frontend

# Edit .env.production
nano .env.production
```

**File `.env.production`:**
```env
REACT_APP_API_BASE_URL=http://20.41.105.73:5000
REACT_APP_ENABLE_PWA=true
GENERATE_SOURCEMAP=false
```

### 3. Build & Deploy

```bash
# Build frontend
cd frontend
npm run build

# Upload ke VM
scp -r build/ atha@20.41.105.73:~/sinfomik/frontend/
scp -r backend/ atha@20.41.105.73:~/sinfomik/

# SSH ke VM
ssh atha@20.41.105.73
cd ~/sinfomik/backend

# Install & start
npm install --production
pm2 start src/server.js --name sinfomik-backend
pm2 save
```

---

## 📋 File Structure

```
sinfomik/
├── backend/
│   ├── .env                      ← JANGAN COMMIT (actual config)
│   ├── .env.example              ← Template development
│   ├── .env.production.example   ← Template production
│   └── setup-env.sh              ← Setup script
│
└── frontend/
    ├── .env.production           ← JANGAN COMMIT (actual config)
    ├── .env.example              ← Template development
    └── .env.production.example   ← Template production
```

---

## 🔄 Ganti Server/IP Baru

**Tidak perlu edit code!** Hanya update 3 file:

### 1. Backend `.env`
```bash
ssh atha@NEW_IP
cd ~/sinfomik/backend
nano .env
```

Update:
```env
FRONTEND_URL=http://NEW_IP
ALLOWED_ORIGINS=http://NEW_IP:3000,http://NEW_IP:80
```

Restart:
```bash
pm2 restart sinfomik-backend
```

### 2. Frontend `.env.production`
```bash
# Local machine
cd frontend
nano .env.production
```

Update:
```env
REACT_APP_API_BASE_URL=http://NEW_IP:5000
```

Rebuild & upload:
```bash
npm run build
scp -r build/ atha@NEW_IP:~/sinfomik/frontend/
```

### 3. Nginx Config (if using)
```bash
ssh atha@NEW_IP
sudo nano /etc/nginx/sites-available/sinfomik
```

Update `server_name` ke NEW_IP, lalu:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Done! ✅** Aplikasi sudah jalan di server baru.

---

## 🎯 Keuntungan Menggunakan Env Vars

| Before (Hardcoded) | After (Env Vars) |
|-------------------|------------------|
| ❌ Edit code untuk ganti IP | ✅ Edit .env saja |
| ❌ Rebuild untuk setiap perubahan | ✅ Restart service saja |
| ❌ IP/secret ketahuan di Git | ✅ Aman, tidak di-commit |
| ❌ Sulit manage multi-environment | ✅ Mudah switch dev/staging/prod |
| ❌ Risky untuk production | ✅ Security best practice |

---

## 📚 Dokumentasi Lengkap

- **[CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)** - Panduan lengkap environment variables
- **[DEPLOY_VM_LINUX.md](DEPLOY_VM_LINUX.md)** - Deploy ke VM Linux
- **[backend/.env.example](backend/.env.example)** - Template & dokumentasi variables
- **[backend/setup-env.sh](backend/setup-env.sh)** - Interactive setup script

---

## 🔒 Security Checklist

- [x] `.env` tidak di-commit ke Git
- [x] JWT_SECRET menggunakan random 32+ karakter
- [x] Database password kuat (minimal 20 karakter)
- [x] File permission `.env` di-set 600 (owner only)
- [x] Tidak ada hardcoded credentials di code
- [x] CORS origins dibatasi hanya domain yang valid

---

## 🧪 Test Configuration

```bash
# Backend - Test env loading
cd backend
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT)"

# Frontend - Test build vars
cd frontend
npm run build 2>&1 | grep REACT_APP

# CORS - Test dari browser
fetch('http://20.41.105.73:5000/api/auth/login', {
  method: 'OPTIONS',
  credentials: 'include'
})
```

---

## 💡 Tips

1. **Backup .env Production**: Simpan di password manager (1Password, Bitwarden)
2. **Multiple Servers**: Buat `.env.server1`, `.env.server2` untuk tracking
3. **Documentation**: Update `.env.example` setiap ada variable baru
4. **Validation**: Tambah startup check untuk required env vars
5. **Version Control**: Commit hanya `.env.example`, NEVER `.env`

---

## ❓ FAQ

**Q: Kenapa masih error CORS setelah update .env?**  
A: Restart backend: `pm2 restart sinfomik-backend`

**Q: Frontend masih call ke localhost setelah build?**  
A: Pastikan `.env.production` ada SEBELUM run `npm run build`

**Q: Bagaimana cara generate JWT secret yang kuat?**  
A: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Q: Apakah perlu rebuild jika ganti JWT_SECRET?**  
A: Tidak. JWT_SECRET hanya di backend, cukup restart backend saja.

**Q: Bisa pakai domain instead of IP?**  
A: Ya! Tinggal ganti IP dengan domain di semua env files.

---

## 🆘 Need Help?

Baca dokumentasi lengkap:
- Configuration: [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)
- Deployment: [DEPLOY_VM_LINUX.md](DEPLOY_VM_LINUX.md)

Script otomatis:
```bash
cd backend
bash setup-env.sh
```
