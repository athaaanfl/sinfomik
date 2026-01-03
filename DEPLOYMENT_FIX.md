# 🚀 Quick Deployment Guide - SINFOMIK

## Problem yang Sudah Diperbaiki ✅

**Masalah:** Frontend di production tidak terhubung ke backend karena masih menggunakan `localhost:5000`

**Solusi:** Dibuat file `.env.production` dengan URL backend Azure yang benar

---

## File yang Ditambahkan

### `frontend/.env.production`
```
REACT_APP_API_BASE_URL=https://sinfomik-backend-gzcng8eucydhgucz.southeastasia-01.azurewebsites.net
REACT_APP_ENABLE_PWA=true
GENERATE_SOURCEMAP=false
```

---

## Langkah Deploy ke Production

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy ke Azure Static Web Apps
```bash
# Deploy folder build/ ke Azure Static Web Apps
# URL Static Web App: https://salmon-glacier-082ece600.3.azurestaticapps.net
```

### 3. Verifikasi Backend
Backend sudah running di:
```
https://sinfomik-backend-gzcng8eucydhgucz.southeastasia-01.azurewebsites.net
```

Test dengan:
```bash
curl https://sinfomik-backend-gzcng8eucydhgucz.southeastasia-01.azurewebsites.net/api/auth/login
```

---

## Environment Variables

### Development (.env.local)
```
REACT_APP_API_BASE_URL=http://localhost:5000
```

### Production (.env.production)
```
REACT_APP_API_BASE_URL=https://sinfomik-backend-gzcng8eucydhgucz.southeastasia-01.azurewebsites.net
```

---

## Checklist Deploy ✅

- [x] Backend deployed di Azure App Service
- [x] Frontend `.env.production` sudah diset
- [x] Frontend build tanpa `localhost:5000`
- [x] CORS di backend sudah allow Azure domains
- [ ] Upload folder `frontend/build/` ke Azure Static Web Apps
- [ ] Test login dari production URL

---

## Testing Production

1. **Test Backend:**
   ```bash
   curl -X POST https://sinfomik-backend-gzcng8eucydhgucz.southeastasia-01.azurewebsites.net/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password","user_type":"admin"}'
   ```

2. **Test Frontend:**
   - Buka: https://salmon-glacier-082ece600.3.azurestaticapps.net
   - Coba login
   - Check Network tab di browser, pastikan request ke backend Azure (bukan localhost)

---

## Troubleshooting

### CORS Error
Pastikan di `backend/src/server.js` sudah ada:
```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [FRONTEND_URL, 'https://*.azurewebsites.net', 'https://*.azurestaticapps.net', ...]
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    exposedHeaders: ['Content-Disposition']
};
```

### 401 Unauthorized
- Pastikan JWT_SECRET di backend environment variables sudah diset
- Check token expiry (default 24 jam)

### Database Connection
- Pastikan PostgreSQL connection string benar di backend environment variables
- Test dengan: `az webapp ssh --name sinfomik-backend --resource-group sinfomik-rg`
