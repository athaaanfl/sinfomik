# 📝 Perbedaan Konfigurasi: Azure vs VM

## 🔵 Azure Deployment (Current)

### Backend `.env`:
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://salmon-glacier-082ece600.3.azurestaticapps.net

# Azure PostgreSQL
DB_TYPE=postgres
DB_HOST=sinfomik-db-server.postgres.database.azure.com
DB_USER=sinfomik_admin@sinfomik-db-server
DB_PASSWORD=YourAzurePassword
DB_SSL=true

JWT_SECRET=your_azure_jwt_secret
JWT_EXPIRES_IN=5h
```

### Frontend `.env`:
```env
REACT_APP_API_BASE_URL=https://sinfomik-backend-gzcng8eucydhgucz.southeastasia-01.azurewebsites.net/api
```

### CORS di `server.js`:
```javascript
origin: [
  'https://salmon-glacier-082ece600.3.azurestaticapps.net',
  'https://sinfomik-backend-gzcng8eucydhgucz.southeastasia-01.azurewebsites.net'
]
```

---

## 🟢 VM Deployment (sinfokas.online)

### Backend `.env`:
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://sinfokas.online

# Local PostgreSQL di VM
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sinfomik_db
DB_USER=sinfomik_user
DB_PASSWORD=YourStrongVMPassword123!

JWT_SECRET=GANTI_DENGAN_SECRET_YANG_BERBEDA_DARI_AZURE
JWT_EXPIRES_IN=5h
```

### Frontend `.env`:
```env
REACT_APP_API_BASE_URL=https://sinfokas.online/api
```

### CORS di `server.js`:
```javascript
origin: [
  'https://sinfokas.online',
  'http://sinfokas.online',
  'https://34.123.111.227',
  'http://34.123.111.227'
]
```

---

## ⚡ Quick Setup untuk VM

### 1. Backend Setup
```bash
cd /var/www/sinfomik/backend

# Copy template dan edit
cp .env.vm.example .env
nano .env

# Update values:
# - FRONTEND_URL=https://sinfokas.online
# - DB_PASSWORD=<password_postgresql_vm>
# - JWT_SECRET=<generate_random_secret>

# Generate JWT Secret (recommended):
openssl rand -base64 64
```

### 2. Frontend Setup
```bash
cd /var/www/sinfomik/frontend

# Copy template dan edit
cp .env.vm.example .env
nano .env

# Update:
# REACT_APP_API_BASE_URL=https://sinfokas.online/api
```

### 3. Cookie Configuration

**PENTING:** Di VM dengan domain sendiri, cookie settings harus adjusted:

Backend `authController.js`:
```javascript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true,              // HTTPS only
  sameSite: 'lax',          // ✅ 'lax' untuk same domain
  domain: 'sinfokas.online', // ✅ Explicit domain
  maxAge: 5 * 60 * 60 * 1000
});
```

Azure deployment:
```javascript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',  // ❌ 'none' untuk cross-domain
  maxAge: 5 * 60 * 60 * 1000
});
```

---

## 🎯 Yang Perlu Diubah di Code

### 1. `server.js` - CORS (SUDAH DIUBAH ✅)
Tambahkan domain VM ke allowed origins.

### 2. `authController.js` - Cookie Settings
Ubah `sameSite` dari `'none'` ke `'lax'` untuk VM:

```javascript
// Line 52-56 & 207-211
res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // ✅ Changed
  maxAge: 5 * 60 * 60 * 1000
});
```

### 3. Database Migration (jika perlu)

Jika mau migrate dari Azure PostgreSQL ke VM PostgreSQL:

```bash
# Export dari Azure
pg_dump -h sinfomik-db-server.postgres.database.azure.com \
        -U sinfomik_admin@sinfomik-db-server \
        -d sinfomik_db \
        -F c -f backup.dump

# Import ke VM
pg_restore -h localhost \
           -U sinfomik_user \
           -d sinfomik_db \
           backup.dump
```

---

## 📊 Checklist Deployment

- [ ] Copy `.env.vm.example` → `.env` di backend
- [ ] Update `FRONTEND_URL` di backend `.env`
- [ ] Update `DB_*` credentials di backend `.env`
- [ ] Generate & update `JWT_SECRET`
- [ ] Copy `.env.vm.example` → `.env` di frontend
- [ ] Update `REACT_APP_API_BASE_URL` di frontend `.env`
- [ ] Setup PostgreSQL database di VM
- [ ] Update cookie `sameSite` setting di `authController.js`
- [ ] Setup Nginx dengan config dari `VM_DEPLOYMENT_GUIDE.md`
- [ ] Setup SSL dengan Let's Encrypt
- [ ] Test login & cookie functionality
- [ ] Check CORS di browser DevTools
- [ ] Monitor PM2 logs untuk errors

---

## 🔍 Testing

```bash
# 1. Test backend health
curl http://localhost:5000/health

# 2. Test dari luar VM
curl https://sinfokas.online/api/health

# 3. Test login
# Buka browser: https://sinfokas.online
# Login dengan credentials
# Cek DevTools → Application → Cookies
# Harus ada 'authToken' dengan:
#   - HttpOnly: ✓
#   - Secure: ✓
#   - SameSite: Lax
#   - Domain: sinfokas.online
```
