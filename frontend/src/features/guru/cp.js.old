// frontend/src/features/guru/cp.js
import React, { useState, useEffect, useCallback } from 'react';
import * as guruApi from '../../api/guru'; // Import API guru
import * as adminApi from '../../api/admin'; // Perlu getMataPelajaran dari adminApi jika guruApi tidak mengekspornya

const PenilaianCapaianPembelajaran = ({ activeTASemester, userId }) => {
  const [assignments, setAssignments] = useState([]); // Penugasan guru (kelas-mapel)
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [capaianPembelajaran, setCapaianPembelajaran] = useState([]); // CP untuk mapel terpilih
  const [siswaCapaianStatus, setSiswaCapaianStatus] = useState({}); // {siswaId_cpId: status}
  const [siswaCapaianCatatan, setSiswaCapaianCatatan] = useState({}); // {siswaId_cpId: catatan}
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const statusOptions = ['Tercapai', 'Belum Tercapai', 'Perlu Bimbingan', 'Sangat Baik'];

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
  }, [activeTASemester, userId, selectedAssignment]);

  const fetchCpsAndStudentsStatus = useCallback(async () => {
    if (selectedAssignment && activeTASemester && userId) {
      const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
      try {
        const [studentsData, cpsData, siswaCpData] = await Promise.all([
          guruApi.getStudentsInClass(kelasId, activeTASemester.id_ta_semester),
          guruApi.getCapaianPembelajaranByMapel(mapelId), // Mengambil CP berdasarkan mapel
          guruApi.getSiswaCapaianPembelajaran(userId, mapelId, kelasId, activeTASemester.id_ta_semester)
        ]);
        setStudentsInClass(studentsData);
        setCapaianPembelajaran(cpsData);

        // Inisialisasi status dan catatan siswa CP
        const initialStatus = {};
        const initialCatatan = {};
        siswaCpData.forEach(item => {
          if (item.id_cp && item.id_siswa) { // Pastikan id_cp dan id_siswa ada
            initialStatus[`${item.id_siswa}_${item.id_cp}`] = item.status_capaian || '';
            initialCatatan[`${item.id_siswa}_${item.id_cp}`] = item.catatan || '';
          }
        });
        setSiswaCapaianStatus(initialStatus);
        setSiswaCapaianCatatan(initialCatatan);

      } catch (err) {
        setError(err.message);
        setStudentsInClass([]);
        setCapaianPembelajaran([]);
        setSiswaCapaianStatus({});
        setSiswaCapaianCatatan({});
      }
    } else {
      setStudentsInClass([]);
      setCapaianPembelajaran([]);
      setSiswaCapaianStatus({});
      setSiswaCapaianCatatan({});
    }
  }, [selectedAssignment, activeTASemester, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchCpsAndStudentsStatus();
  }, [fetchCpsAndStudentsStatus]);

  const handleStatusChange = (studentId, cpId, value) => {
    setSiswaCapaianStatus(prev => ({
      ...prev,
      [`${studentId}_${cpId}`]: value
    }));
  };

  const handleCatatanChange = (studentId, cpId, value) => {
    setSiswaCapaianCatatan(prev => ({
      ...prev,
      [`${studentId}_${cpId}`]: value
    }));
  };

  const handleSubmitCapaian = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    if (!selectedAssignment || !activeTASemester || studentsInClass.length === 0 || capaianPembelajaran.length === 0) {
      setMessage('Harap pilih kelas/mapel dan pastikan ada siswa serta Capaian Pembelajaran.');
      setMessageType('error');
      return;
    }

    const [kelasId, mapelId] = selectedAssignment.split('-').map(Number);
    let successCount = 0;
    let failCount = 0;

    const cpPromises = [];
    studentsInClass.forEach(student => {
      capaianPembelajaran.forEach(cp => {
        const status = siswaCapaianStatus[`${student.id_siswa}_${cp.id_cp}`];
        const catatan = siswaCapaianCatatan[`${student.id_siswa}_${cp.id_cp}`];

        // Hanya kirim jika status telah dipilih
        if (status) {
          cpPromises.push(
            guruApi.addOrUpdateSiswaCapaianPembelajaran({
              id_siswa: student.id_siswa,
              id_cp: cp.id_cp,
              id_guru: userId,
              id_ta_semester: activeTASemester.id_ta_semester,
              status_capaian: status,
              catatan: catatan || ''
            })
            .then(() => { successCount++; })
            .catch(err => {
              console.error(`Gagal menyimpan CP untuk ${student.nama_siswa} (${cp.fase}):`, err);
              failCount++;
            })
          );
        }
      });
    });

    try {
      await Promise.all(cpPromises);
      if (successCount > 0) {
        setMessage(`Berhasil menyimpan ${successCount} Capaian Pembelajaran. ${failCount} gagal.`);
        setMessageType('success');
        fetchCpsAndStudentsStatus(); // Refresh untuk menampilkan data terbaru
      } else if (failCount > 0) {
        setMessage(`Gagal menyimpan ${failCount} Capaian Pembelajaran. Periksa konsol untuk detail.`);
        setMessageType('error');
      } else {
        setMessage('Tidak ada Capaian Pembelajaran yang diinput atau diubah.');
        setMessageType('info');
      }
    } catch (err) {
      setMessage(`Terjadi kesalahan umum saat menyimpan Capaian Pembelajaran: ${err.message}`);
      setMessageType('error');
    }
  };

  if (loading) return <p>Memuat data capaian pembelajaran...</p>;
  if (error) return <p className="message error">Error: {error}</p>;

  const currentAssignment = assignments.find(
    assign => `${assign.id_kelas}-${assign.id_mapel}` === selectedAssignment
  );

  return (
    <div className="feature-content">
      <h2>Penilaian Capaian Pembelajaran Siswa</h2>
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
          <h3>Penilaian CP untuk {currentAssignment.nama_mapel} di Kelas {currentAssignment.nama_kelas}</h3>
          {capaianPembelajaran.length > 0 && studentsInClass.length > 0 ? (
            <form onSubmit={handleSubmitCapaian} className="form-container-small">
              {/* Mengubah struktur grid */}
              <div className="grades-table-wrapper cp-table-wrapper"> {/* Wrapper baru untuk tabel grid */}
                <div className="grades-grid-header cp-grid-header"> {/* Baris header grid */}
                  <div className="grid-header-item">Nama Siswa</div>
                  {capaianPembelajaran.map(cp => (
                    <div key={cp.id_cp} className="grid-header-item cp-header">
                      {cp.fase ? `${cp.fase}: ` : ''}{cp.deskripsi_cp}
                    </div>
                  ))}
                </div>
                
                {studentsInClass.map(student => (
                  <div key={student.id_siswa} className="grades-grid-row cp-grid-row"> {/* Setiap baris siswa adalah baris grid */}
                    <div className="grid-cell-item student-name">{student.nama_siswa}</div>
                    {capaianPembelajaran.map(cp => (
                      <div key={`${student.id_siswa}-${cp.id_cp}`} className="grid-cell-item">
                        <select
                          value={siswaCapaianStatus[`${student.id_siswa}_${cp.id_cp}`] || ''}
                          onChange={(e) => handleStatusChange(student.id_siswa, cp.id_cp, e.target.value)}
                          className="cp-status-select"
                        >
                          <option value="">Pilih Status</option>
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Catatan spesifik CP"
                          value={siswaCapaianCatatan[`${student.id_siswa}_${cp.id_cp}`] || ''}
                          onChange={(e) => handleCatatanChange(student.id_siswa, cp.id_cp, e.target.value)}
                          className="cp-catatan-textarea"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div> {/* Akhir grades-table-wrapper */}
              <button type="submit" className="submit-button">Simpan Capaian Pembelajaran</button>
            </form>
          ) : (
            <p>Tidak ada siswa di kelas ini atau Capaian Pembelajaran belum terdaftar untuk mata pelajaran ini.</p>
          )}
        </>
      )}
    </div>
  );
};

export default PenilaianCapaianPembelajaran;
