# 🚀 PANDUAN DEPLOY SINFOMIK KE AZURE APP SERVICE

## ✅ Prerequisites

1. Akun Azure (bisa free trial)
2. Azure CLI installed: https://aka.ms/azure-cli
3. Git installed
4. VS Code dengan extension "Azure App Service"

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **PART 1: Buat Resource di Azure Portal**

#### 1. Buat Storage Account (untuk SQLite persistent storage)

1. Login ke https://portal.azure.com
2. Klik **Create a resource** → **Storage account**
3. Isi form:
   - **Resource group**: Buat baru → `sinfomik-rg`
   - **Storage account name**: `sinfomikstorage` (harus unique)
   - **Region**: Southeast Asia
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally-redundant storage)
4. Klik **Review + Create** → **Create**
5. Setelah selesai, masuk ke storage account
6. Klik **File shares** (di menu kiri)
7. Klik **+ File share**:
   - **Name**: `sinfomik-data`
   - **Tier**: Transaction optimized
   - Klik **Create**

#### 2. Buat App Service untuk Backend

1. Klik **Create a resource** → **Web App**
2. Isi form:
   - **Resource group**: `sinfomik-rg` (yang tadi)
   - **Name**: `sinfomik-backend` (harus unique, akan jadi URL)
   - **Publish**: Code
   - **Runtime stack**: Node 20 LTS
   - **Operating System**: Linux
   - **Region**: Southeast Asia
   - **Pricing plan**: 
     - Klik **Create new** → pilih **Basic B1** atau **Free F1**
3. Klik **Review + Create** → **Create**

#### 3. Mount Storage ke App Service

1. Buka **sinfomik-backend** App Service yang baru dibuat
2. Di menu kiri, klik **Configuration**
3. Tab **Path mappings**
4. Klik **+ New Azure Storage Mount**
5. Isi form:
   - **Name**: `database`
   - **Configuration options**: Basic
   - **Storage accounts**: Pilih `sinfomikstorage`
   - **Storage type**: Azure Files
   - **Share name**: `sinfomik-data`
   - **Mount path**: `/home/data`
6. Klik **OK**
7. Klik **Save** di atas

#### 4. Set Environment Variables

1. Masih di **Configuration** → tab **Application settings**
2. Klik **+ New application setting** untuk setiap variable:

   ```
   DB_PATH = /home/data/academic_dashboard.db
   NODE_ENV = production
   JWT_SECRET = ganti_dengan_random_string_panjang_minimal_32_karakter
   PORT = 8080
   FRONTEND_URL = https://sinfomik-frontend.azurewebsites.net
   ```

3. Klik **Save**

---

### **PART 2: Deploy Backend**

#### Option A: Deploy via VS Code (RECOMMENDED)

1. Install extension **Azure App Service** di VS Code
2. Login ke Azure (klik icon Azure di sidebar)
3. Right-click folder **backend** → **Deploy to Web App**
4. Pilih **sinfomik-backend**
5. Confirm deployment
6. Tunggu sampai selesai (5-10 menit)

#### Option B: Deploy via Git

```bash
# Login ke Azure
az login

# Set deployment user (sekali saja)
az webapp deployment user set --user-name <username> --password <password>

# Dapat Git URL
az webapp deployment source config-local-git --name sinfomik-backend --resource-group sinfomik-rg

# Copy URL yang muncul, lalu:
cd backend
git init
git add .
git commit -m "Initial deploy"
git remote add azure <URL_yang_tadi>
git push azure main
```

#### Option C: Deploy via GitHub Actions

1. Push code ke GitHub
2. Di Azure Portal → App Service → **Deployment Center**
3. Pilih **GitHub** → Authorize → Pilih repo
4. Azure akan auto-create workflow file
5. Push = auto deploy

---

### **PART 3: Setup Database**

Setelah backend deploy:

1. Di Azure Portal → App Service → **SSH** atau **Advanced Tools (Kudu)**
2. Klik **SSH** → **Go**
3. Jalankan:
   ```bash
   cd /home/site/wwwroot/backend
   node src/init_db.js
   ```
4. Database akan dibuat di `/home/data/academic_dashboard.db`

---

### **PART 4: Deploy Frontend**

#### 1. Update API URL di Frontend

Edit `frontend/src/api/admin.js` dan semua API files:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://sinfomik-backend.azurewebsites.net';
```

#### 2. Build Frontend

```bash
cd frontend
npm install
npm run build
```

#### 3. Deploy Frontend ke Azure Static Web Apps (FREE!)

1. Azure Portal → **Create a resource** → **Static Web App**
2. Isi form:
   - **Resource group**: `sinfomik-rg`
   - **Name**: `sinfomik-frontend`
   - **Plan type**: Free
   - **Region**: East Asia
   - **Deployment source**: Other
3. **Create**
4. Setelah jadi, upload folder `build`:
   - Cara 1: Drag & drop via portal
   - Cara 2: Azure CLI:
     ```bash
     az staticwebapp upload --name sinfomik-frontend \
       --resource-group sinfomik-rg \
       --source ./frontend/build
     ```

#### Option Alternatif: Deploy Frontend ke App Service juga

1. Buat App Service baru untuk frontend
2. Deploy folder `frontend/build`
3. Add static file handler

---

### **PART 5: Configure CORS**

Update backend `server.js` CORS config dengan frontend URL:

```javascript
const corsOptions = {
  origin: ['https://sinfomik-frontend.azurewebsites.net', 'http://localhost:3000'],
  credentials: true
};
```

Redeploy backend.

---

## 🔍 Testing

1. **Backend API**: https://sinfomik-backend.azurewebsites.net
2. **Frontend**: https://sinfomik-frontend.azurewebsites.net
3. Test login, CRUD operations, file upload

---

## 📊 Monitoring & Logs

### View Logs:
```bash
# Stream logs
az webapp log tail --name sinfomik-backend --resource-group sinfomik-rg

# Download logs
az webapp log download --name sinfomik-backend --resource-group sinfomik-rg
```

### Di Portal:
- App Service → **Monitoring** → **Log stream**
- App Service → **Diagnose and solve problems**

---

## 💰 Pricing Estimate (per bulan)

- **Storage Account**: ~$2
- **App Service Basic B1**: ~$55 (atau Free F1 = $0 tapi limited)
- **Static Web App**: FREE
- **Total**: ~$57/month atau $0 dengan Free tier

---

## 🔧 Troubleshooting

### Database tidak persist setelah restart:
- Cek Path Mappings sudah benar
- Cek DB_PATH environment variable
- Restart App Service

### Error 500:
- Cek logs: `az webapp log tail ...`
- Cek environment variables
- Cek database path

### CORS Error:
- Update FRONTEND_URL di backend config
- Redeploy backend

### Upload file gagal:
- Cek folder `uploads/` permissions
- Bisa mount storage juga untuk uploads

---

## 📝 Notes

- **Free tier** hanya untuk testing (limited resource, auto sleep)
- **Basic B1** recommended untuk production
- **Database backup**: Download `/home/data/academic_dashboard.db` secara berkala
- **SSL**: Auto-enabled (HTTPS)

---

## 🎉 Done!

Aplikasi sudah live di Azure! 

Frontend: `https://sinfomik-frontend.azurewebsites.net`
Backend: `https://sinfomik-backend.azurewebsites.net`

Selamat! 🚀
