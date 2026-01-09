# Fix NISN Leading Zero & 10-Digit Issue

## Masalah yang Diperbaiki

1. **Leading Zero Hilang**: NISN seperti `0213456789` berubah menjadi `213456789`
2. **NISN 10 Digit Tidak Masuk**: NISN seperti `2345678910` tidak bisa disimpan
3. **Excel Import Gagal**: Import Excel dengan NISN yang ada leading zero gagal

## Root Cause

Database schema menggunakan `INTEGER` untuk `id_siswa`, yang menyebabkan:
- PostgreSQL/SQLite menghilangkan leading zero karena menganggap sebagai angka matematika
- INTEGER di database memiliki limit untuk angka besar (10 digit NISN bisa overflow)

## Solusi yang Diimplementasikan

### 1. Database Migration (Backend - PostgreSQL)

**File**: `backend/src/migrate_siswa_id_to_text.js`

Script migration untuk PostgreSQL mengubah schema dari:
```sql
id_siswa INTEGER PRIMARY KEY
```
Menjadi:
```sql
id_siswa TEXT PRIMARY KEY
```

**Cara Menjalankan Migration**:
```bash
cd backend
node src/migrate_siswa_id_to_text.js
```

Script ini akan:
- Connect ke PostgreSQL database
- Check apakah migration diperlukan
- Alter table Siswa dan semua foreign key references (SiswaKelas, Nilai, SiswaCapaianPembelajaran, StudentClassEnrollment)
- Menggunakan TRANSACTION untuk safety (auto rollback jika error)
- Verify hasil migration
- Show sample data

### 2. Update Schema untuk Database Baru (PostgreSQL)

**File**: `backend/src/init_db_postgres_simple.js`

Schema sudah diupdate untuk database baru:
```javascript
`CREATE TABLE IF NOT EXISTS Siswa (
    id_siswa TEXT PRIMARY KEY,  // ✅ Sekarang TEXT
    nama_siswa TEXT NOT NULL,
    tanggal_lahir TEXT,
    jenis_kelamin TEXT,
    tahun_ajaran_masuk TEXT
);`,

// Foreign key references juga sudah TEXT
`CREATE TABLE IF NOT EXISTS SiswaKelas (
    id_siswa_kelas SERIAL PRIMARY KEY,
    id_siswa TEXT NOT NULL,  // ✅ TEXT, bukan INTEGER
    ...
);`,

`CREATE TABLE IF NOT EXISTS Nilai (
    id_nilai SERIAL PRIMARY KEY,
    id_siswa TEXT NOT NULL,  // ✅ TEXT, bukan INTEGER
    ...
);`,
```

### 3. Frontend Form Input

**File**: `frontend/src/features/admin/student.js`

Ubah input type dari `number` ke `text` dengan validasi:
```javascript
<input 
  type="text"              // ✅ Sekarang text, bukan number
  pattern="[0-9]{10}"      // ✅ Validasi 10 digit angka
  maxLength="10"           // ✅ Max 10 karakter
  placeholder="Contoh: 1234567890 atau 0213456789"
/>
```

### 4. Excel Import Preprocessing

**File**: `frontend/src/features/admin/student.js`

Preprocessing Excel file untuk:
- Force convert NISN cells ke text type
- Preserve leading zeros
- Auto-pad NISN yang kurang dari 10 digit dengan leading zero

```javascript
// CRITICAL fixes:
const workbook = XLSX.read(arrayBuffer, { 
  type: 'array', 
  raw: false,      // ✅ Prevent auto number conversion
  cellText: true   // ✅ Treat as text
});

// Convert numeric cells to text
if (cell.t === 'n' && cell.v) {
  cell.t = 's';                          // ✅ Change type to string
  cell.v = String(cell.v);               // ✅ Convert to string
  if (cell.v.length < 10 && !isNaN(cell.v)) {
    cell.v = cell.v.padStart(10, '0');  // ✅ Pad leading zeros
  }
}
```

## Testing

### Test Case 1: Leading Zero
```
Input:  0213456789
Output: 0213456789 ✅ (preserved)
```

### Test Case 2: 10-Digit NISN
```
Input:  2345678910
Output: 2345678910 ✅ (accepted)
```

### Test Case 3: Excel Import
```
Excel Cell: 0213456789 (formatted as number)
Database:   0213456789 ✅ (leading zero preserved)
```

### Test Case 4: Short NISN with Auto-Pad
```
Input:  123456789 (9 digits)
Output: 0123456789 ✅ (auto-padded to 10 digits)
```

## Langkah-Langkah Deployment

### Jika Database Sudah Ada (Production - PostgreSQL):

1. **Backup Database**:
   ```bash
   # PostgreSQL backup
   pg_dump -U $DB_USER -h $DB_HOST -d $DB_NAME > backup_$(date +%Y%m%d).sql
   
   # Or using psql
   psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "\copy (SELECT * FROM siswa) TO 'siswa_backup.csv' CSV HEADER"
   ```

