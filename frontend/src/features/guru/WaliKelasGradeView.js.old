// frontend/src/features/guru/WaliKelasGradeView.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import * as guruApi from '../../api/guru';
import { fetchStudentAnalytics } from '../../api/analytics';
import { ALLOWED_MAPEL_WALI, normalizeName } from '../../config/constants';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const WaliKelasGradeView = ({ activeTASemester, userId }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'grades', 'students', 'analytics'
  const [gradesData, setGradesData] = useState(null); // Raw data from API
  const [classInfo, setClassInfo] = useState(null); // Class info from API
  const [classList, setClassList] = useState([]); // List of classes where user is wali kelas
  const [selectedClass, setSelectedClass] = useState(null); // Selected class ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null); // For student detail view
  const [studentHistory, setStudentHistory] = useState(null); // Student history from analytics
  const [processedData, setProcessedData] = useState({
    gradesPerSubjectTable: new Map(), // Map<nama_mapel, Array<studentGradeData>>
    summaryTableData: [],             // Array<summaryStudentData>
    uniqueTipeNilaiPerMapel: new Map(), // Map<nama_mapel, Set<jenis_nilai>>
    gradesByStudentChart: [],
    gradesBySubjectChart: [],
    gradeDistributionChart: [],
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Fetch list of classes where user is wali kelas
  const fetchWaliKelasClassList = useCallback(async () => {
    try {
      if (!userId || !activeTASemester) return;
      const classes = await guruApi.getWaliKelasClassList(userId, activeTASemester.id_ta_semester);
      setClassList(classes);
      
      // Auto-select first class if available
      if (classes.length > 0 && !selectedClass) {
        setSelectedClass(classes[0].id_kelas);
      }
    } catch (err) {
      console.error('Error fetching wali kelas class list:', err);
    }
  }, [userId, activeTASemester, selectedClass]);

  const fetchWaliKelasGrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId || !activeTASemester) {
        setError("Informasi guru atau tahun ajaran aktif tidak tersedia.");
        setLoading(false);
        return;
      }
      const response = await guruApi.getWaliKelasGrades(userId, activeTASemester.id_ta_semester, selectedClass);
      setGradesData(response.grades);
      setClassInfo(response.classInfo);
      processGradeData(response.grades);
    } catch (err) {
      setError(err.message);
      setGradesData([]);
      setClassInfo(null);
      setProcessedData({
        gradesPerSubjectTable: new Map(),
        summaryTableData: [],
        uniqueTipeNilaiPerMapel: new Map(),
        gradesByStudentChart: [],
        gradesBySubjectChart: [],
        gradeDistributionChart: [],
      });
    } finally {
      setLoading(false);
    }
  }, [activeTASemester, userId, selectedClass]);

  // Fetch student history when selected
  const fetchStudentHistory = useCallback(async (studentId) => {
    try {
      const result = await fetchStudentAnalytics(studentId, {});
      setStudentHistory(result);
    } catch (err) {
      console.error('Error fetching student history:', err);
      setStudentHistory(null);
    }
  }, []);

  // Handle student selection
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setActiveView('studentDetail');
    fetchStudentHistory(student.id_siswa);
  };

  useEffect(() => {
    fetchWaliKelasClassList();
  }, [fetchWaliKelasClassList]);

  useEffect(() => {
    if (selectedClass) {
      fetchWaliKelasGrades();
    }
  }, [fetchWaliKelasGrades, selectedClass]);

  const processGradeData = (grades) => {
    const gradesPerSubjectTable = new Map(); // { 'Matematika': [{id_siswa, nama_siswa, 'Tugas Harian': 80, 'UTS': 75, total_mapel, count_mapel}, ...]}
    const summaryStudentMap = new Map(); // { id_siswa: { nama_siswa, overall_total, overall_count, 'Fisika_RataRata': 85, ... } }
    const subjectChartMap = new Map(); // { nama_mapel: { total_nilai, count } }
    // gradeDistributionCounts akan dihitung dari rata-rata akhir siswa, bukan nilai individual
    const uniqueTipeNilaiPerMapel = new Map(); // { 'Matematika': Set('Tugas Harian', 'UTS'), ... }

    // First pass: Populate detailed subject data and initial summary data
    grades.forEach(grade => {
      // Initialize student in summary even if no grade data
      if (!summaryStudentMap.has(grade.id_siswa)) {
        summaryStudentMap.set(grade.id_siswa, {
          id_siswa: grade.id_siswa,
          nama_siswa: grade.nama_siswa,
          overall_total: 0,
          overall_count: 0,
          subject_totals: new Map(), // { 'Fisika': { total: 0, count: 0 } }
        });
      }
      
      // If no grade data (student has no grades yet), skip the rest
      if (!grade.nama_mapel || !grade.jenis_nilai || grade.nilai === null) {
        return;
      }

      // Initialize structures if not present
      if (!gradesPerSubjectTable.has(grade.nama_mapel)) {
        gradesPerSubjectTable.set(grade.nama_mapel, new Map()); // Inner map for students
      }
      const studentsInSubjectMap = gradesPerSubjectTable.get(grade.nama_mapel);

      if (!studentsInSubjectMap.has(grade.id_siswa)) {
        studentsInSubjectMap.set(grade.id_siswa, {
          id_siswa: grade.id_siswa,
          nama_siswa: grade.nama_siswa,
          total_mapel_nilai: 0,
          count_mapel_nilai: 0,
        });
      }
      const studentSubjectData = studentsInSubjectMap.get(grade.id_siswa);
      
      // Create display key for jenis_nilai (e.g., "TP 1", "TP 2", "UAS")
      const displayKey = grade.jenis_nilai === 'TP' && grade.urutan_tp 
        ? `${grade.jenis_nilai} ${grade.urutan_tp}` 
        : grade.jenis_nilai;
      
      studentSubjectData[displayKey] = grade.nilai; // Assign grade by type
      studentSubjectData.total_mapel_nilai += grade.nilai;
      studentSubjectData.count_mapel_nilai++;

      // Collect unique grade types per subject
      if (!uniqueTipeNilaiPerMapel.has(grade.nama_mapel)) {
        uniqueTipeNilaiPerMapel.set(grade.nama_mapel, new Set());
      }
      uniqueTipeNilaiPerMapel.get(grade.nama_mapel).add(displayKey);

      // Populate summaryStudentMap (for overall student averages and per-subject averages)
      const studentSummary = summaryStudentMap.get(grade.id_siswa);
      studentSummary.overall_total += grade.nilai;
      studentSummary.overall_count++;

      if (!studentSummary.subject_totals.has(grade.nama_mapel)) {
        studentSummary.subject_totals.set(grade.nama_mapel, { total: 0, count: 0 });
      }
      const subjectTotal = studentSummary.subject_totals.get(grade.nama_mapel);
      subjectTotal.total += grade.nilai;
      subjectTotal.count++;

      // Populate subjectChartMap (for overall subject average chart)
      if (!subjectChartMap.has(grade.nama_mapel)) {
        subjectChartMap.set(grade.nama_mapel, { total_nilai: 0, count: 0 });
      }
      const subjectChart = subjectChartMap.get(grade.nama_mapel);
      subjectChart.total_nilai += grade.nilai;
      subjectChart.count++;
    });

    // Finalize gradesPerSubjectTable
    const finalGradesPerSubjectTable = new Map();
    gradesPerSubjectTable.forEach((studentsMap, nama_mapel) => {
      const studentList = Array.from(studentsMap.values()).map(student => ({
        ...student,
        rata_rata_mapel: student.count_mapel_nilai > 0 ? parseFloat((student.total_mapel_nilai / student.count_mapel_nilai).toFixed(2)) : 0,
      })).sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa));
      finalGradesPerSubjectTable.set(nama_mapel, studentList);
    });

    // Finalize summaryTableData
    const summaryTableData = Array.from(summaryStudentMap.values()).map(student => {
      const studentSummaryObj = {
        id_siswa: student.id_siswa,
        nama_siswa: student.nama_siswa,
        overall_final_average: student.overall_count > 0 ? parseFloat((student.overall_total / student.overall_count).toFixed(2)) : 0,
      };
      student.subject_totals.forEach((data, nama_mapel) => {
        studentSummaryObj[`${nama_mapel}_RataRata`] = data.count > 0 ? parseFloat((data.total / data.count).toFixed(2)) : null;
      });
      return studentSummaryObj;
    }).sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa));

    // --- NEW LOGIC FOR GRADE DISTRIBUTION CHART (BASED ON STUDENT FINAL AVERAGE) ---
    const gradeDistributionCounts = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'E (<60)': 0 };
    summaryTableData.forEach(student => {
      const average = student.overall_final_average;
      if (average >= 90) gradeDistributionCounts['A (90-100)']++;
      else if (average >= 80) gradeDistributionCounts['B (80-89)']++;
      else if (average >= 70) gradeDistributionCounts['C (70-79)']++;
      else if (average >= 60) gradeDistributionCounts['D (60-69)']++;
      else gradeDistributionCounts['E (<60)']++;
    });
    const totalStudentsForDistribution = Object.values(gradeDistributionCounts).reduce((sum, count) => sum + count, 0);
    const gradeDistributionChart = Object.entries(gradeDistributionCounts).map(([range, count]) => ({
      name: range,
      value: count,
      percentage: totalStudentsForDistribution > 0 ? parseFloat(((count / totalStudentsForDistribution) * 100).toFixed(2)) : 0,
    }));
    // --- END NEW LOGIC ---

    // Chart data (re-using existing logic)
    const gradesByStudentChart = Array.from(summaryStudentMap.values()).map(student => ({
      nama_siswa: student.nama_siswa,
      rata_rata: student.overall_count > 0 ? parseFloat((student.overall_total / student.overall_count).toFixed(2)) : 0,
    })).sort((a, b) => a.nama_siswa.localeCompare(b.nama_siswa));

    let gradesBySubjectChart = Array.from(subjectChartMap.entries()).map(([name, data]) => ({
      nama_mapel: name,
      rata_rata: data.count > 0 ? parseFloat((data.total_nilai / data.count).toFixed(2)) : 0,
    })).sort((a, b) => a.nama_mapel.localeCompare(b.nama_mapel));

    // === Apply Wali Kelas subject filter ===
    const allowedSet = new Set(ALLOWED_MAPEL_WALI.map(normalizeName));

    // Filter the per-subject detailed tables
    const filteredGradesPerSubjectTable = new Map();
    finalGradesPerSubjectTable.forEach((value, key) => {
      if (allowedSet.has(normalizeName(key))) {
        filteredGradesPerSubjectTable.set(key, value);
      }
    });

    // Filter unique grade types map to only allowed subjects
    const filteredUniqueTipeNilaiPerMapel = new Map();
    uniqueTipeNilaiPerMapel.forEach((set, key) => {
      if (allowedSet.has(normalizeName(key))) {
        filteredUniqueTipeNilaiPerMapel.set(key, set);
      }
    });

    // Filter chart data to allowed subjects
    gradesBySubjectChart = gradesBySubjectChart.filter(item => allowedSet.has(normalizeName(item.nama_mapel)));

    setProcessedData({
      gradesPerSubjectTable: filteredGradesPerSubjectTable,
      summaryTableData,
      uniqueTipeNilaiPerMapel: filteredUniqueTipeNilaiPerMapel,
      gradesByStudentChart,
      gradesBySubjectChart,
      gradeDistributionChart, // Use the newly calculated distribution
    });
  };

  const sortedSummaryData = useMemo(() => {
    let sortableItems = [...processedData.summaryTableData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else { // Numeric or null
          aValue = aValue === null ? -Infinity : aValue; // Treat null as very small for sorting
          bValue = bValue === null ? -Infinity : bValue;

          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [processedData.summaryTableData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
        direction = 'none'; // Add a 'none' state to remove sorting
        key = null; // Reset key
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') return ' ▲';
      if (sortConfig.direction === 'descending') return ' ▼';
    }
    return '';
  };

  if (loading) return <p>Memuat dashboard wali kelas...</p>;
  if (error) return <p className="message error">Error: {error}</p>;
  if (!classInfo) return <p className="message info">Anda bukan wali kelas untuk Tahun Ajaran & Semester aktif ini.</p>;

  // Get all unique subject names for summary table headers (already filtered)
  const allSubjectNames = Array.from(processedData.gradesPerSubjectTable.keys()).sort();

  // Calculate statistics for overview
  const totalStudents = processedData.summaryTableData.length;
  const avgClassGrade = totalStudents > 0 
    ? (processedData.summaryTableData.reduce((sum, s) => sum + s.overall_final_average, 0) / totalStudents).toFixed(2)
    : 0;
  const studentsAbove75 = processedData.summaryTableData.filter(s => s.overall_final_average >= 75).length;
  const studentsBelow60 = processedData.summaryTableData.filter(s => s.overall_final_average < 60).length;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          📚 Dashboard Wali Kelas: {classInfo.nama_kelas}
        </h2>
        <p className="text-gray-600">
          Tahun Ajaran {activeTASemester.tahun_ajaran} - Semester {activeTASemester.semester}
        </p>
        
        {/* Class Selector - Only show if multiple classes */}
        {classList.length > 1 && (
          <div className="mt-4 flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-3">Pilih Kelas:</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {classList.map((kelas) => (
                <option key={kelas.id_kelas} value={kelas.id_kelas}>
                  {kelas.nama_kelas} ({kelas.jumlah_siswa} siswa)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeView === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveView('students')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeView === 'students'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Daftar Siswa ({totalStudents})
          </button>
          <button
            onClick={() => setActiveView('grades')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeView === 'grades'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 Nilai Detail
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeView === 'analytics'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📈 Statistik & Grafik
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
              <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            </div>
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rata-rata Kelas</p>
              <p className="text-3xl font-bold text-green-600">{avgClassGrade}</p>
            </div>
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Nilai ≥ 75</p>
              <p className="text-3xl font-bold text-purple-600">{studentsAbove75}</p>
              <p className="text-xs text-gray-500">{((studentsAbove75/totalStudents)*100).toFixed(0)}% siswa</p>
            </div>
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Perlu Perhatian</p>
              <p className="text-3xl font-bold text-red-600">{studentsBelow60}</p>
              <p className="text-xs text-gray-500">Nilai {'<'} 60</p>
            </div>
          </div>

          {/* Siswa Perlu Perhatian */}
          {studentsBelow60 > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Siswa yang Perlu Perhatian Khusus</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">Nama Siswa</th>
                      <th className="px-4 py-2 border">Rata-rata</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.summaryTableData
                      .filter(s => s.overall_final_average < 60)
                      .sort((a, b) => a.overall_final_average - b.overall_final_average)
                      .map(student => (
                        <tr key={student.id_siswa} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">{student.nama_siswa}</td>
                          <td className="px-4 py-2 border text-center">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold">
                              {student.overall_final_average}
                            </span>
                          </td>
                          <td className="px-4 py-2 border text-center">
                            <span className="px-2 py-1 bg-red-500 text-white rounded text-xs">
                              Kritis
                            </span>
                          </td>
                          <td className="px-4 py-2 border text-center">
                            <button
                              onClick={() => handleStudentClick(student)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Performers */}
          <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🏆 Top 5 Siswa Berprestasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {processedData.summaryTableData
                .sort((a, b) => b.overall_final_average - a.overall_final_average)
                .slice(0, 5)
                .map((student, idx) => (
                  <div key={student.id_siswa} className="p-3 bg-white border border-green-200 rounded text-center">
                    <div className="text-2xl mb-1">
                      {idx === 0 && '🥇'}
                      {idx === 1 && '🥈'}
                      {idx === 2 && '🥉'}
                      {idx > 2 && `#${idx + 1}`}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{student.nama_siswa}</p>
                    <p className="text-lg font-bold text-green-600">{student.overall_final_average}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Stats Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-gray-700 mb-3">Distribusi Nilai Kelas</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={processedData.gradeDistributionChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                  >
                    {processedData.gradeDistributionChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} siswa`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-gray-700 mb-3">Rata-rata per Mata Pelajaran</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={processedData.gradesBySubjectChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama_mapel" angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="rata_rata" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Students Tab - Daftar Siswa */}
      {activeView === 'students' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Daftar Siswa Kelas {classInfo.nama_kelas}
            </h3>
            <div className="text-sm text-gray-600">
              Total: {totalStudents} siswa
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 border text-left">No</th>
                  <th className="px-4 py-3 border text-left">ID Siswa</th>
                  <th className="px-4 py-3 border text-left">Nama Siswa</th>
                  <th className="px-4 py-3 border text-center">Rata-rata</th>
                  <th className="px-4 py-3 border text-center">Status</th>
                  <th className="px-4 py-3 border text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedSummaryData.map((student, idx) => {
                  const status = student.overall_final_average >= 75 ? 'Baik' : 
                                 student.overall_final_average >= 60 ? 'Cukup' : 'Perlu Perhatian';
                  const statusColor = student.overall_final_average >= 75 ? 'bg-green-100 text-green-800' : 
                                      student.overall_final_average >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800';
                  
                  return (
                    <tr key={student.id_siswa} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border">{idx + 1}</td>
                      <td className="px-4 py-3 border">{student.id_siswa}</td>
                      <td className="px-4 py-3 border font-medium">{student.nama_siswa}</td>
                      <td className="px-4 py-3 border text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                          {student.overall_final_average}
                        </span>
                      </td>
                      <td className="px-4 py-3 border text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 border text-center">
                        <button
                          onClick={() => handleStudentClick(student)}
                          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          📊 Lihat Histori
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grades Tab - Nilai Detail (existing tables) */}
      {activeView === 'grades' && !gradesData ? (
        <p className="message info">Belum ada nilai yang diinput untuk kelas {classInfo.nama_kelas} di semester ini.</p>
      ) : activeView === 'grades' && (
        <div>
          {/* Bagian Tabel Nilai per Mata Pelajaran */}
          {Array.from(processedData.gradesPerSubjectTable.entries()).map(([nama_mapel, studentsGradeList]) => {
            const uniqueTipeNilai = Array.from(processedData.uniqueTipeNilaiPerMapel.get(nama_mapel) || []).sort();
            const dynamicColumnsCount = uniqueTipeNilai.length;
            const perSubjectGridTemplateColumns = `minmax(150px, 1.5fr) repeat(${dynamicColumnsCount}, minmax(100px, 1fr)) minmax(120px, 0.8fr)`;

            return (
              <div key={nama_mapel} style={{ marginBottom: '40px' }}>
                <h4>Detail Nilai {nama_mapel}</h4>
                <div className="grades-table-wrapper comprehensive-grades-table">
                  <div className="grades-grid-header comprehensive-grades-header" style={{ gridTemplateColumns: perSubjectGridTemplateColumns }}>
                    <div className="grid-header-item">Nama Siswa</div>
                    {uniqueTipeNilai.map(tipe => (
                      <div key={tipe} className="grid-header-item grades-dynamic-header">{tipe}</div>
                    ))}
                    <div className="grid-header-item">Rata-rata {nama_mapel}</div>
                  </div>
                  {studentsGradeList.map(student => (
                    <div key={student.id_siswa} className="grades-grid-row comprehensive-grades-row" style={{ gridTemplateColumns: perSubjectGridTemplateColumns }}>
                      <div className="grid-cell-item student-name">{student.nama_siswa}</div>
                      {uniqueTipeNilai.map(tipe => (
                        <div key={`${student.id_siswa}-${tipe}`} className="grid-cell-item">
                          {student[tipe] !== undefined ? student[tipe] : '-'}
                        </div>
                      ))}
                      <div className="grid-cell-item grades-average">{student.rata_rata_mapel}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Bagian Tabel Ringkasan Akhir */}
          <h3 style={{ marginTop: '40px' }}>Ringkasan Nilai Siswa Keseluruhan</h3>
          <div className="grades-table-wrapper comprehensive-grades-table">
            <div className="grades-grid-header comprehensive-grades-header"
                 style={{ gridTemplateColumns: `minmax(180px, 1.5fr) repeat(${allSubjectNames.length}, minmax(120px, 1fr)) minmax(150px, 0.8fr)` }}>
              <div className="grid-header-item sortable" onClick={() => requestSort('nama_siswa')}>
                Nama Siswa {getSortIndicator('nama_siswa')}
              </div>
              {allSubjectNames.map(subject => (
                <div key={subject} className="grid-header-item grades-dynamic-header sortable" onClick={() => requestSort(`${subject}_RataRata`)}>
                  {subject} Rata-rata {getSortIndicator(`${subject}_RataRata`)}
                </div>
              ))}
              <div className="grid-header-item sortable" onClick={() => requestSort('overall_final_average')}>
                Rata-rata Akhir {getSortIndicator('overall_final_average')}
              </div>
            </div>
            {sortedSummaryData.map(student => (
              <div key={student.id_siswa} className="grades-grid-row comprehensive-grades-row"
                   style={{ gridTemplateColumns: `minmax(180px, 1.5fr) repeat(${allSubjectNames.length}, minmax(120px, 1fr)) minmax(150px, 0.8fr)` }}>
                <div className="grid-cell-item student-name">{student.nama_siswa}</div>
                {allSubjectNames.map(subject => (
                  <div key={`${student.id_siswa}-${subject}_RataRata`} className="grid-cell-item">
                    {student[`${subject}_RataRata`] !== null ? student[`${subject}_RataRata`] : '-'}
                  </div>
                ))}
                <div className="grid-cell-item grades-average">{student.overall_final_average}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab - Statistik & Grafik */}
      {activeView === 'analytics' && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Statistik & Analisis Kelas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-white border rounded-lg shadow">
              <h4 className="font-semibold text-gray-700 mb-4">Rata-rata Nilai per Siswa</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={processedData.gradesByStudentChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama_siswa" angle={-30} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rata_rata" fill="#0088FE" name="Rata-rata Nilai" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow">
              <h4 className="font-semibold text-gray-700 mb-4">Rata-rata per Mata Pelajaran</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={processedData.gradesBySubjectChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nama_mapel" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rata_rata" fill="#00C49F" name="Rata-rata Nilai" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 bg-white border rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-4">Distribusi Nilai Kelas</h4>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={processedData.gradeDistributionChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                >
                  {processedData.gradeDistributionChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} siswa`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Student Detail View - Histori Siswa */}
      {activeView === 'studentDetail' && selectedStudent && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{selectedStudent.nama_siswa}</h3>
              <p className="text-gray-600">ID: {selectedStudent.id_siswa}</p>
            </div>
            <button
              onClick={() => {
                setActiveView('students');
                setSelectedStudent(null);
                setStudentHistory(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Kembali ke Daftar Siswa
            </button>
          </div>

          {/* Current Semester Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Rata-rata Semester Ini</p>
              <p className="text-3xl font-bold text-blue-600">{selectedStudent.overall_final_average}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Mapel Tertinggi</p>
              <p className="text-xl font-bold text-green-600">
                {(() => {
                  let highest = 0;
                  let mapelName = '-';
                  allSubjectNames.forEach(subject => {
                    const avg = selectedStudent[`${subject}_RataRata`];
                    if (avg && avg > highest) {
                      highest = avg;
                      mapelName = subject;
                    }
                  });
                  return mapelName;
                })()}
              </p>
              <p className="text-sm text-gray-500">
                {Math.max(...allSubjectNames.map(s => selectedStudent[`${s}_RataRata`] || 0))}
              </p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Mapel Terendah</p>
              <p className="text-xl font-bold text-red-600">
                {(() => {
                  let lowest = 100;
                  let mapelName = '-';
                  allSubjectNames.forEach(subject => {
                    const avg = selectedStudent[`${subject}_RataRata`];
                    if (avg && avg < lowest) {
                      lowest = avg;
                      mapelName = subject;
                    }
                  });
                  return mapelName;
                })()}
              </p>
              <p className="text-sm text-gray-500">
                {Math.min(...allSubjectNames.map(s => selectedStudent[`${s}_RataRata`] || 100).filter(v => v > 0))}
              </p>
            </div>
          </div>

          {/* Student History Chart */}
          {studentHistory && studentHistory.data && studentHistory.data.length > 0 && (
            <div className="mb-6 p-4 bg-white border rounded-lg shadow">
              <h4 className="font-semibold text-gray-700 mb-4">📈 Histori Nilai Siswa (Multi-Semester)</h4>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={studentHistory.data.map(item => ({
                  period: `${item.tahun_ajaran} ${item.semester}`,
                  [item.nama_mapel]: parseFloat(item.rata_keseluruhan || 0)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" angle={-15} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {Array.from(new Set(studentHistory.data.map(d => d.nama_mapel))).map((mapel, idx) => (
                    <Line
                      key={idx}
                      type="monotone"
                      dataKey={mapel}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Grades Table */}
          <div className="p-4 bg-white border rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-4">Nilai Semester Ini</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Mata Pelajaran</th>
                    <th className="px-4 py-2 border">Rata-rata</th>
                    <th className="px-4 py-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubjectNames.map(subject => {
                    const avg = selectedStudent[`${subject}_RataRata`];
                    const status = avg >= 75 ? 'Baik' : avg >= 60 ? 'Cukup' : 'Perlu Perbaikan';
                    const statusColor = avg >= 75 ? 'text-green-600' : avg >= 60 ? 'text-yellow-600' : 'text-red-600';
                    
                    return (
                      <tr key={subject} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{subject}</td>
                        <td className="px-4 py-2 border text-center font-semibold">{avg || '-'}</td>
                        <td className={`px-4 py-2 border text-center ${statusColor}`}>{avg ? status : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaliKelasGradeView;
