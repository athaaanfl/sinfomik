// frontend/src/features/guru/rekapNilai.js
import React, { useState, useEffect } from 'react';
import * as guruApi from '../../api/guru';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ModuleContainer from '../../components/ModuleContainer';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusMessage from '../../components/StatusMessage';
import EmptyState from '../../components/EmptyState';
import { runCTTAnalysis, exportCTTAnalysisToExcel } from '../../utils/ctt';

const RekapNilai = ({ activeTASemester, userId }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [rekapNilai, setRekapNilai] = useState([]);
  const [allTpColumns, setAllTpColumns] = useState([]); // TP dari ATP
  const [loading, setLoading] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [kkmSettings, setKkmSettings] = useState({}); // KKM values loaded from DB for this assignment

  // --- Analisis Soal (new feature) ---
  const [activeTab, setActiveTab] = useState('rekap'); // 'rekap' | 'analysis'
  const [scale, setScale] = useState('binary'); // 'binary' | '5' for 1-5 | '100' for 0-100

  // Spreadsheet state for per-item (UAS) analysis
  const [numQuestions, setNumQuestions] = useState(10); // default number of questions
  const [questionKeys, setQuestionKeys] = useState([]); // e.g. ['Q1','Q2']
  const [analysisStudents, setAnalysisStudents] = useState([]); // list of {id_siswa, nama_siswa}
  const [answers, setAnswers] = useState({}); // { id_siswa: { Q1: value, Q2: value } }
  const [weights, setWeights] = useState({}); // { Q1: 1.0 }
  const [maxes, setMaxes] = useState({}); // { Q1: max }

  const [questionWeights, setQuestionWeights] = useState({}); // legacy: kept for TP fallback
  const [analysisResults, setAnalysisResults] = useState([]);
  const [cronbachAlpha, setCronbachAlpha] = useState(null);
  const [semValue, setSemValue] = useState(null);


  const classifyByP = (p) => {
    if (p === null || p === undefined) return '-';
    if (p > 0.7) return 'Mudah';
    if (p < 0.3) return 'Sukar';
    return 'Sedang';
  };

  // Compute student's total/final score used for point-biserial
  const computeStudentTotal = (row) => {
    // TP average
    const tpGrades = uniqueGradeTypes
      .filter(tipe => tipe.startsWith('TP'))
      .map(tipe => row[tipe])
      .filter(n => typeof n === 'number');
    const tpAverage = tpGrades.length > 0 ? tpGrades.reduce((s,n)=>s+n,0)/tpGrades.length : null;
    const uasValue = typeof row['UAS'] === 'number' ? row['UAS'] : null;
    if (tpAverage !== null && uasValue !== null) {
      return tpAverage * 0.7 + uasValue * 0.3;
    }
    if (tpAverage !== null) return tpAverage;
    if (uasValue !== null) return uasValue;
    // fallback: sum of numeric values
    const allNums = uniqueGradeTypes.map(t=>row[t]).filter(v=>typeof v==='number');
    if (allNums.length>0) return allNums.reduce((s,n)=>s+n,0)/allNums.length;
    return null;
  };

  const runAnalysis = () => {
    const itemKeys = (questionKeys && questionKeys.length > 0) ? questionKeys : uniqueGradeTypes.filter(t => t.startsWith('TP'));
    const { results, cronbachAlpha: alpha, semValue: sem } = runCTTAnalysis({
      itemKeys,
      questionKeys,
      analysisStudents,
      answers,
      weights,
      questionWeights,
      maxes,
      scale,
      rekapTableData,
      computeStudentTotalFromAnswers
    });

    // Recompute difficulty labels using local nmin/classify function
    const labeled = results.map(r => ({ ...r, difficulty: classifyByP(r.p_value, r.n) }));

    setAnalysisResults(labeled);
    setCronbachAlpha(alpha);
    setSemValue(sem);
  };

  const analysisColumns = [
    { key: 'question', label: 'Soal' },
    { key: 'weight', label: 'Bobot', className: 'text-center', render: (v,row) => (row.weight || 1) },
    { key: 'n', label: 'N', className: 'text-center' },
    { key: 'p_value', label: 'p-value', className: 'text-center', render: v => typeof v === 'number' ? v.toFixed(3) : '-' },
    { key: 'mean', label: 'Mean', className: 'text-center', render: v => typeof v === 'number' ? ( (v*100).toFixed(1) + '%' ) : '-' },
    { key: 'item_total_corr', label: 'Item-Total Corr', className: 'text-center', render: v => typeof v === 'number' ? v.toFixed(3) : '-' },
    { key: 'point_biserial', label: 'Point-Biserial', className: 'text-center', render: v => typeof v === 'number' ? v.toFixed(3) : '-' },
    { key: 'difficulty', label: 'Difficulty', render: (v,row) => {
        let cls = 'bg-yellow-200 text-yellow-800';
        if (v === 'Mudah') cls = 'bg-green-200 text-green-800';
        if (v === 'Sulit') cls = 'bg-red-200 text-red-800';
        if (v === 'Insufficient data') cls = 'bg-gray-100 text-gray-600';
        return <span className={`px-2 py-1 rounded ${cls}`}>{v}</span>;
      }}
  ];

  // ---------------- Spreadsheet helpers ----------------
  const [pastedText, setPastedText] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [classNameExport, setClassNameExport] = useState('');

  const fetchStudentsForAnalysis = async () => {
    if (!currentAssignment || !activeTASemester) return;
    const [kelasId] = `${selectedAssignment}`.split('-').map(Number);
    try {
      const res = await guruApi.getStudentsInClass(kelasId, activeTASemester.id_ta_semester);
      if (res && Array.isArray(res)) {
        // map to expected shape
        const students = res.map(s => ({ id_siswa: s.id_siswa || s.id, nama_siswa: s.nama_siswa || s.nama }));
        setAnalysisStudents(students);
        // initialize answers if questions already exist
        if (questionKeys && questionKeys.length > 0) {
          const newAnswers = { ...answers };
          students.forEach(st => {
            if (!newAnswers[st.id_siswa]) {
              newAnswers[st.id_siswa] = {};
              questionKeys.forEach(k => newAnswers[st.id_siswa][k] = '');
            }
          });
          setAnswers(newAnswers);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const getDefaultForScale = (scale) => {
    if (scale === 'binary') return { max: 1, threshold: 1 };
    if (scale === '5') return { max: 5, threshold: 4 };
    if (scale === '100') return { max: 100, threshold: 60 };
    return { max: 1, threshold: 1 };
  };

  React.useEffect(() => {
    // no-op: scale still used for default max, but we don't use binarization threshold
  }, [scale]);

  const generateGrid = () => {
    const n = Number(numQuestions) || 0;
    if (n <= 0) return;
    const keys = Array.from({length: n}, (_,i) => `Q${i+1}`);
    setQuestionKeys(keys);
    // initialize weights
    const newWeights = { ...weights };
    const newMaxes = { ...maxes };
    const def = getDefaultForScale(scale);
    keys.forEach(k => {
      if (newWeights[k] === undefined) newWeights[k] = 1;
      if (newMaxes[k] === undefined) newMaxes[k] = def.max;
    });
    setWeights(newWeights);
    setMaxes(newMaxes);

    // initialize answers for students available
    const students = (analysisStudents && analysisStudents.length > 0) ? analysisStudents : rekapTableData.map(r => ({ id_siswa: r.id_siswa, nama_siswa: r.nama_siswa }));
    const newAnswers = { ...answers };
    students.forEach(st => {
      if (!newAnswers[st.id_siswa]) {
        newAnswers[st.id_siswa] = {};
      }
      keys.forEach(k => { if (newAnswers[st.id_siswa][k] === undefined) newAnswers[st.id_siswa][k] = ''; });
    });
    setAnswers(newAnswers);
    // set students if not set
    if (!analysisStudents || analysisStudents.length === 0) setAnalysisStudents(students);
  };

  const setCellValue = (id_siswa, key, value) => {
    const newAnswers = { ...answers };
    if (!newAnswers[id_siswa]) newAnswers[id_siswa] = {};
    newAnswers[id_siswa][key] = value;
    setAnswers(newAnswers);
  };

  const computeStudentTotalFromAnswers = (id_siswa) => {
    const row = answers[id_siswa] || {};
    const ks = questionKeys || [];
    let sumWeightedFractions = 0;
    let sumWeights = 0;
    ks.forEach(k => {
      const v = row[k];
      if (v === null || v === '' || v === undefined) return;
      const num = Number(v);
      if (isNaN(num)) return;
      const max = getDefaultForScale(scale).max;
      const w = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
      const fraction = max > 0 ? (num / max) : 0;
      sumWeightedFractions += fraction * w;
      sumWeights += w;
    });
    return sumWeights > 0 ? (sumWeightedFractions / sumWeights) : null; // 0..1
  };

  // Also compute raw points and max points for display
  // computeStudentRawFromAnswers kept for compatibility but not shown in UI per request
  const computeStudentRawFromAnswers = (id_siswa) => {
    const row = answers[id_siswa] || {};
    const ks = questionKeys || [];
    let weightedPoints = 0; let totalWeight = 0; let hadAny = false;
    ks.forEach(k => {
      const v = row[k];
      const m = (maxes && maxes[k]) ? Number(maxes[k]) : getDefaultForScale(scale).max;
      const w = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
      if (v !== '' && v !== undefined && v !== null && !isNaN(Number(v))) { weightedPoints += (Number(v) / (m>0?m:1)) * w; hadAny = true; }
      totalWeight += w;
    });
    const fraction = hadAny && totalWeight>0 ? (weightedPoints / totalWeight) : null;
    return { weightedPoints, totalWeight, fraction };
  };
  const applyPastedBlock = () => {
    if (!pastedText || !questionKeys || questionKeys.length===0) return;

    // Expect pastedText as tab-delimited rows corresponding to students in order
    const rows = pastedText.trim().split(/\r?\n/).map(r => r.split(/\t|\s+/).filter(c=>c!==''));
    const students = analysisStudents.length > 0 ? analysisStudents : rekapTableData.map(r => ({ id_siswa: r.id_siswa, nama_siswa: r.nama_siswa }));
    const newAnswers = { ...answers };
    for (let i=0;i<rows.length && i<students.length;i++) {
      const st = students[i];
      if (!newAnswers[st.id_siswa]) newAnswers[st.id_siswa] = {};
      for (let j=0;j<questionKeys.length && j<rows[i].length;j++) {
        const key = questionKeys[j];
        const val = rows[i][j];
        newAnswers[st.id_siswa][key] = val;
      }
    }
    setAnswers(newAnswers);
    setPastedText('');
  };

  const getTotalWeight = () => {
    return questionKeys && questionKeys.length>0 ? questionKeys.reduce((s,k) => s + ((weights && weights[k] !== undefined) ? Number(weights[k]) : 1), 0) : 0;
  };

  const getTotalMax = () => {
    // Keep for informational display, but final percent uses weights
    return questionKeys && questionKeys.length>0 ? questionKeys.reduce((s,k) => s + ((maxes && maxes[k]) ? Number(maxes[k]) : getDefaultForScale(scale).max), 0) : 0;
  };


  const exportAnalysisCSV = () => {
    // keep backward-compatible CSV export but include subject/class metadata
    const ks = questionKeys.length>0 ? questionKeys : [];
    const students = analysisStudents.length>0 ? analysisStudents : rekapTableData.map(r=>({ id_siswa: r.id_siswa, nama_siswa: r.nama_siswa }));
    const lines = [];
    // include metadata header
    lines.push([`Mata Pelajaran: ${subjectName || ''}`, `Kelas: ${classNameExport || ''}`, `Tanggal: ${new Date().toLocaleString()}`].join(','));
    const header = ['No','Nama Siswa', ...ks, 'Weighted Points', 'Total Weight', 'Percent'];
    lines.push(header.join(','));
    students.forEach((s, idx) => {
      const row = [idx+1, `"${s.nama_siswa.replace(/"/g,'""')}"`];
      ks.forEach(k => {
        const v = (answers[s.id_siswa] && answers[s.id_siswa][k]) || '';
        row.push(v);
      });
      const ksArr = ks;
      let weightedPoints = 0; let totalWeight = 0; let hadAny = false;
      ksArr.forEach(k => {
        const v = answers[s.id_siswa] && answers[s.id_siswa][k];
        const m = (maxes && maxes[k]) ? Number(maxes[k]) : getDefaultForScale(scale).max;
        const w = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
        if (v !== '' && v !== undefined && v !== null && !isNaN(Number(v))) { weightedPoints += (Number(v)/ (m>0?m:1)) * w; hadAny = true; }
        totalWeight += w;
      });
      const percent = hadAny && totalWeight>0 ? (weightedPoints / totalWeight) : null;
      row.push(weightedPoints.toFixed(2));
      row.push(totalWeight.toFixed(2));
      row.push(percent===null ? '' : ((percent*100).toFixed(1) + '%'));
      lines.push(row.join(','));
    });
    // append cronbach alpha and sem as footer lines
    lines.push('');
    lines.push(`Cronbach Alpha,${cronbachAlpha === null ? '' : cronbachAlpha.toFixed(3)}`);
    lines.push(`SEM,${semValue === null ? '' : semValue.toFixed(3)}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `analysis_${subjectName || selectedAssignment || 'analysis'}.csv`; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const saveAnalysisJSON = () => {
    const payload = { assignment: selectedAssignment, subjectName, classNameExport, questionKeys, weights, maxes, answers, analysisResults, cronbachAlpha, semValue };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `analysis_${subjectName || selectedAssignment || 'analysis'}.json`; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, [activeTASemester, userId]);

  useEffect(() => {
    const fetchRekap = async () => {
      if (selectedAssignment && activeTASemester && userId) {
        setLoadingRekap(true);
        const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
        try {
          // Load TP dari ATP dulu
          await loadTpFromAtp(mapelId, kelasId);
          
          // Load KKM settings dari database dan store ke state
          try {
            const kkmResp = await guruApi.getKkmSettings(userId, mapelId, kelasId, activeTASemester.id_ta_semester);
            if (kkmResp && kkmResp.success && kkmResp.data) {
              setKkmSettings(kkmResp.data);
            } else {
              setKkmSettings({});
            }
          } catch (err) {
            console.warn('Error fetching KKM settings:', err?.message || err);
            setKkmSettings({});
          }
          
          // Kemudian load nilai
          const data = await guruApi.getRekapNilai(userId, mapelId, kelasId, activeTASemester.id_ta_semester);
          setRekapNilai(data || []);
          // Auto-fetch students and generate table when rekap is loaded
          try {
            await fetchStudentsForAnalysis();
            generateGrid();
          } catch (e) {
            console.warn('Auto-generate: failed to fetch students or generate grid', e);
          }
        } catch (err) {
          console.error('Error fetching rekap:', err);
          setError(err.message);
          setRekapNilai([]);
        } finally {
          setLoadingRekap(false);
        }
      } else {
        setRekapNilai([]);
        setAllTpColumns([]);
        setKkmSettings({});
        setLoadingRekap(false);
      }
    };
    
    fetchRekap();
  }, [selectedAssignment, activeTASemester, userId]);

  const loadTpFromAtp = async (mapelId, kelasId) => {
    try {
      const currentAssignment = assignments.find(
        assign => `${assign.id_kelas}-${assign.id_mapel}` === selectedAssignment
      );

      if (!currentAssignment) {
        return;
      }

      let fase = 'A';
      const kelasName = currentAssignment?.nama_kelas || '';
      const tingkatKelas = parseInt(kelasName.match(/^(\d+)/)?.[1] || '1');
      
      if (tingkatKelas >= 1 && tingkatKelas <= 2) fase = 'A';
      else if (tingkatKelas >= 3 && tingkatKelas <= 4) fase = 'B';
      else if (tingkatKelas >= 5 && tingkatKelas <= 6) fase = 'C';

      let semesterNumber = null;
      if (activeTASemester && activeTASemester.semester) {
        semesterNumber = activeTASemester.semester.toLowerCase() === 'ganjil' ? 1 : 2;
      }

      const tpData = await guruApi.getTpByMapelFaseKelas(mapelId, fase, kelasId, semesterNumber);
      
      let tpNumbers = [];
      
      if (tpData.success && tpData.tp_list && tpData.tp_list.length > 0) {
        tpNumbers = tpData.tp_list.map((_, index) => index + 1);
      }
      
      // Load TP manual dari database
      const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
      const penugasanData = await guruApi.getPenugasanByGuruMapelKelas(
        userId,
        mapelId,
        kelasId,
        activeTASemester.id_ta_semester
      );
      
      if (penugasanData && penugasanData.id_penugasan) {
        const manualTpData = await guruApi.getManualTp(
          penugasanData.id_penugasan,
          activeTASemester.id_ta_semester
        );
        
        if (manualTpData.success && manualTpData.manual_tp.length > 0) {
          const manualTpColumns = manualTpData.manual_tp.map(tp => tp.tp_number);
          // Gabungkan dengan TP dari ATP, hilangkan duplikat
          const allTp = [...new Set([...tpNumbers, ...manualTpColumns])].sort((a, b) => a - b);
          tpNumbers = allTp;
        }
      }
      
      setAllTpColumns(tpNumbers.length > 0 ? tpNumbers : []);
    } catch (err) {
      console.log('Error loading TP from ATP:', err.message);
      setAllTpColumns([]);
    }
  };

  if (loading) return <LoadingSpinner message="Memuat data rekap nilai..." />;
  if (error) return <StatusMessage type="error" message={error} />;

  const currentAssignment = assignments.find(
    assign => `${assign.id_kelas}-${assign.id_mapel}` === selectedAssignment
  );

  // Mengolah data rekap untuk tampilan tabel pivot
  const processedRekap = {};
  const gradeTypes = new Set();
  
  // Tambahkan semua TP dari ATP ke gradeTypes (supaya kolom muncul meski belum ada nilai)
  if (allTpColumns.length > 0) {
    allTpColumns.forEach(tpNum => {
      gradeTypes.add(`TP${tpNum}`);
    });
  }
  
  // Tambahkan UAS
  gradeTypes.add('UAS');
  
  // Process nilai yang ada
  if (Array.isArray(rekapNilai) && rekapNilai.length > 0) {
    rekapNilai.forEach(item => {
      if (!item || !item.id_siswa) return; // Skip invalid data
      
      // Use id_siswa as key instead of nama_siswa (more reliable)
      if (!processedRekap[item.id_siswa]) {
        processedRekap[item.id_siswa] = { 
          id_siswa: item.id_siswa, 
          nama_siswa: item.nama_siswa 
        };
      }
      
      // Create column name based on jenis_nilai and urutan_tp
      let columnName;
      if (item.jenis_nilai === 'TP') {
        columnName = `TP${item.urutan_tp}`;
      } else if (item.jenis_nilai === 'UAS') {
        columnName = 'UAS';
      } else {
        columnName = item.jenis_nilai; // fallback
      }
      
      processedRekap[item.id_siswa][columnName] = item.nilai;
      gradeTypes.add(columnName); // Tetap add untuk handle TP manual yang belum di ATP
    });
  }

  const uniqueGradeTypes = Array.from(gradeTypes).sort((a, b) => {
    // Custom sort: TP1, TP2, TP3, ..., UAS
    if (a.startsWith('TP') && b.startsWith('TP')) {
      const numA = parseInt(a.substring(2));
      const numB = parseInt(b.substring(2));
      return numA - numB;
    } else if (a.startsWith('TP') && b === 'UAS') {
      return -1; // TP comes before UAS
    } else if (a === 'UAS' && b.startsWith('TP')) {
      return 1; // UAS comes after TP
    }
    return a.localeCompare(b);
  });
  const rekapTableData = Object.values(processedRekap);

  // Prepare columns for Table component
  const columns = [
    {
      key: 'nama_siswa',
      label: 'Nama Siswa',
      className: 'font-medium text-gray-900',
    },
    ...uniqueGradeTypes.map(tipe => ({
      key: tipe,
      // Show KKM value in header if available
      label: tipe + (tipe.startsWith('TP') ? ` (KKM ${ (Number(kkmSettings[tipe] || kkmSettings[`TP${tipe.replace('TP','')}`]) || (tipe.startsWith('TP') ? 75 : '')) })` : (tipe === 'UAS' ? ` (KKM ${ (Number(kkmSettings.UAS) || 75) })` : '')),
      className: 'text-center',
      render: (nilai, row) => {
        // Determine KKM threshold for this column
        let kkmVal = 75;
        if (tipe.startsWith('TP')) {
          const tpNum = parseInt(tipe.substring(2));
          const v = kkmSettings && (kkmSettings[`TP${tpNum}`] !== undefined) ? Number(kkmSettings[`TP${tpNum}`]) : NaN;
          kkmVal = !isNaN(v) ? v : 75;
        } else if (tipe === 'UAS') {
          const v = kkmSettings && (kkmSettings.UAS !== undefined) ? Number(kkmSettings.UAS) : NaN;
          kkmVal = !isNaN(v) ? v : 75;
        }
        const yellowThreshold = Math.max(0, kkmVal - 15);

        return (
          <span className={`inline-flex items-center justify-center w-16 px-2 py-1 rounded ${
            typeof nilai === 'number' 
              ? (nilai >= kkmVal
                  ? 'bg-green-100 text-green-800 font-semibold'
                  : (nilai >= yellowThreshold ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800 font-semibold'))
              : 'text-gray-400'
          }`}>
            {typeof nilai === 'number' ? nilai : '-'}
          </span>
        );
      },
    })),
    {
      key: 'nilai_akhir',
      label: 'Nilai Akhir',
      className: 'text-center font-semibold',
      render: (value, row) => {
        // Table passes (value, row) - we need row object
        // Calculate TP average with safe access
        const tpGrades = uniqueGradeTypes
          .filter(tipe => tipe.startsWith('TP'))
          .map(tipe => row?.[tipe]) // Safe access
          .filter(n => typeof n === 'number');
        const tpAverage = tpGrades.length > 0 ? tpGrades.reduce((sum, n) => sum + n, 0) / tpGrades.length : 0;
        
        // Get UAS value with safe access
        const uasValue = row?.['UAS'];
        
        // Calculate final grade (70% TP + 30% UAS)
        let finalGrade = '-';
        if (tpGrades.length > 0 && typeof uasValue === 'number') {
          finalGrade = (tpAverage * 0.7 + uasValue * 0.3).toFixed(2);
        }
        
        // Determine final KKM
        const finalKkm = (kkmSettings && kkmSettings.FINAL !== undefined && !isNaN(Number(kkmSettings.FINAL))) ? Number(kkmSettings.FINAL) : 75;
        const finalYellow = Math.max(0, finalKkm - 15);
        
        return (
          <span className={`inline-flex items-center justify-center w-20 px-3 py-1 rounded-full font-bold ${
            finalGrade !== '-'
              ? (parseFloat(finalGrade) >= finalKkm 
                  ? 'bg-green-500 text-white'
                  : (parseFloat(finalGrade) >= finalYellow ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'))
              : 'text-gray-400'
          }`}>
            {finalGrade}
          </span>
        );
      },
    },
  ];

  return (
    <ModuleContainer>
      <PageHeader
        icon="clipboard-list"
        title="Rekap Nilai Siswa"
        subtitle={activeTASemester ? `${activeTASemester.tahun_ajaran} - ${activeTASemester.semester}` : 'Belum ada tahun ajaran aktif'}
        badge={currentAssignment ? `${currentAssignment.nama_kelas} - ${currentAssignment.nama_mapel}` : null}
      />

      {message && <StatusMessage type={messageType} message={message} />}

      {!activeTASemester && (
        <StatusMessage
          type="warning"
          message="Tahun Ajaran & Semester aktif belum diatur. Harap hubungi Admin."
        />
      )}

      {assignments.length > 0 ? (
        <>
          <FormSection title="Pilih Kelas dan Mata Pelajaran">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas dan Mata Pelajaran
                </label>
                <select
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                >
                  {assignments.map(assign => (
                    <option key={`${assign.id_kelas}-${assign.id_mapel}`} value={`${assign.id_kelas}-${assign.id_mapel}`}>
                      {assign.nama_kelas} - {assign.nama_mapel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          {currentAssignment && (
            <div className="card-body">
              <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                  <i className="fas fa-chart-line mr-2"></i>
                  Rekap Nilai {currentAssignment.nama_mapel} di Kelas {currentAssignment.nama_kelas}
                </h3>
                <p className="text-sm text-gray-600">
                  <i className="fas fa-info-circle mr-1"></i>
                  <strong>Keterangan:</strong> Nilai Akhir = 70% rata-rata TP + 30% UAS
                </p>

                {/* Color legend and KKM note */}
                <div className="mt-3 p-3 bg-white border rounded">
                  <p className="text-sm font-medium text-gray-800 mb-2">Catatan Warna:</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                      <span>Hijau — Nilai &ge; KKM (nilai KKM di-set oleh guru)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                      <span>Kuning — Nilai &ge; (KKM - 15)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                      <span>Merah — Nilai &lt; (KKM - 15)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    KKM diambil dari pengaturan guru untuk kombinasi kelas & mata pelajaran ini. Jika belum diset oleh guru, sistem menggunakan nilai default <strong>75</strong> untuk perhitungan warna.
                  </p>
                </div>
              </div>

              {loadingRekap ? (
                <LoadingSpinner text="Memuat rekap nilai..." />
              ) : rekapTableData.length > 0 ? (
                <>
                  {/* Sub-menu tabs */}
                  <div className="mb-4 flex items-center gap-3">
                    <button
                      className={`px-4 py-2 rounded ${activeTab === 'rekap' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'}`}
                      onClick={() => setActiveTab('rekap')}
                    >
                      Rekap Nilai
                    </button>

                    <button
                      className={`px-4 py-2 rounded ${activeTab === 'analysis' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'}`}
                      onClick={() => setActiveTab('analysis')}
                    >
                      Analisis Soal
                    </button>

                    <div className="ml-auto flex items-center gap-3 text-sm text-gray-600">
                      <span className="text-xs text-gray-500">Scale:</span>
                      <select className="border rounded px-2 py-1" value={scale} onChange={e => setScale(e.target.value)}>
                        <option value="binary">Binary (0/1)</option>
                        <option value="5">1 - 5</option>
                        <option value="100">0 - 100</option>
                      </select>
                    </div>
                  </div>

                  {activeTab === 'rekap' ? (
                    <div className="overflow-x-auto">
                      <Table
                        columns={columns}
                        data={rekapTableData}
                        keyField="id_siswa"
                      />
                    </div>
                  ) : (
                    // ANALYSIS TAB
                    <div>
                      <div className="mb-4 p-4 bg-white border rounded">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Actions</label>
                            <div className="mt-1 flex gap-2">
                              <Button onClick={runAnalysis}>Run Analysis</Button>
                              <Button variant="secondary" onClick={() => { setAnalysisResults([]); setQuestionWeights({}); }}>Clear</Button>
                            </div>
                          </div>

                          <div className="col-span-2 text-sm text-gray-500">Table is auto-generated and students are auto-loaded when assignment data is available.</div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 items-center">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
                            <input type="text" value={subjectName} onChange={e=>setSubjectName(e.target.value)} className="mt-1 w-full px-2 py-1 border rounded" placeholder="Contoh: Matematika" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Kelas (untuk export)</label>
                            <input type="text" value={classNameExport} onChange={e=>setClassNameExport(e.target.value)} className="mt-1 w-full px-2 py-1 border rounded" placeholder="Contoh: 7A" />
                          </div>
                        </div>                        <div className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Jumlah Soal (Q)</label>
                              <input type="number" min="1" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="mt-1 w-full px-2 py-1 border rounded" />
                              <p className="text-xs text-gray-500 mt-2">Jumlah soal dapat diatur manual, tetapi tabel juga auto-generate saat data siswa tersedia.</p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Paste dari Excel</label>
                              <textarea value={pastedText} onChange={e=>setPastedText(e.target.value)} placeholder="Paste block dari Excel (kolom dipisah tab, baris siswa per baris)" className="mt-1 w-full p-2 border rounded h-20" />
                              <div className="mt-2 flex gap-2">
                                <Button onClick={applyPastedBlock}>Apply Paste</Button>
                                <Button variant="secondary" onClick={()=>setPastedText('')}>Clear</Button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Export / Save</label>
                              <div className="mt-1 flex gap-2">
                                <Button onClick={exportAnalysisCSV}>Export CSV</Button>
                                <Button onClick={() => exportCTTAnalysisToExcel({ subjectName, className: classNameExport, questionKeys: questionKeys.length>0 ? questionKeys : [], students: (analysisStudents.length>0 ? analysisStudents : rekapTableData.map(r=>({ id_siswa: r.id_siswa, nama_siswa: r.nama_siswa }))), answers, weights, maxes, scale, analysisResults, cronbachAlpha, semValue })}>Export Excel</Button>
                                <Button variant="secondary" onClick={saveAnalysisJSON}>Save JSON</Button>
                              </div>
                            </div>
                          </div>

                          {/* Grid */}
                          {questionKeys && questionKeys.length > 0 && (
                            <div className="mt-4 overflow-auto border rounded">
                              <table className="min-w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="p-2 border">No</th>
                                    <th className="p-2 border">Nama Peserta Didik</th>
                                    {questionKeys.map(k => (
                                      <th key={k} className="p-2 border text-center">
                                        <div className="text-sm font-semibold">{k.replace('Q','')}</div>
                                        <div className="mt-1">
                                          <input title="Bobot (opsional)" type="number" step="0.01" min="0" value={weights[k] ?? 1} onChange={e=> setWeights({ ...weights, [k]: Number(e.target.value) })} className="w-16 px-1 py-0.5 border rounded text-center" />
                                        </div>
                                      </th>
                                    ))}

                                  </tr>

                                  <tr className="bg-gray-50">
                                    <th className="p-1 border">&nbsp;</th>
                                    <th className="p-1 border text-sm">Total Bobot</th>
                                    {questionKeys.map(k => (
                                      <th key={k+"-w"} className="p-1 border text-center text-sm">{(weights && weights[k]) ? Number(weights[k]).toFixed(2) : ''}</th>
                                    ))}
                                    <th className="p-1 border text-center text-sm font-medium">{getTotalWeight().toFixed(2)}</th>
                                  </tr> 
                                </thead>
                                <tbody>
                                  {(analysisStudents && analysisStudents.length>0 ? analysisStudents : rekapTableData.map(r=>({ id_siswa: r.id_siswa, nama_siswa: r.nama_siswa }))).map((s, idx) => (
                                    <tr key={s.id_siswa} className="odd:bg-white even:bg-gray-50">
                                      <td className="p-2 border text-center">{idx+1}</td>
                                      <td className="p-2 border">{s.nama_siswa}</td>
                                      {questionKeys.map(k => (
                                        <td key={k} className="p-1 border text-center">
                                          <input type="number" value={answers[s.id_siswa] && answers[s.id_siswa][k] !== undefined ? answers[s.id_siswa][k] : ''} onChange={e=> setCellValue(s.id_siswa, k, e.target.value)} className="w-20 px-1 py-0.5 border rounded text-center" />
                                        </td>
                                      ))}

                                      <td className="p-2 border text-center font-semibold">{(() => { const d = computeStudentRawFromAnswers(s.id_siswa); return d.fraction===null ? '-' : `( ${d.weightedPoints.toFixed(2)} / ${d.totalWeight.toFixed(2)} ) ${(d.fraction*100).toFixed(1)}%`; })()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-gray-100">
                                    <td className="p-2 border text-sm">#Resp</td>
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                    {questionKeys.map(k => {
                                      const ar = analysisStudents.length>0 ? analysisStudents : rekapTableData.map(r=>({ id_siswa: r.id_siswa }));
                                      let n = 0; let sum=0; let cnt=0;
                                      ar.forEach(s=>{ const v = answers[s.id_siswa] && answers[s.id_siswa][k]; if (v !== '' && v !== undefined && v !== null) { const num = Number(v); if (!isNaN(num)) { n++; sum+=num; cnt++; } } });
                                      const mean = cnt>0 ? (sum / cnt) : null;
                                      return <td key={k} className="p-2 border text-center text-sm font-medium">{n}</td>;
                                    })}
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                  </tr>

                                  <tr className="bg-gray-100">
                                    <td className="p-2 border text-sm">p-value</td>
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                    {questionKeys.map(k => {
                                      const ar = analysisStudents.length>0 ? analysisStudents : rekapTableData.map(r=>({ id_siswa: r.id_siswa }));
                                      let n=0, sum=0;
                                      const max = (maxes && maxes[k]) ? Number(maxes[k]) : getDefaultForScale(scale).max;
                                      ar.forEach(s=>{ const v = answers[s.id_siswa] && answers[s.id_siswa][k]; if (v !== '' && v !== undefined && v !== null) { const num = Number(v); if (!isNaN(num)) { n++; sum += num; } } });
                                      const mean = n===0 ? null : (sum / n);
                                      const p = mean === null ? null : ( max > 0 ? (mean / max) : null );
                                      return <td key={k} className="p-2 border text-center text-sm">{p===null ? '-' : p.toFixed(3)}</td>;
                                    })}
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                  </tr>

                                  <tr className="bg-gray-100">
                                    <td className="p-2 border text-sm">Mean %</td>
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                    {questionKeys.map(k => {
                                      const ar = analysisStudents.length>0 ? analysisStudents : rekapTableData.map(r=>({ id_siswa: r.id_siswa }));
                                      let sum=0, n=0;
                                      const max = (maxes && maxes[k]) ? Number(maxes[k]) : getDefaultForScale(scale).max;
                                      ar.forEach(s=>{ const v = answers[s.id_siswa] && answers[s.id_siswa][k]; if (v !== '' && v !== undefined && v !== null) { const num = Number(v); if (!isNaN(num)) { n++; sum += (max>0 ? (num / max) : 0); } } });
                                      const mean = n===0 ? null : (sum / n);
                                      return <td key={k} className="p-2 border text-center text-sm">{mean===null ? '-' : ( (mean*100).toFixed(1) + '%' )}</td>;
                                    })}
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                  </tr>

                                  <tr className="bg-gray-100">
                                    <td className="p-2 border text-sm">Difficulty</td>
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                    {questionKeys.map(k => {
                                      const ar = analysisStudents.length>0 ? analysisStudents : rekapTableData.map(r=>({ id_siswa: r.id_siswa }));
                                      let n=0, sum=0;
                                      const max = (maxes && maxes[k]) ? Number(maxes[k]) : getDefaultForScale(scale).max;
                                      ar.forEach(s=>{ const v = answers[s.id_siswa] && answers[s.id_siswa][k]; if (v !== '' && v !== undefined && v !== null) { const num = Number(v); if (!isNaN(num)) { n++; sum += num; } } });
                                      const mean = n===0 ? null : (sum / n);
                                      const p = mean === null ? null : ( max > 0 ? (mean / max) : null );
                                      const diff = classifyByP(p);
                                      let cls = 'bg-yellow-200 text-yellow-800'; if (diff === 'Mudah') cls='bg-green-200 text-green-800'; if (diff==='Sukar') cls='bg-red-200 text-red-800'; if (diff==='-') cls='bg-gray-100 text-gray-600';
                                      return <td key={k} className="p-2 border text-center"><span className={`px-2 py-1 rounded ${cls}`}>{diff}</span></td>; 
                                    })}
                                    <td className="p-2 border text-sm">&nbsp;</td>
                                  </tr>
                                </tfoot>
                              </table>

                              <div className="p-3 flex items-center gap-3">
                                <Button onClick={runAnalysis}>Run Detailed Analysis</Button>
                                <Button variant="secondary" onClick={() => { setQuestionKeys([]); setAnswers({}); setAnalysisStudents([]); }}>Reset Grid</Button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      {analysisResults.length === 0 ? (
                        <EmptyState icon="chart-bar" title="Belum ada analisis" message="Klik 'Run Analysis' untuk melihat hasil." />
                      ) : (
                        <div>
                          <div className="mb-3 p-3 bg-white border rounded flex gap-4 items-center text-sm">
                            <div><strong>Cronbach's alpha:</strong> {cronbachAlpha === null ? '-' : (cronbachAlpha.toFixed(3))}</div>
                            <div><strong>SEM:</strong> {semValue === null ? '-' : semValue.toFixed(3)}</div>
                            <div><strong>Items:</strong> {questionKeys.length}</div>
                            <div className="text-gray-500">(Alpha computed on unweighted item fractions 0..1)</div>
                          </div>
                          <div className="overflow-x-auto">
                            <Table columns={analysisColumns} data={analysisResults} keyField="question" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon="clipboard-list"
                  title="Belum Ada Nilai"
                  message="Belum ada nilai yang diinput untuk kombinasi kelas dan mata pelajaran ini."
                />
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="chalkboard-teacher"
          title="Belum Ada Penugasan"
          message="Anda belum ditugaskan mengajar mata pelajaran di kelas manapun untuk semester aktif ini. Silakan hubungi Admin."
        />
      )}
    </ModuleContainer>
  );
};

export default RekapNilai;
