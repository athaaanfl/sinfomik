# Update Analisis Soal - Fix & Improvement

## ✅ Yang Sudah Diperbaiki

### 1. **Tombol "Generate Grid Soal" Eksplisit** 🎯
**Masalah:** Sebelumnya tidak ada tombol jelas untuk generate grid. User harus input jumlah soal tapi tidak tahu cara membuat gridnya.

**Solusi:**
- Tambah tombol **"🎯 Generate Grid Soal"**
- Letak: Di tengah, setelah input jumlah soal
- Fungsi: Klik untuk membuat tabel grid sesuai jumlah soal yang diinput
- Helper text: "Klik untuk membuat tabel soal"

**Cara Pakai:**
```
1. Input Jumlah Soal: 30
2. Klik "Generate Grid Soal"
3. Grid dengan 30 kolom soal muncul
```

---

### 2. **Fix Run Analysis - Tidak Load TP** ⚠️
**Masalah:** Saat klik "Run Analysis", sistem malah load kolom TP (Tujuan Pembelajaran) dari rekap nilai, padahal ini untuk **analisis soal UAS/ulangan**, bukan TP.

**Kode Lama (SALAH):**
```javascript
const itemKeys = (questionKeys && questionKeys.length > 0) 
  ? questionKeys 
  : uniqueGradeTypes.filter(t => t.startsWith('TP')); // ❌ Load TP sebagai fallback
```

**Kode Baru (BENAR):**
```javascript
// Validasi: harus ada grid soal terlebih dahulu
if (!questionKeys || questionKeys.length === 0) {
  setMessage('Harap generate grid soal terlebih dahulu!');
  setMessageType('error');
  return;
}

// Untuk analisis soal UAS, gunakan questionKeys (bukan TP)
const itemKeys = questionKeys; // ✅ Hanya gunakan questionKeys yang sudah di-generate
```

**Solusi:**
- Hapus fallback ke TP columns
- Tambahkan validasi: harus generate grid dulu sebelum run analysis
- Error message jelas: "Harap generate grid soal terlebih dahulu!"

---

### 3. **Tombol Run Analysis dengan Validasi** ▶️
**Improvement:**
- Tombol **disabled** jika grid belum di-generate
- Helper text: "Generate grid terlebih dahulu"
- Visual feedback: tombol mati jika `questionKeys.length === 0`

---

### 4. **UI/UX Lebih Jelas** 🎨

**Struktur Baru:**
```
┌─ Setup Analisis Soal ────────────────────────┐
│ [Mata Pelajaran] [Kelas]                     │
│                                              │
│ [Jumlah Soal: 30]                           │
│ [🎯 Generate Grid Soal] [▶️ Run Analysis]   │
│   ↑ Klik dulu          ↑ Setelah generate   │
│                                              │
│ [Atau Paste dari Excel (opsional)]          │
│ [Export / Actions]                           │
└──────────────────────────────────────────────┘
```

**Perubahan:**
- ✅ Tambah heading "Setup Analisis Soal"
- ✅ Layout grid yang lebih rapi (3 kolom)
- ✅ Tombol Clear Analysis terpisah
- ✅ Export buttons disabled jika belum ada hasil analisis

---

### 5. **Tombol Clear Analysis** 🗑️
**Baru:**
- Tombol "🗑️ Clear Analysis" untuk hapus hasil analisis
- Tidak menghapus grid atau data siswa
- Hanya reset: `analysisResults`, `cronbachAlpha`, `semValue`

---

## 🎯 Workflow yang Benar

### Sebelum (Bingung):
1. User input jumlah soal: 30
2. User klik "Run Analysis" ❌
3. Sistem load TP columns (SALAH!)
4. User bingung kenapa hasilnya TP bukan soal

### Sesudah (Jelas):
1. User input jumlah soal: **30**
2. User klik **"Generate Grid Soal"** ← JELAS!
3. Grid muncul dengan 30 kolom soal
4. User input nilai siswa (atau paste dari Excel)
5. User klik **"Run Analysis"** ← Tombol aktif
6. Sistem analisis **soal UAS** (bukan TP) ✅

---

## 📝 Scale Custom

Jangan lupa untuk Excel dengan max score berbeda:
1. Pilih scale: **"Custom (per soal)"**
2. Generate grid
3. Muncul row **"Max Score"** (background biru)
4. Input max per soal: 4, 4, 4, ..., 8, 8, 12, 12, 12

---

## ✅ Checklist Update

- [x] Fix runAnalysis: tidak load TP columns
- [x] Tambah validasi: wajib generate grid dulu
- [x] Tombol "Generate Grid Soal" eksplisit
- [x] Tombol "Run Analysis" dengan disabled state
- [x] Tombol "Clear Analysis"
- [x] Export buttons dengan disabled state
- [x] UI/UX layout lebih jelas
- [x] Helper text untuk setiap action
- [x] Success/error messages

---

## 🎓 Kesimpulan

Sekarang **workflow analisis soal UAS** sudah jelas:
1. Setup (Mapel, Kelas, Jumlah Soal)
2. **Generate Grid** ← Tombol eksplisit!
3. Input nilai (manual atau paste)
4. **Run Analysis** ← Analisis soal UAS, bukan TP!
5. Export hasil

**Tidak ada lagi kebingungan!** 🎉
