// frontend/src/features/guru/cp.js
import React, { useState, useEffect, useCallback } from 'react';
import * as guruApi from '../../api/guru';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ModuleContainer from '../../components/ModuleContainer';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusMessage from '../../components/StatusMessage';
import EmptyState from '../../components/EmptyState';

const PenilaianCapaianPembelajaran = ({ activeTASemester, userId }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [capaianPembelajaran, setCapaianPembelajaran] = useState([]);
  const [siswaCapaianStatus, setSiswaCapaianStatus] = useState({});
  const [siswaCapaianCatatan, setSiswaCapaianCatatan] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
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
        setMessage(`Berhasil menyimpan ${successCount} Capaian Pembelajaran${failCount > 0 ? `, ${failCount} gagal` : ''}.`);
        setMessageType('success');
        fetchCpsAndStudentsStatus();
      } else if (failCount > 0) {
        setMessage(`Gagal menyimpan ${failCount} Capaian Pembelajaran. Periksa konsol untuk detail.`);
        setMessageType('error');
      } else {
        setMessage('Tidak ada Capaian Pembelajaran yang diinput atau diubah.');
        setMessageType('warning');
      }
    } catch (err) {
      setMessage(`Terjadi kesalahan umum saat menyimpan Capaian Pembelajaran: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  if (loading) return <LoadingSpinner message="Memuat data capaian pembelajaran..." />;
  if (error) return (
    <ModuleContainer>
      <StatusMessage type="error" message={error} />
    </ModuleContainer>
  );

  const currentAssignment = assignments.find(
    assign => `${assign.id_kelas}-${assign.id_mapel}` === selectedAssignment
  );

  return (
    <ModuleContainer>
      <PageHeader 
        icon="clipboard-check"
        title="Penilaian Capaian Pembelajaran"
        subtitle="Evaluasi pencapaian kompetensi siswa berdasarkan capaian pembelajaran"
        badge={activeTASemester ? activeTASemester.nama_ta_semester : null}
      />

      <StatusMessage 
        type={messageType} 
        message={message}
        onClose={clearMessage}
        autoClose={messageType === 'success'}
      />

      {!activeTASemester && (
        <StatusMessage 
          type="warning" 
          message="Tahun Ajaran & Semester aktif belum diatur. Harap hubungi Admin." 
        />
      )}

      {assignments.length > 0 ? (
        <FormSection title="Pilih Kelas dan Mata Pelajaran" icon="chalkboard-teacher">
          <div className="form-group">
            <label>
              <i className="fas fa-filter mr-2 text-gray-500"></i>
              Kelas dan Mata Pelajaran
            </label>
            <select 
              value={selectedAssignment} 
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full"
            >
              {assignments.map(assign => (
                <option key={`${assign.id_kelas}-${assign.id_mapel}`} value={`${assign.id_kelas}-${assign.id_mapel}`}>
                  {assign.nama_kelas} - {assign.nama_mapel}
                </option>
              ))}
            </select>
          </div>
        </FormSection>
      ) : (
        <EmptyState 
          icon="chalkboard-teacher"
          message="Anda belum ditugaskan mengajar mata pelajaran di kelas manapun untuk semester aktif ini."
          submessage="Silakan hubungi Admin untuk penugasan kelas dan mata pelajaran."
        />
      )}

      {currentAssignment && (
        <FormSection 
          title={`Penilaian CP: ${currentAssignment.nama_mapel} - ${currentAssignment.nama_kelas}`}
          icon="clipboard-list"
          variant="info"
        >
          {capaianPembelajaran.length > 0 && studentsInClass.length > 0 ? (
            <form onSubmit={handleSubmitCapaian} className="space-y-6">
              <div className="overflow-x-auto">
                <div className="grades-table-wrapper cp-table-wrapper">
                  <div className="grades-grid-header cp-grid-header">
                    <div className="grid-header-item sticky left-0 bg-indigo-600 z-10">
                      <i className="fas fa-user-graduate mr-2"></i>
                      Nama Siswa
                    </div>
                    {capaianPembelajaran.map(cp => (
                      <div key={cp.id_cp} className="grid-header-item cp-header">
                        <div className="font-semibold">{cp.fase || 'CP'}</div>
                        <div className="text-xs font-normal mt-1">{cp.deskripsi_cp}</div>
                      </div>
                    ))}
                  </div>
                  
                  {studentsInClass.map((student, index) => (
                    <div key={student.id_siswa} className={`grades-grid-row cp-grid-row ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="grid-cell-item student-name sticky left-0 z-10 font-medium bg-inherit">
                        <i className="fas fa-user text-indigo-500 mr-2"></i>
                        {student.nama_siswa}
                      </div>
                      {capaianPembelajaran.map(cp => (
                        <div key={`${student.id_siswa}-${cp.id_cp}`} className="grid-cell-item">
                          <select
                            value={siswaCapaianStatus[`${student.id_siswa}_${cp.id_cp}`] || ''}
                            onChange={(e) => handleStatusChange(student.id_siswa, cp.id_cp, e.target.value)}
                            className="cp-status-select mb-2"
                            disabled={isSubmitting}
                          >
                            <option value="">Pilih Status</option>
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <textarea
                            placeholder="Catatan (opsional)"
                            value={siswaCapaianCatatan[`${student.id_siswa}_${cp.id_cp}`] || ''}
                            onChange={(e) => handleCatatanChange(student.id_siswa, cp.id_cp, e.target.value)}
                            className="cp-catatan-textarea"
                            disabled={isSubmitting}
                            rows="2"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  variant="success"
                  icon="save"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Capaian Pembelajaran'}
                </Button>
              </div>
            </form>
          ) : (
            <EmptyState 
              icon="clipboard-list"
              message={capaianPembelajaran.length === 0 
                ? "Capaian Pembelajaran belum terdaftar untuk mata pelajaran ini" 
                : "Tidak ada siswa di kelas ini"}
              submessage="Silakan hubungi Admin untuk menambahkan data yang diperlukan."
            />
          )}
        </FormSection>
      )}
    </ModuleContainer>
  );
};

export default PenilaianCapaianPembelajaran;
