// frontend/src/features/guru/rekapNilai.js
import React, { useState, useEffect } from 'react';
import * as guruApi from '../../api/guru';
import * as adminApi from '../../api/admin'; // Perlu getTipeNilai dari adminApi

const RekapNilai = ({ activeTASemester, userId }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [rekapNilai, setRekapNilai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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

  const fetchRekap = async () => {
    if (selectedAssignment && activeTASemester && userId) {
      const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
      try {
        const data = await guruApi.getRekapNilai(userId, mapelId, kelasId, activeTASemester.id_ta_semester);
        setRekapNilai(data);
      } catch (err) {
        setError(err.message);
        setRekapNilai([]);
      }
    } else {
      setRekapNilai([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTASemester, userId]);

  useEffect(() => {
    fetchRekap();
  }, [selectedAssignment, activeTASemester, userId]);

  if (loading) return <p>Memuat data rekap nilai...</p>;
  if (error) return <p className="message error">Error: {error}</p>;

  const currentAssignment = assignments.find(
    assign => `${assign.id_kelas}-${assign.id_mapel}` === selectedAssignment
  );

  // Mengolah data rekap untuk tampilan tabel pivot
  const processedRekap = {};
  const gradeTypes = new Set();
  rekapNilai.forEach(item => {
    if (!processedRekap[item.nama_siswa]) {
      processedRekap[item.nama_siswa] = { id_siswa: item.id_siswa, nama_siswa: item.nama_siswa };
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
    
    processedRekap[item.nama_siswa][columnName] = item.nilai;
    gradeTypes.add(columnName);
  });

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

  return (
    <div className="feature-content">
      <h2>Rekap Nilai Siswa</h2>
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
          <h3>Rekap Nilai {currentAssignment.nama_mapel} di Kelas {currentAssignment.nama_kelas}</h3>
          {rekapTableData.length > 0 ? (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama Siswa</th>
                    {uniqueGradeTypes.map(tipe => (
                      <th key={tipe}>{tipe}</th>
                    ))}
                    <th>Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {rekapTableData.map(row => {
                    // Calculate TP average
                    const tpGrades = uniqueGradeTypes
                      .filter(tipe => tipe.startsWith('TP'))
                      .map(tipe => row[tipe])
                      .filter(n => typeof n === 'number');
                    const tpAverage = tpGrades.length > 0 ? tpGrades.reduce((sum, n) => sum + n, 0) / tpGrades.length : 0;
                    
                    // Get UAS value
                    const uasValue = row['UAS'];
                    
                    // Calculate final grade (70% TP + 30% UAS)
                    let finalGrade = '-';
                    if (tpGrades.length > 0 && typeof uasValue === 'number') {
                      finalGrade = (tpAverage * 0.7 + uasValue * 0.3).toFixed(2);
                    }
                    
                    return (
                      <tr key={row.id_siswa}>
                        <td>{row.nama_siswa}</td>
                        {uniqueGradeTypes.map(tipe => (
                          <td key={tipe}>{typeof row[tipe] === 'number' ? row[tipe] : '-'}</td>
                        ))}
                        <td>{finalGrade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="calculation-info">
                <small>
                  <strong>Keterangan:</strong> Nilai Akhir = 70% rata-rata TP + 30% UAS
                </small>
              </div>
            </>
          ) : (
            <p>Belum ada nilai yang diinput untuk kombinasi ini.</p>
          )}
        </>
      )}
    </div>
  );
};

export default RekapNilai;
