# Setup CI/CD dengan GitHub Actions

## Overview

2 Server:
- **Development**: 20.196.66.95 (untuk belajar/testing) - Deploy dari branch `dev`
- **Production**: 34.123.111.227 (sinfokas.online) - Deploy dari branch `main`

2 Workflows:
- `.github/workflows/deploy-dev.yml` - Auto-deploy ke server development
- `.github/workflows/deploy.yml` - Auto-deploy ke server production

## 1. Setup SSH Key untuk GitHub Actions

Di lokal PC, generate 2 SSH key berbeda (satu untuk dev, satu untuk production):

```bash
# Key untuk Development Server
ssh-keygen -t ed25519 -C "github-actions-dev" -f github-actions-dev-key

# Key untuk Production Server
ssh-keygen -t ed25519 -C "github-actions-prod" -f github-actions-prod-key
```

Ini akan generate 4 file total:
- `github-actions-dev-key` + `github-actions-dev-key.pub`
- `github-actions-prod-key` + `github-actions-prod-key.pub`

## 2. Add Public Keys ke Server

### Development Server (20.196.66.95)

```bash
# Copy public key
cat github-actions-dev-key.pub

# SSH ke development server
ssh atha@20.196.66.95

# Add public key ke authorized_keys
nano ~/.ssh/authorized_keys
# Paste public key, save & exit

# Set permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Production Server (34.123.111.227)

```bash
# Copy public key
cat github-actions-prod-key.pub

# SSH ke production server
ssh atha@34.123.111.227

# Add public key ke authorized_keys
nano ~/.ssh/authorized_keys
# Paste public key, save & exit

# Set permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## 3. Add Secrets ke GitHub Repository

Buka repository GitHub → Settings → Secrets and variables → Actions → New repository secret

**Add 8 secrets total:**

### Development Server Secrets (prefix: DEV_)

1. **DEV_SERVER_HOST**
   - Value: `20.196.66.95`

2. **DEV_SERVER_USER**
   - Value: `atha` (atau username server dev Anda)

3. **DEV_SSH_PRIVATE_KEY**
   - Value: Isi dari file `github-actions-dev-key`
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   ... (copy semua isi file) ...
   -----END OPENSSH PRIVATE KEY-----
   ```

4. **DEV_REACT_APP_API_BASE_URL**
   - Value: `` (empty string)

### Production Server Secrets (no prefix)

5. **SERVER_HOST**
   - Value: `34.123.111.227`

6. **SERVER_USER**
   - Value: `atha`

7. **SSH_PRIVATE_KEY**
   - Value: Isi dari file `github-actions-prod-key`

8. **REACT_APP_API_BASE_URL**
   - Value: `` (empty string)

## 4. Setup PM2 Sudoers (di KEDUA server)

Lakukan di development dan production server:

```bash
# SSH ke server
ssh atha@20.196.66.95  # atau ssh atha@34.123.111.227

# Edit sudoers
sudo visudo

# Add line di paling bawah (replace 'atha' dengan username Anda):
atha ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx, /bin/systemctl restart nginx, /bin/systemctl status nginx
```

Save & exit (Ctrl+X, Y, Enter)

## 5. Create Dev Branch

```bash
# Di lokal, buat branch dev dari main
git checkout -b dev
git push origin dev
```

## 6. Test Manual SSH Connection

```bash
# Test Development Server
ssh -i github-actions-dev-key atha@20.196.66.95
pm2 status
sudo systemctl reload nginx
exit

# Test Production Server  
ssh -i github-actions-prod-key atha@34.123.111.227
pm2 status
sudo systemctl reload nginx
exit
```

## 7. Cara Kerja CI/CD

### Development (Server Belajar)

Push ke branch `dev`:

```bash
git checkout dev
git add .
git9. Monitoring Deployment

**Check logs di GitHub:**
- Repository → Actions → Pilih workflow run → Lihat logs
- Workflow berbeda untuk dev dan production

**Check di development server:**
```bash
ssh atha@20.196.66.95
pm2 logs sinfomik-backend --lines 50
sudo tail -f /var/log/nginx/sinfomik-error.log
```

**Check di production server:**
```bash
ssh atha@34.123.111.227
pm2 logs sinfomik-backend --lines 50erge perubahan dari dev
git push origin main
```

→ Auto-deploy ke **34.123.111.227** (sinfokas.online)

**Workflow berlangsung otomatis dalam 2-3 menit**

## 8. Workflow Development

1. Develop di branch `dev`
2. Test di development server (20.196.66.95)
3. Kalau OK, merge `dev` → `main`
4. Auto-deploy ke production (sinfokas.online)

```bash
# Step by step
git checkout dev
# ... coding ...
git add .
git commit -m "Add new feature"
git push origin dev
# → Deploy ke server belajar, test dulu

# Kalau sudah OK:
git checkout main
git merge dev
git push origin main
# → Deploy ke production
```

1. ✅ GitHub Actions checkout code
2. ✅ Install dependencies
3. ✅ Build frontend production
4. ✅ Upload frontend build ke server
5. ✅ Upload backend ke server
6. ✅ Install dependencies di server
7. ✅ Restart PM2 backend
8. ✅ Reload Nginx

**Workflow berlangsung otomatis dalam 2-3 menit**

## 7. Push & Deploy

```bash
git add .
git commit -m "Setup CI/CD"
git push origin main
```

Lihat progress di GitHub → Actions tab

## 8. Monitoring Deployment

**Check logs di GitHub:**
- Repository → Actions → Pilih workflow run → Lihat logs

**Check di server:**
```bash
ssh atha@34.123.111.227

# Check PM2 logs
pm2 logs sinfomik-backend --lines 50

# C10. Rollback jika Ada Masalah

**Development:**
```bash
ssh atha@20.196.66.95
cd /var/www
sudo rm -rf sinfomik
sudo mv sinfomik.backup sinfomik
pm2 restart sinfomik-backend
sudo systemctl reload nginx
```

**Production:**
```bash
ssh atha@34.123.111.227
cd /var/www
sudo rm -rf sinfomik
sudo mv sinfomik.backup sinfomik
pm2 restart sinfomik-backend
sudo systemctl reload nginx
```

## 11. Tips

- **Always test di dev dulu** sebelum merge ke main
- Branch `dev` → Development server (20.196.66.95)
- Branch `main` → Production server (sinfokas.online)
- Jangan push langsung ke `main` tanpa test di `dev`
- Lihat logs di GitHub Actions jika deployment gagal
- Backup otomatis dibuat setiap deployment
- File `.env` di server tidak akan tertimpa deployment

## 12. Quick Reference

| Branch | Server | Domain | Purpose |
|--------|--------|--------|---------|
| `dev` | 20.196.66.95 | - | Testing/Learning |
| `main` | 34.123.111.227 | sinfokas.online | Production |

**Deploy Commands:**
```bash
# Deploy to Development
git checkout dev
git push origin dev

# Deploy to Production
git checkout main
git merge dev
git push origin main

```yaml
on:
  workflow_dispatch:  # Manual trigger via GitHub UI
```
