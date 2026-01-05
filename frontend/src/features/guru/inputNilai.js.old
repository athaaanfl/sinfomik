// frontend/src/features/guru/inputNilai.js
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import * as guruApi from '../../api/guru'; // Import API guru

const InputNilai = ({ activeTASemester, userId }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [tpColumns, setTpColumns] = useState([1]); // Array of TP numbers, minimum 1 TP
  const [tpDescriptions, setTpDescriptions] = useState({}); // { 1: "description", 2: "description" }
  const [isLoadingTp, setIsLoadingTp] = useState(false); // Loading state for TP
  const [gradesInput, setGradesInput] = useState({}); // { studentId_column: value }
  const [kkm, setKkm] = useState({ UAS: 75, FINAL: 75 }); // { TP1: 75, TP2: 75, UAS: 75, FINAL: 75 }
  const [showKkmSettings, setShowKkmSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Wrap fetchData with useCallback to prevent re-creation on every render
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId || !activeTASemester) {
        setError("Informasi guru atau tahun ajaran aktif tidak tersedia.");
        return;
      }
      const assignmentsData = await guruApi.getGuruAssignments(userId, activeTASemester.id_ta_semester);
      setAssignments(assignmentsData);

      if (assignmentsData.length > 0 && !selectedAssignment) {
        setSelectedAssignment(`${assignmentsData[0].id_kelas}-${assignmentsData[0].id_mapel}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTASemester, userId, selectedAssignment]); // Add selectedAssignment to dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Now fetchData is a stable dependency

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedAssignment && activeTASemester) {
        const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
        try {
          // 1. First, get students list
          const studentsData = await guruApi.getStudentsInClass(kelasId, activeTASemester.id_ta_semester);
          setStudentsInClass(studentsData);
          
          // 2. Reset states
          setGradesInput({});
          setTpColumns([1]);
          setTpDescriptions({});
          
          // 3. Load TP from ATP (this will set tpColumns)
          await loadTpFromAtp(mapelId, kelasId);
          
          // 4. Load KKM settings from database
          await loadKkmFromDatabase(mapelId, kelasId);
          
          // 5. Then load existing grades (after TP columns are set)
          await loadExistingGrades(kelasId, mapelId);
        } catch (err) {
          setError(err.message);
          setStudentsInClass([]);
        }
      } else {
        setStudentsInClass([]);
        setGradesInput({});
        setTpColumns([1]);
        setTpDescriptions({});
      }
    };
    fetchStudents();
  }, [selectedAssignment, activeTASemester]);

  // Function to load existing grades for the selected assignment
  const loadExistingGrades = async (kelasId, mapelId) => {
    try {
      console.log(`Loading existing grades for kelas ${kelasId}, mapel ${mapelId}`);
      const existingGrades = await guruApi.getGradesByAssignment(userId, mapelId, kelasId, activeTASemester.id_ta_semester);
      console.log('Existing grades received:', existingGrades);
      
      if (!existingGrades || existingGrades.length === 0) {
        console.log('No existing grades found - input fields will be empty');
        return; // Exit early, tpColumns already set by ATP
      }
      
      const gradesData = {};
      let maxTpNumber = 1;
      
      existingGrades.forEach(grade => {
        if (grade.jenis_nilai === 'TP') {
          maxTpNumber = Math.max(maxTpNumber, grade.urutan_tp);
          gradesData[`${grade.id_siswa}_TP${grade.urutan_tp}`] = grade.nilai;
        } else if (grade.jenis_nilai === 'UAS') {
          gradesData[`${grade.id_siswa}_UAS`] = grade.nilai;
        }
      });
      
      console.log('Grades data to set:', gradesData);
      console.log('Max TP number from existing grades:', maxTpNumber);
      
      // Set grades (this will populate the input fields)
      setGradesInput(gradesData);
      console.log('Grades input updated');
    } catch (err) {
      // If no existing grades found, that's fine - just use defaults
      console.log('Error loading existing grades (will use empty fields):', err.message);
    }
  };

  // Function to load TP from ATP Excel based on mapel and kelas
  const loadTpFromAtp = async (mapelId, kelasId) => {
    setIsLoadingTp(true);
    try {
      // Get current assignment to check fase
      const currentAssignment = assignments.find(
        assign => `${assign.id_kelas}-${assign.id_mapel}` === selectedAssignment
      );

      if (!currentAssignment) {
        console.log('No assignment found, skipping ATP load');
        return;
      }

      // Determine fase based on kelas
      let fase = 'A'; // Default fase
      
      // Get kelas name from assignments
      const kelasName = currentAssignment?.nama_kelas || '';
      const tingkatKelas = parseInt(kelasName.match(/^(\d+)/)?.[1] || '1');
      
      if (tingkatKelas >= 1 && tingkatKelas <= 2) fase = 'A';
      else if (tingkatKelas >= 3 && tingkatKelas <= 4) fase = 'B';
      else if (tingkatKelas >= 5 && tingkatKelas <= 6) fase = 'C';

      // Determine semester: Ganjil = 1, Genap = 2
      let semesterNumber = null;
      if (activeTASemester && activeTASemester.semester) {
        semesterNumber = activeTASemester.semester.toLowerCase() === 'ganjil' ? 1 : 2;
      }

      console.log(`Loading TP for: ${kelasName} (tingkat ${tingkatKelas}) - Fase ${fase} - Semester ${semesterNumber}`);

      // Call API to get TP from ATP Excel with semester filter
      const tpData = await guruApi.getTpByMapelFaseKelas(mapelId, fase, kelasId, semesterNumber);
      
      console.log('TP Data received:', tpData);
      
      if (tpData.success && tpData.tp_list && tpData.tp_list.length > 0) {
        // Set TP columns based on ATP data
        const tpNumbers = tpData.tp_list.map((_, index) => index + 1);
        console.log(`Setting ${tpNumbers.length} TP columns:`, tpNumbers);
        setTpColumns(tpNumbers);
        
        // Set TP descriptions for tooltip/reference
        const descriptions = {};
        tpData.tp_list.forEach((tp, index) => {
          descriptions[index + 1] = tp.tujuan_pembelajaran;
        });
        setTpDescriptions(descriptions);
        
        // Initialize KKM from KKTP if available
        const newKkm = { UAS: 75, FINAL: 75 }; // Start fresh
        tpData.tp_list.forEach((tp, index) => {
          if (tp.kktp && !isNaN(parseFloat(tp.kktp))) {
            newKkm[`TP${index + 1}`] = parseFloat(tp.kktp);
          } else {
            newKkm[`TP${index + 1}`] = 75; // Default
          }
        });
        setKkm(newKkm);
        
        const semesterText = tpData.semester_text || 'Semua';
        setMessage(`✅ Berhasil memuat ${tpData.total_tp} TP dari ATP ${tpData.mapel} Fase ${fase} - Semester ${semesterText} untuk ${tpData.nama_kelas}`);
        setMessageType('success');
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      } else {
        // No TP found, use default (manual mode)
        console.log('No TP found in ATP, using manual mode');
        setMessage('ℹ️ Tidak ada TP untuk semester ini. Silakan tambah TP manual.');
        setMessageType('info');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
    } catch (err) {
      console.log('Error loading TP from ATP (will use manual mode):', err.message);
      // If error, just continue with manual TP management
    } finally {
      setIsLoadingTp(false);
    }
  };

  // Function to add new TP column
  const addTpColumn = () => {
    const nextTpNumber = Math.max(...tpColumns) + 1;
    setTpColumns([...tpColumns, nextTpNumber]);
    // Set default KKM for new TP
    setKkm(prev => ({
      ...prev,
      [`TP${nextTpNumber}`]: 75
    }));
  };

  // Function to remove TP column (except TP1)
  const removeTpColumn = (tpNumber) => {
    if (tpNumber === 1) return; // Cannot remove TP1
    setTpColumns(tpColumns.filter(tp => tp !== tpNumber));
    
    // Remove grades for this TP column
    const newGradesInput = { ...gradesInput };
    Object.keys(newGradesInput).forEach(key => {
      if (key.includes(`_TP${tpNumber}`)) {
        delete newGradesInput[key];
      }
    });
    setGradesInput(newGradesInput);

    // Remove KKM for this TP
    const newKkm = { ...kkm };
    delete newKkm[`TP${tpNumber}`];
    setKkm(newKkm);
  };

  // Initialize KKM for existing TPs
  useEffect(() => {
    const newKkm = { ...kkm };
    tpColumns.forEach(tpNum => {
      if (!newKkm[`TP${tpNum}`]) {
        newKkm[`TP${tpNum}`] = 75; // Default KKM
      }
    });
    setKkm(newKkm);
  }, [tpColumns]);

  // Function to load KKM from database
  const loadKkmFromDatabase = async (mapelId, kelasId) => {
    try {
      console.log(`Loading KKM settings for mapel ${mapelId}, kelas ${kelasId}`);
      const response = await guruApi.getKkmSettings(
        userId,
        mapelId,
        kelasId,
        activeTASemester.id_ta_semester
      );
      
      if (response.success && response.data && Object.keys(response.data).length > 0) {
        console.log('KKM loaded from database:', response.data);
        setKkm(response.data);
        setMessage('✅ KKM settings berhasil dimuat dari database');
        setMessageType('success');
      } else {
        console.log('No KKM settings found in database, using defaults');
      }
    } catch (err) {
      console.log('Error loading KKM (will use defaults):', err.message);
      // Don't show error to user, just use defaults
    }
  };

  // Function to save KKM to database
  const saveKkmToDatabase = async () => {
    if (!selectedAssignment || !activeTASemester) {
      setMessage('❌ Pilih assignment terlebih dahulu');
      setMessageType('error');
      return;
    }

    const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
    
    try {
      console.log('Saving KKM to database:', kkm);
      const response = await guruApi.saveKkmSettings(
        userId,
        mapelId,
        kelasId,
        activeTASemester.id_ta_semester,
        kkm
      );
      
      setMessage(`✅ ${response.message}`);
      setMessageType('success');
    } catch (err) {
      setMessage(`❌ Gagal menyimpan KKM: ${err.message}`);
      setMessageType('error');
    }
  };

  // Function to update KKM
  const handleKkmChange = (column, value) => {
    // Allow empty string or valid numbers 0-100
    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setKkm(prev => ({
        ...prev,
        [column]: value === '' ? '' : parseFloat(value)
      }));
    }
  };

  // Function to check if grade is below KKM
  const isBelowKkm = (column, value) => {
    if (!value || value === '' || isNaN(parseFloat(value))) return false;
    const gradeValue = parseFloat(value);
    const kkmValue = kkm[column];
    // Only check if KKM is set (not empty)
    if (kkmValue === '' || kkmValue === undefined || kkmValue === null) return false;
    return gradeValue < kkmValue;
  };

  // Function to check if final grade is below KKM
  const isFinalGradeBelowKkm = (studentId) => {
    const finalGrade = calculateFinalGrade(studentId);
    if (finalGrade === '-' || !kkm.FINAL || kkm.FINAL === '') return false;
    return parseFloat(finalGrade) < kkm.FINAL;
  };

  const handleGradeChange = (studentId, column, value) => {
    // Validasi input - izinkan string kosong atau angka 0-100
    if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setGradesInput(prev => ({
        ...prev,
        [`${studentId}_${column}`]: value
      }));
    }
  };

  // Function to calculate final grade (70% TP average + 30% UAS)
  const calculateFinalGrade = (studentId) => {
    // Calculate TP average
    let tpSum = 0;
    let tpCount = 0;
    
    tpColumns.forEach(tpNum => {
      const tpValue = gradesInput[`${studentId}_TP${tpNum}`];
      if (tpValue !== undefined && tpValue !== null && tpValue !== '' && !isNaN(parseFloat(tpValue))) {
        tpSum += parseFloat(tpValue);
        tpCount++;
      }
    });
    
    const tpAverage = tpCount > 0 ? tpSum / tpCount : 0;
    
    // Get UAS value (allow 0 as valid value)
    const uasValue = gradesInput[`${studentId}_UAS`];
    const uas = (uasValue !== undefined && uasValue !== null && uasValue !== '' && !isNaN(parseFloat(uasValue))) 
      ? parseFloat(uasValue) : null;
    
    // Calculate final grade if both TP and UAS exist (including UAS = 0)
    if (tpCount > 0 && uas !== null) {
      return (tpAverage * 0.7 + uas * 0.3).toFixed(2);
    }
    
    return '-';
  };

  const handleSubmitGrades = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    if (!selectedAssignment || !activeTASemester || studentsInClass.length === 0) {
      setMessage('Harap pilih kelas/mapel dan pastikan ada siswa.');
      setMessageType('error');
      return;
    }

    const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
    let successCount = 0;
    let failCount = 0;

    const gradePromises = [];
    
    studentsInClass.forEach(student => {
      // Save TP grades
      tpColumns.forEach(tpNum => {
        const gradeValue = gradesInput[`${student.id_siswa}_TP${tpNum}`];
        if (gradeValue !== undefined && gradeValue !== null && gradeValue !== '') {
          gradePromises.push(
            guruApi.addOrUpdateNewGrade({
              id_siswa: student.id_siswa,
              id_guru: userId,
              id_mapel: mapelId,
              id_kelas: kelasId,
              id_ta_semester: activeTASemester.id_ta_semester,
              jenis_nilai: 'TP',
              urutan_tp: tpNum,
              nilai: parseFloat(gradeValue),
              keterangan: `TP ${tpNum}`
            })
            .then(() => { successCount++; })
            .catch(err => {
              console.error(`Gagal menyimpan TP${tpNum} untuk ${student.nama_siswa}:`, err);
              failCount++;
            })
          );
        }
      });

      // Save UAS grade
      const uasValue = gradesInput[`${student.id_siswa}_UAS`];
      if (uasValue !== undefined && uasValue !== null && uasValue !== '') {
        gradePromises.push(
          guruApi.addOrUpdateNewGrade({
            id_siswa: student.id_siswa,
            id_guru: userId,
            id_mapel: mapelId,
            id_kelas: kelasId,
            id_ta_semester: activeTASemester.id_ta_semester,
            jenis_nilai: 'UAS',
            urutan_tp: null,
            nilai: parseFloat(uasValue),
            keterangan: 'UAS'
          })
          .then(() => { successCount++; })
          .catch(err => {
            console.error(`Gagal menyimpan UAS untuk ${student.nama_siswa}:`, err);
            failCount++;
          })
        );
      }
    });

    try {
      await Promise.all(gradePromises);
      if (successCount > 0) {
        setMessage(`Berhasil menyimpan ${successCount} nilai. ${failCount} gagal.`);
        setMessageType('success');
      } else if (failCount > 0) {
        setMessage(`Gagal menyimpan ${failCount} nilai. Periksa konsol untuk detail.`);
        setMessageType('error');
      } else {
        setMessage('Tidak ada nilai yang diinput atau diubah.');
        setMessageType('info');
      }
    } catch (err) {
      setMessage(`Terjadi kesalahan umum saat menyimpan nilai: ${err.message}`);
      setMessageType('error');
    }
  };

  // Export Excel Template
  const handleExportTemplate = async () => {
    if (!selectedAssignment || !activeTASemester) {
      setMessage('Pilih assignment dan pastikan TA/Semester aktif');
      setMessageType('error');
      return;
    }

    const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
    
    setIsExporting(true);
    setMessage('Mengunduh template Excel...');
    setMessageType('info');

    try {
      await guruApi.exportGradeTemplate(
        userId,
        mapelId,
        kelasId,
        activeTASemester.id_ta_semester
      );
      
      setMessage('✅ Template Excel berhasil diunduh!');
      setMessageType('success');
    } catch (err) {
      setMessage(`❌ Gagal mengunduh template: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsExporting(false);
    }
  };

  // Import from Excel
  const handleImportFromExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedAssignment || !activeTASemester) {
      setMessage('Pilih assignment dan pastikan TA/Semester aktif');
      setMessageType('error');
      return;
    }

    const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
    
    setIsImporting(true);
    setMessage('Mengupload dan memproses file Excel...');
    setMessageType('info');

    try {
      const result = await guruApi.importGradesFromExcel(
        file,
        userId,
        mapelId,
        kelasId,
        activeTASemester.id_ta_semester
      );

      if (result.errors && result.errors.length > 0) {
        setMessage(`⚠️ Import selesai dengan error: ${result.message}\n${result.errors.slice(0, 5).join(', ')}`);
        setMessageType('warning');
      } else {
        setMessage(`✅ ${result.message}`);
        setMessageType('success');
      }

      // Reload grades after import
      await loadExistingGrades(kelasId, mapelId);
    } catch (err) {
      setMessage(`❌ Gagal import nilai: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Export Final Grades to Excel
  const handleExportFinalGrades = async () => {
    if (!selectedAssignment || !activeTASemester) {
      setMessage('Pilih assignment terlebih dahulu');
      setMessageType('error');
      return;
    }

    const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
    
    setIsExporting(true);
    setMessage('Sedang membuat file Excel nilai final...');
    setMessageType('info');

    try {
      await guruApi.exportFinalGrades(userId, mapelId, kelasId, activeTASemester.id_ta_semester);
      setMessage('✅ Nilai final berhasil diexport! File akan segera terunduh.');
      setMessageType('success');
    } catch (err) {
      setMessage(`❌ Gagal export nilai final: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <p>Memuat data guru...</p>;
  if (error) return <p className="message error">Error: {error}</p>;

  const currentAssignment = assignments.find(
    assign => `${assign.id_kelas}-${assign.id_mapel}` === selectedAssignment
  );

  return (
    <div className="feature-content">
      <h2>Input Nilai Siswa</h2>
      {message && <div className={`message ${messageType}`}>{message}</div>}

      {!activeTASemester && <p className="message warning">Tahun Ajaran & Semester aktif belum diatur. Harap hubungi Admin.</p>}

      {assignments.length > 0 ? (
        <div className="form-group">
          <label>Pilih Kelas dan Mata Pelajaran:</label>
          <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
            {assignments.map(assign => (
              <option key={`${assign.id_kelas}-${assign.id_mapel}`} value={`${assign.id_kelas}-${assign.id_mapel}`}>
                {assign.nama_kelas} - {assign.nama_mapel}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="message warning">Anda belum ditugaskan mengajar mata pelajaran di kelas manapun untuk semester aktif ini. Silakan hubungi Admin.</p>
      )}

      {currentAssignment && (
        <>
          <h3>Input Nilai untuk {currentAssignment.nama_mapel} di Kelas {currentAssignment.nama_kelas}</h3>
          
          {/* TP Management Section */}
          <div className="tp-management">
            <h4>Manajemen Kolom TP</h4>
            {isLoadingTp && <p className="message info">⏳ Memuat TP dari ATP...</p>}
            
            {/* Excel Tools Section */}
            <div className="excel-tools">
              <h5>Tools Import/Export Excel</h5>
              <div className="excel-buttons">
                <button 
                  type="button" 
                  onClick={handleExportTemplate}
                  disabled={isExporting || !selectedAssignment}
                  className="excel-button export-button"
                >
                  {isExporting ? '⏳ Mengunduh...' : '📥 Download Template Excel'}
                </button>
                
                <label className="excel-button import-button">
                  {isImporting ? '⏳ Uploading...' : '📤 Upload & Import Nilai'}
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleImportFromExcel}
                    disabled={isImporting || !selectedAssignment}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <button 
                  type="button" 
                  onClick={handleExportFinalGrades}
                  disabled={isExporting || !selectedAssignment}
                  className="excel-button export-final-button"
                >
                  {isExporting ? '⏳ Mengunduh...' : '📊 Export Nilai Final'}
                </button>
              </div>
              <p className="excel-info">
                <small>
                  💡 <strong>Tip:</strong> Download template Excel untuk input nilai secara offline, 
                  lalu upload kembali setelah diisi. Gunakan "Export Nilai Final" untuk download hasil nilai lengkap dengan formula nilai akhir.
                </small>
              </p>
            </div>

            <div className="tp-controls">
              <button type="button" onClick={addTpColumn} className="add-tp-button">
                Tambah TP (Manual)
              </button>
              <button 
                type="button" 
                onClick={() => setShowKkmSettings(!showKkmSettings)} 
                className="kkm-settings-button"
              >
                {showKkmSettings ? 'Sembunyikan' : 'Atur'} KKM
              </button>
              <div className="tp-list">
                {tpColumns.map(tpNum => (
                  <div key={tpNum} className="tp-item" title={tpDescriptions[tpNum] || 'Tidak ada deskripsi'}>
                    <span>TP {tpNum}</span>
                    {tpDescriptions[tpNum] && (
                      <small className="tp-description">
                        {tpDescriptions[tpNum].substring(0, 50)}...
                      </small>
                    )}
                    {tpNum !== 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTpColumn(tpNum)} 
                        className="remove-tp-button"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* KKM Settings */}
            {showKkmSettings && (
              <div className="kkm-settings">
                <h5>Pengaturan Kriteria Ketuntasan Minimal (KKM)</h5>
                <div className="kkm-controls">
                  {tpColumns.map(tpNum => (
                    <div key={`kkm-TP${tpNum}`} className="kkm-item">
                      <label>KKM TP {tpNum}:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={kkm[`TP${tpNum}`] || ''}
                        onChange={(e) => handleKkmChange(`TP${tpNum}`, e.target.value)}
                        className="kkm-input"
                        placeholder="Kosongkan jika tidak ada KKM"
                      />
                    </div>
                  ))}
                  <div className="kkm-item">
                    <label>KKM UAS:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={kkm.UAS || ''}
                      onChange={(e) => handleKkmChange('UAS', e.target.value)}
                      className="kkm-input"
                      placeholder="Kosongkan jika tidak ada KKM"
                    />
                  </div>
                  <div className="kkm-item">
                    <label>KKM Nilai Akhir:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={kkm.FINAL || ''}
                      onChange={(e) => handleKkmChange('FINAL', e.target.value)}
                      className="kkm-input"
                      placeholder="Kosongkan jika tidak ada KKM"
                    />
                  </div>
                </div>
                <p className="kkm-info">
                  <small>Nilai di bawah KKM akan ditampilkan dengan latar belakang merah. Kosongkan field KKM jika tidak ingin mengatur batas ketuntasan.</small>
                </p>
                <div className="kkm-actions">
                  <button 
                    type="button" 
                    onClick={saveKkmToDatabase}
                    className="save-kkm-button"
                  >
                    <i className="fas fa-save"></i> Simpan KKM ke Database
                  </button>
                  <small className="kkm-save-note">
                    💡 <strong>Tips:</strong> KKM akan otomatis dimuat saat kembali ke halaman ini. Klik "Simpan KKM" untuk menyimpan perubahan.
                  </small>
                </div>
              </div>
            )}
          </div>

          {studentsInClass.length > 0 ? (
            <form onSubmit={handleSubmitGrades} className="form-container-small">
              <div className="grades-table-container">
                <table className="grades-table">
                  <thead>
                    <tr>
                      <th className="student-name-col">Nama Siswa</th>
                      {tpColumns.map(tpNum => (
                        <th 
                          key={`TP${tpNum}`} 
                          className="grade-col tp-header"
                          title={tpDescriptions[tpNum] || `Tujuan Pembelajaran ${tpNum}`}
                        >
                          <div className="tp-header-content">
                            <strong>TP {tpNum}</strong>
                            {tpDescriptions[tpNum] && (
                              <small className="tp-header-description">
                                {tpDescriptions[tpNum].length > 60 
                                  ? tpDescriptions[tpNum].substring(0, 60) + '...' 
                                  : tpDescriptions[tpNum]}
                              </small>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="grade-col">UAS</th>
                      <th className="final-grade-col">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInClass.map(student => (
                      <tr key={student.id_siswa}>
                        <td className="student-name-cell">{student.nama_siswa}</td>
                        {tpColumns.map(tpNum => (
                          <td key={`${student.id_siswa}-TP${tpNum}`} className="grade-cell">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={gradesInput[`${student.id_siswa}_TP${tpNum}`] || ''}
                              onChange={(e) => handleGradeChange(student.id_siswa, `TP${tpNum}`, e.target.value)}
                              className={`grade-input-field ${isBelowKkm(`TP${tpNum}`, gradesInput[`${student.id_siswa}_TP${tpNum}`]) ? 'below-kkm' : ''}`}
                              placeholder="0-100"
                            />
                          </td>
                        ))}
                        <td className="grade-cell">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={gradesInput[`${student.id_siswa}_UAS`] || ''}
                            onChange={(e) => handleGradeChange(student.id_siswa, 'UAS', e.target.value)}
                            className={`grade-input-field ${isBelowKkm('UAS', gradesInput[`${student.id_siswa}_UAS`]) ? 'below-kkm' : ''}`}
                            placeholder="0-100"
                          />
                        </td>
                        <td className="final-grade-cell">
                          <span className={`final-grade ${isFinalGradeBelowKkm(student.id_siswa) ? 'below-kkm' : ''}`}>
                            {calculateFinalGrade(student.id_siswa)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="submit" className="submit-button">Simpan Semua Nilai</button>
              
              <div className="calculation-info">
                <small>
                  <strong>Keterangan:</strong> Nilai Akhir = 70% rata-rata TP + 30% UAS
                </small>
              </div>
            </form>
          ) : (
            <p>Tidak ada siswa di kelas ini.</p>
          )}
        </>
      )}
    </div>
  );
};

export default InputNilai;
