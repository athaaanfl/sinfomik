# 🔐 JWT HTTP-Only Cookie - Quick Reference

## ✅ What Changed?

| Aspect | Before | After |
|--------|--------|-------|
| **Token Storage** | localStorage | HTTP-only Cookie |
| **JS Access** | ✅ Yes (vulnerable to XSS) | ❌ No (XSS protected) |
| **Auto-send** | ❌ Manual header | ✅ Browser automatic |
| **HTTPS Only** | ⚠️ Optional | ✅ Enforced in prod |

---

## 🎯 Key Security Features

1. ✅ **HttpOnly flag** - JavaScript tidak bisa akses
2. ✅ **Secure flag** - HTTPS only di production
3. ✅ **SameSite flag** - CSRF protection
4. ✅ **Session invalidation** - Logout hapus dari DB
5. ✅ **Single-session** - Login baru = token lama invalid

---

## 🚀 Developer Guide

### **Backend API (No Changes for Consumers)**

```javascript
// Login masih sama
POST /api/auth/login
Body: { username, password, user_type }

// Response: Token sekarang di cookie (bukan body)
Response: { success: true, user: {...} }
Set-Cookie: authToken=...; HttpOnly; Secure
```

### **Frontend API Calls**

```javascript
// ✅ Tambahkan credentials: 'include' di SEMUA fetch()
fetch('/api/endpoint', {
    method: 'POST',
    credentials: 'include',  // 👈 PENTING!
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

### **Logout**

```javascript
// ✅ Panggil endpoint logout (bukan hanya clear localStorage)
await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
});

// Kemudian clear user info
localStorage.removeItem('user');
```

---

## 🧪 Testing

### **Quick Test (Browser Console)**

```javascript
// 1. Setelah login, cek localStorage
localStorage.getItem('token')  // null ✅

// 2. Cek cookie (DevTools → Application → Cookies)
// Pastikan ada "authToken" dengan HttpOnly = true ✅

// 3. Coba akses via JS
document.cookie  // Tidak ada authToken ✅
```

### **Automated Test**

```bash
cd backend
node test_http_cookie_v2.js
```

---

## 🔧 Troubleshooting

### **Cookie tidak ter-set?**
```javascript
// Backend CORS harus enable credentials
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true  // 👈 HARUS true!
}));

// Frontend harus kirim credentials
fetch(url, { credentials: 'include' });
```

### **401 Unauthorized?**
```javascript
// Pastikan middleware baca dari cookie
let token = req.cookies?.authToken;  // ✅ Prioritas cookie
if (!token) {
    token = req.headers['authorization']?.split(' ')[1];  // Fallback
}
```

### **Cookie tidak hilang setelah logout?**
```javascript
// Pastikan path dan domain sama dengan saat set cookie
res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'  // 👈 Penting!
});
```

---

## 📋 Deployment Checklist

- [ ] Install `cookie-parser`: `npm install cookie-parser`
- [ ] Update backend code (server.js, authController.js, authMiddleware.js)
- [ ] Update frontend code (all api/*.js files)
- [ ] Set `NODE_ENV=production` di production
- [ ] Enable HTTPS di production
- [ ] Update CORS origin ke production domain
- [ ] Test login/logout flow
- [ ] Verify cookie flags di browser DevTools
- [ ] Test concurrent session (login dari 2 device)

---

## 🎓 Learning Resources

- **Cookie attributes**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
- **OWASP XSS**: https://owasp.org/www-community/attacks/xss/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

## ⚡ TL;DR

```bash
# What we did:
1. Token sekarang di HTTP-only cookie (bukan localStorage)
2. Frontend kirim credentials: 'include' di semua API calls
3. Backend baca token dari req.cookies.authToken
4. Logout invalidate session di database

# Result:
✅ XSS protection: Token tidak bisa diakses JavaScript
✅ Session management: Logout & concurrent login handled
✅ Production ready: HTTPS + Secure cookies
```

---

**Ready to deploy! 🚀**
