# Fix: Data Tidak Langsung Muncul Setelah Add/Edit

## Masalah

Setelah menambah/edit data, data baru tidak langsung muncul. Harus refresh manual atau pindah halaman.

## Penyebab

Modal `onSave()` callback **tidak re-fetch data** dari server. Hanya close modal tanpa update state.

## Solusi

Ubah callback `onSave` di modal agar **memanggil function fetch data** dari parent component.

## Files yang Perlu Diperbaiki

### 1. Admin - Mata Pelajaran (course.js)

**Sudah OK** untuk add, tapi modal edit perlu fix:

```javascript
// Line ~35 - Modal callback
const handleSubmit = async (e) => {
  // ... existing code ...
  setTimeout(() => {
    onSave();  // ❌ Hanya panggil onSave
    onClose();
  }, 1000);
};

// FIX: Ubah onSave jadi arrow function yang fetch data
<EditMataPelajaranModal
  mapel={selectedMapel}
  onClose={() => setShowEditModal(false)}
  onSave={() => {
    fetchMataPelajaran();  // ✅ Re-fetch data
    setShowEditModal(false);
  }}
/>
```

### 2. Admin - Siswa (student.js)

```javascript
// Line ~378 - Modal edit
<EditStudentModal
  student={selectedStudent}
  onClose={() => setShowEditModal(false)}
  onSave={() => {
    fetchStudents();  // ✅ Re-fetch data
    setShowEditModal(false);
  }}
/>
```

### 3. Admin - Guru (teacher.js)

```javascript
// Line ~276 - Modal edit
<EditTeacherModal
  teacher={selectedTeacher}
  onClose={() => setShowEditModal(false)}
  onSave={() => {
    fetchTeachers();  // ✅ Re-fetch data
    setShowEditModal(false);
  }}
/>
```

### 4. Admin - Kelas (classManagement.js)

```javascript
// Modal edit
<EditKelasModal
  kelas={selectedKelas}
  teachers={teachers}
  onClose={() => setShowEditModal(false)}
  onSave={() => {
    fetchKelasAndTeachers();  // ✅ Re-fetch data
    setShowEditModal(false);
  }}
/>
```

### 5. Admin - Tipe Nilai (grade.js)

```javascript
// Modal edit
<EditTipeNilaiModal
  tipe={selectedTipe}
  onClose={() => setShowEditModal(false)}
  onSave={() => {
    fetchTipeNilai();  // ✅ Re-fetch data
    setShowEditModal(false);
  }}
/>
```

### 6. Admin - Tahun Ajaran (TASemester.js)

```javascript
// Modal edit (jika ada)
onSave={() => {
  fetchTASemesters();  // ✅ Re-fetch data
  setShowEditModal(false);
}}
```

### 7. Admin - Capaian Pembelajaran (capaianPembelajaranManagement.js)

```javascript
// Modal edit CP
<EditCpModal
  cp={selectedCp}
  onClose={() => setShowEditModal(false)}
  onSave={() => {
    fetchCpsAndMapel();  // ✅ Re-fetch data
    setShowEditModal(false);
  }}
/>

// Import Excel callback
<ImportExcel
  onImportSuccess={() => {
    fetchCpsAndMapel();  // ✅ Re-fetch setelah import
  }}
/>
```

### 8. Guru - Input Nilai (inputNilai.js)

Sudah OK - pakai `fetchData()` di useEffect dengan dependency `[selectedAssignment]`

### 9. Guru - Capaian Pembelajaran (cp.js)

Sudah OK - pakai `fetchData()` di useEffect

## Cara Cepat Fix Semua

Pastikan setiap modal punya callback yang re-fetch:

```javascript
// PATTERN YANG BENAR:
<EditModal
  data={selectedData}
  onClose={() => setShowEditModal(false)}
  onSave={() => {
    fetchData();           // ✅ Re-fetch dari server
    setShowEditModal(false); // Tutup modal
  }}
/>

// JANGAN SEPERTI INI:
<EditModal
  data={selectedData}
  onClose={() => setShowEditModal(false)}
  onSave={() => setShowEditModal(false)}  // ❌ Tidak re-fetch
/>
```

## Testing

Setelah fix, test:
1. Add data baru → Langsung muncul di list ✅
2. Edit data → Perubahan langsung muncul ✅
3. Delete data → Langsung hilang dari list ✅
4. Import Excel → Data langsung muncul ✅

Tidak perlu refresh manual lagi!
