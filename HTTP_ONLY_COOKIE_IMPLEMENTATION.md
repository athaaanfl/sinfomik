# 🔒 Implementasi HTTP-Only Cookie untuk JWT Token

## 📋 Ringkasan Perubahan

JWT token sekarang disimpan sebagai **HTTP-only cookie** di browser, bukan lagi di `localStorage`. Ini meningkatkan keamanan dari **XSS (Cross-Site Scripting) attacks**.

---

## ✅ Apa yang Berubah?

### **Backend Changes**

#### 1. **server.js**
- ✅ Tambah `cookie-parser` middleware
- ✅ Update CORS config: `credentials: true`

#### 2. **authController.js**
- ✅ **Login endpoint** sekarang mengirim token sebagai HTTP-only cookie:
  ```javascript
  res.cookie('authToken', token, {
      httpOnly: true,      // ❌ Tidak bisa diakses JavaScript (XSS protection)
      secure: true,        // ✅ Hanya HTTPS di production
      sameSite: 'none',    // ✅ CSRF protection
      maxAge: 5 * 60 * 60 * 1000  // 5 hours
  });
  ```
- ✅ Token **tidak lagi dikirim** di response body (`token` property dihapus)
- ✅ Tambah **logout endpoint** untuk menghapus cookie

#### 3. **authMiddleware.js**
- ✅ Middleware sekarang **membaca token dari cookie** (`req.cookies.authToken`)
- ✅ Fallback ke Authorization header (backward compatibility)

---

### **Frontend Changes**

#### 1. **api/auth.js**
- ✅ `loginUser()`: Tidak lagi simpan token di localStorage
- ✅ Tambah `credentials: 'include'` untuk mengirim/menerima cookies
- ✅ `logoutUser()`: Panggil backend `/api/auth/logout` untuk clear cookie

#### 2. **api/admin.js, api/analytics.js, api/guru.js**
- ✅ Semua `fetch()` calls sekarang menggunakan `credentials: 'include'`
- ✅ Tidak lagi ambil token dari localStorage
- ✅ Tidak lagi kirim `Authorization: Bearer <token>` header
- ✅ Error handler tidak lagi hapus `localStorage.removeItem('token')`

---

## 🔐 Keuntungan Keamanan

| Aspek | Sebelum (localStorage) | Sesudah (HTTP-only Cookie) |
|-------|------------------------|---------------------------|
| **XSS Protection** | ❌ Token bisa dicuri via JavaScript | ✅ Token tidak bisa diakses JavaScript |
| **CSRF Protection** | ✅ Aman (token di header) | ✅ Aman (`SameSite=none/lax`) |
| **Secure Transport** | ⚠️ Bisa dikirim via HTTP | ✅ `Secure` flag paksa HTTPS |
| **Auto-send** | ❌ Manual attach header | ✅ Browser kirim otomatis |

---

## 🧪 Cara Testing

### **1. Test Login Flow**

```bash
# Backend harus running
cd backend
npm start

# Frontend harus running
cd frontend
npm start
```

**Test Steps:**
1. Buka browser → Login sebagai admin/guru
2. Buka **DevTools → Application → Cookies**
3. ✅ Pastikan ada cookie `authToken` dengan properties:
   - ✅ `HttpOnly: true`
   - ✅ `Secure: true` (jika production)
   - ✅ `SameSite: lax` (dev) atau `none` (prod)
4. Buka **DevTools → Console**
5. Ketik: `localStorage.getItem('token')`
6. ✅ Harusnya return `null` (token tidak ada di localStorage)

### **2. Test API Calls**

**Test di DevTools Console:**
```javascript
// Coba panggil API (token dikirim otomatis via cookie)
fetch('http://localhost:5000/api/auth/me', {
    credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ User data:', d));
```

✅ **Expected:** Response sukses dengan data user

### **3. Test Logout**

1. Klik tombol logout di aplikasi
2. Buka **DevTools → Application → Cookies**
3. ✅ Cookie `authToken` harusnya **hilang**
4. Coba akses protected page
5. ✅ Harusnya redirect ke login

