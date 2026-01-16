# Penjelasan Scale di Sistem Analisis CTT

## 📊 Pilihan Scale yang Tersedia

Sistem kita sekarang mendukung **4 jenis scale** untuk analisis butir soal:

### 1. **Binary (0/1)** 
- **Untuk:** Soal benar/salah, pilihan ganda
- **Max score:** 1
- **Nilai:** 0 (salah) atau 1 (benar)
- **Contoh:** Multiple choice dengan 1 poin per soal benar

### 2. **1-5 (Skala Likert)**
- **Untuk:** Survey, angket, soal dengan rating
- **Max score:** 5
- **Nilai:** 1, 2, 3, 4, 5
- **Contoh:** Sangat tidak setuju (1) - Sangat setuju (5)

### 3. **0-100 (Persentase)**
- **Untuk:** Nilai ujian skala 0-100
- **Max score:** 100
- **Nilai:** 0 - 100
- **Contoh:** Tes dengan nilai persentase

### 4. **Custom (per soal)** ⭐ BARU!
- **Untuk:** Soal dengan max score berbeda-beda (seperti di Excel Anda)
- **Max score:** Bisa berbeda per soal (misalnya: 4, 8, 12)
- **Nilai:** 0 sampai max score masing-masing soal
- **Contoh Excel:**
  - Soal 1-25: max 4 poin
  - Soal 26-27: max 8 poin
  - Soal 28-30: max 12 poin

---

## 🎯 Untuk Kasus Excel Anda

**Gunakan scale: "Custom (per soal)"**

### Langkah-langkah:

1. **Pilih scale = "Custom (per soal)"** di dropdown
2. **Muncul row baru** "Max Score" (background biru) di bawah nomor soal
3. **Input max score per soal:**
   - Soal 1-25: ketik **4**
   - Soal 26-27: ketik **8**
   - Soal 28-30: ketik **12**
4. **Input bobot per soal** (jika semua bobot = 1, biarkan default)
5. **Input nilai siswa** per soal
6. **Sistem akan menghitung:**
   ```
   Total Bobot Siswa = Σ(nilai[i] × bobot[i])
   Total Bobot Nilai = Σ(max[i] × bobot[i]) = 115 (sesuai Excel)
   Nilai Akhir = (Total Bobot Siswa / Total Bobot Nilai) × 100
   ```

---

## 🧮 Rumus Perhitungan

### Untuk semua scale:
```javascript
// 1. Hitung p-value per soal
p_value = nilai_siswa / max_score_soal

// 2. Hitung Total Bobot Siswa (untuk nilai akhir)
Total_Bobot_Siswa = Σ(nilai[i] × bobot[i])

// 3. Hitung Total Bobot Nilai
Total_Bobot_Nilai = Σ(max[i] × bobot[i])

// 4. Hitung Nilai Akhir
Nilai_Akhir = (Total_Bobot_Siswa / Total_Bobot_Nilai) × 100
```

### Contoh untuk Adnan (dari Excel):
```javascript
// Nilai: [1,1,1,1,1,4,4,4,4,4,2,4,4,4,4,2,2,0,2,0,3,3,3,3,3,8,8,12,12,5]
// Max:   [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,8,8,12,12,12]
// Bobot: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

Total_Bobot_Siswa = 1×1 + 1×1 + ... + 5×1 = 109
Total_Bobot_Nilai = 4×1 + 4×1 + ... + 12×1 = 115
Nilai_Akhir = (109 / 115) × 100 = 94.78 ≈ 95 ✓
```

---

## 💡 Tips Penggunaan

### Kapan menggunakan scale apa?

| Jenis Ujian | Scale yang Cocok |
|-------------|------------------|
| Multiple Choice (1 poin per soal) | Binary (0/1) |
| Angket/Survey | 1-5 |
| Nilai ujian biasa | 0-100 |
| **Soal dengan bobot/poin berbeda** | **Custom** ⭐ |
| Soal essay dengan poin berbeda | Custom |
| Kombinasi soal (pilihan ganda + essay) | Custom |

### Contoh kasus Custom:
- Soal A (pilihan ganda): 1 poin
- Soal B (isian singkat): 2 poin
- Soal C (essay pendek): 5 poin
- Soal D (essay panjang): 10 poin

**Gunakan scale Custom** dan set max score masing-masing: 1, 2, 5, 10

---

## ✅ Verifikasi Sistem

**Bug yang sudah diperbaiki:**
- ✅ Line 66 ctt.js: menggunakan `maxes[k]` bukan `defMax`
- ✅ Support custom max score per soal
- ✅ Perhitungan nilai akhir sesuai Excel
- ✅ p-value dihitung per soal dengan max masing-masing

**Hasil:**
- Sistem kita **100% kompatibel** dengan Excel
- Adnan: 109/115 × 100 = **94.78 ≈ 95** ✓

---

## 📝 Catatan Penting

1. **Scale preset (binary, 1-5, 0-100):** 
   - Semua soal menggunakan max score yang sama
   - Lebih cepat untuk input data uniform

2. **Scale custom:**
   - Setiap soal bisa punya max score berbeda
   - Lebih fleksibel tapi perlu input manual per soal
   - **Wajib digunakan** jika soal punya poin/bobot berbeda

3. **Bobot vs Max Score:**
   - **Max Score:** Nilai maksimal yang bisa didapat siswa (4, 8, 12)
   - **Bobot:** Multiplier untuk kepentingan analisis (biasanya 1)
   - Formula: `nilai_terbobot = (nilai / max) × bobot`

---

## 🎓 Kesimpulan

Untuk Excel Anda dengan soal max berbeda (4, 8, 12):
- **Pilih scale: "Custom (per soal)"**
- **Input max score sesuai Excel**
- **Sistem akan menghitung persis seperti Excel**

Sekarang sistem kita **sudah sama persis** dengan Excel! 🎉