2. **Run Migration**:
   ```bash
   cd backend
   node src/migrate_siswa_id_to_text.js
   ```

3. **Verify Migration**:
   - Check console output untuk konfirmasi
   - Query database:
     ```sql
     SELECT data_type 
     FROM information_schema.columns 
     WHERE table_name = 'siswa' 
     AND column_name = 'id_siswa';
     ```
   - Harusnya return: `text`

4. **Restart Backend**:
   ```bash
   npm start
   ```

5. **Rebuild Frontend**:
   ```bash
   cd ../frontend
   npm run build
   ```

### Jika Database Baru (Development - PostgreSQL):

1. **Init database baru**:
   ```bash
   cd backend
   node src/init_db_postgres_simple.js
   ```
   Schema baru sudah otomatis menggunakan TEXT

2. **Start services**:
   ```bash
   npm start
   ```

## Verifikasi Berhasil

1. **Cek Schema Database (PostgreSQL)**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'siswa';
   ```
   Harusnya menunjukkan `id_siswa | text`

2. **Test Manual Input**:
   - Tambah siswa dengan NISN: `0213456789`
   - Refresh halaman
   - Cek apakah leading zero masih ada

3. **Test Excel Import**:
   - Buat Excel dengan NISN yang ada leading zero
   - Import ke sistem
   - Cek hasil di database

4. **Test Long NISN**:
   - Tambah siswa dengan NISN: `2345678910`
   - Harusnya berhasil tanpa error

## Troubleshooting

### Issue: Migration script error "relation does not exist"
**Cause**: Table name case-sensitive di PostgreSQL
**Solution**: Check nama table sebenarnya:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Issue: Migration script error "column already TEXT"
**Solution**: Migration sudah jalan sebelumnya, skip migration
```bash
# Script akan auto-detect dan exit dengan message:
# ✅ Migration not needed - id_siswa already TEXT
```

### Issue: Foreign key constraint error
**Cause**: Orphaned records atau mismatch data type
**Solution**:
```sql
-- Check orphaned records
SELECT DISTINCT id_siswa FROM siswakelas 
WHERE id_siswa NOT IN (SELECT id_siswa FROM siswa);

-- Delete orphaned records (if safe)
DELETE FROM siswakelas 
WHERE id_siswa NOT IN (SELECT id_siswa FROM siswa);
```

## Important Notes

⚠️ **NISN Sekarang Adalah String**: 
- Jangan gunakan operasi matematika pada NISN
- Gunakan string comparison untuk query
- Validasi harus menggunakan regex/pattern, bukan number type

✅ **Backward Compatible**:
- Migration akan preserve semua data existing
- NISN yang dulu tersimpan sebagai number akan otomatis convert ke text
- Tidak ada data loss
- Migration uses TRANSACTION untuk safety

🔒 **PostgreSQL Specific**:
- Migration script menggunakan `ALTER TABLE ... ALTER COLUMN ... TYPE TEXT`
- Auto-detect jika migration sudah jalan
- Transaction-based untuk rollback otomatis jika error
- Support untuk semua foreign key references

📝 **Best Practices**:
- Selalu format kolom NISN di Excel sebagai Text sebelum input
- Gunakan placeholder format: `0213456789` untuk edukasi user
- Validasi NISN harus 10 digit tepat

## Files Changed

1. ✅ `backend/src/init_db_postgres_simple.js` - Update schema untuk database baru (PostgreSQL)
2. ✅ `backend/src/migrate_siswa_id_to_text.js` - Migration script untuk PostgreSQL (NEW)
3. ✅ `frontend/src/features/admin/student.js` - Fix form input & Excel preprocessing
4. ✅ `backend/src/controllers/adminController.js` - Enhanced error handling & validation
- Migration akan preserve semua data existing
- NISN yang dulu tersimpan sebagai number akan otomatis convert ke text
- Tidak ada data loss

📝 **Best Practices**:
- Selalu format kolom NISN di Excel sebagai Text sebelum input
- Gunakan placeholder format: `0213456789` untuk edukasi user
- Validasi NISN harus 10 digit tepat

## Files Changed

1. ✅ `backend/src/init_db.js` - Update schema untuk database baru
2. ✅ `backend/src/migrate_siswa_id_to_text.js` - Migration script (NEW)
3. ✅ `frontend/src/features/admin/student.js` - Fix form input & Excel preprocessing

## Checklist Post-Deployment

- [ ] Backup database sebelum migration
- [ ] Run migration script
- [ ] Verify schema change successful
- [ ] Test manual input dengan leading zero
- [ ] Test Excel import dengan leading zero
- [ ] Test 10-digit NISN
- [ ] Rebuild frontend
- [ ] Clear browser cache
- [ ] Test di production environment
- [ ] Monitor untuk error
- [ ] Update documentation/user guide

---

**Created**: 2026-01-09  
**Status**: ✅ Ready for Deployment  
**Priority**: HIGH (Data Integrity Issue)