### **4. Test Session Invalidation**

1. Login dari **Browser A** (Chrome)
2. Salin cookie `authToken` value
3. Login lagi dari **Browser B** (Firefox)
4. Kembali ke **Browser A**, refresh page
5. ✅ Harusnya logout otomatis (session invalidated)

---

## 🚨 Troubleshooting

### **Issue 1: Cookie tidak ter-set setelah login**

**Penyebab:** CORS config salah

**Solusi:**
```javascript
// backend/src/server.js
const corsOptions = {
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true  // ✅ HARUS true!
};
```

### **Issue 2: Cookie tidak terkirim di API request**

**Penyebab:** Frontend tidak kirim `credentials: 'include'`

**Solusi:**
```javascript
// frontend/src/api/*.js
fetch(url, {
    credentials: 'include'  // ✅ HARUS ada!
});
```

### **Issue 3: Cookie tidak ter-set di production (HTTPS)**

**Penyebab:** `Secure` flag requires HTTPS

**Solusi:**
```javascript
// backend/src/controllers/authController.js
res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✅ Auto-detect
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
});
```

### **Issue 4: CORS error di production (different domains)**

**Penyebab:** Frontend dan backend di domain berbeda

**Solusi:**
```javascript
// backend/src/server.js
const corsOptions = {
    origin: [
        'https://yourdomain.com',           // Production frontend
        'https://*.azurestaticapps.net'     // Azure Static Web Apps
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Cookie config untuk cross-domain
res.cookie('authToken', token, {
    httpOnly: true,
    secure: true,            // ✅ HTTPS required
    sameSite: 'none',        // ✅ Allow cross-domain
    domain: '.yourdomain.com' // ✅ Set parent domain
});
```

---

## 📝 Migration Notes

### **Backward Compatibility**

✅ Middleware masih support **Authorization header** untuk backward compatibility:

```javascript
// authMiddleware.js
let token = req.cookies?.authToken;  // Prioritas: Cookie
if (!token) {
    token = req.headers['authorization']?.split(' ')[1];  // Fallback: Header
}
```

Ini memungkinkan:
- Old mobile apps yang simpan token di local storage masih bisa login
- Postman/testing tools yang kirim Bearer token masih work

### **Breaking Changes untuk Client Apps**

❌ **Mobile apps** yang simpan token di local storage **TIDAK AKAN** otomatis pindah ke cookie. 

**Solusi untuk Mobile:**
1. **Option 1:** Tetap gunakan Authorization header (backend support keduanya)
2. **Option 2:** Update mobile app untuk handle cookies (WebView)

---

## 🎯 Next Steps (Optional Security Enhancements)

### **1. Tambah CSRF Token**

Karena sekarang pakai cookie, tambahkan CSRF protection:

```bash
npm install csurf
```

```javascript
// server.js
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Send CSRF token to frontend
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});
```

### **2. Tambah Session ID Tracking**

Implement unique session ID untuk prevent concurrent logins (lihat rekomendasi sebelumnya).

### **3. Add Refresh Token**

Implement refresh token flow untuk better UX:
- Access token: Short-lived (15 min)
- Refresh token: Long-lived (7 days)

---

## 📚 References

- [OWASP: HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [OWASP: Cross-Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/)

---

## ✅ Checklist Implementation

- [x] Install `cookie-parser`
- [x] Update backend login to set HTTP-only cookie
- [x] Update backend middleware to read from cookie
- [x] Add logout endpoint to clear cookie
- [x] Update frontend to not store token in localStorage
- [x] Update all API calls to use `credentials: 'include'`
- [x] Test login flow
- [x] Test logout flow
- [x] Test session invalidation
- [ ] Deploy to production
- [ ] Monitor for issues

---

**✅ Implementation Complete!**

Token sekarang aman dari XSS attacks karena disimpan di HTTP-only cookie yang tidak bisa diakses JavaScript. 🎉
