// frontend/src/features/admin/gradeManagement.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';
import * as guruApi from '../../api/guru'; // Untuk mendapatkan daftar guru

// Komponen Modal Pengajuan Perubahan Nilai
const RequestGradeChangeModal = ({ grade, onClose, onSave, adminId, teachers }) => {
  const [newGradeValue, setNewGradeValue] = useState(grade.nilai);
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [selectedGuruApproverId, setSelectedGuruApproverId] = useState(grade.id_guru); // Default ke guru pemilik nilai
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!selectedGuruApproverId) {
      setMessage('Harap pilih guru penyetuju.');
      setMessageType('error');
      return;
    }

    try {
      const requestData = {
        id_nilai: grade.id_nilai,
        id_admin_requestor: adminId,
        id_guru_approver: parseInt(selectedGuruApproverId),
        nilai_lama: grade.nilai,
        nilai_baru: parseFloat(newGradeValue),
        catatan_admin: catatanAdmin
      };
      
      const response = await adminApi.createGradeChangeRequest(requestData);
      setMessage(response.message);
      setMessageType('success');
      onSave(); // Refresh daftar nilai di parent
      // onClose(); // Tutup modal setelah berhasil diajukan
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Ajukan Perubahan Nilai</h3>
        {message && <div className={`message ${messageType}`}>{message}</div>}
        <form onSubmit={handleSubmit} className="form-container-small">
          <div className="form-group">
            <label>Siswa:</label>
            <input type="text" value={grade.nama_siswa} disabled />
          </div>
          <div className="form-group">
            <label>Mata Pelajaran:</label>
            <input type="text" value={grade.nama_mapel} disabled />
          </div>
          <div className="form-group">
            <label>Tipe Nilai:</label>
            <input type="text" value={grade.nama_tipe} disabled />
          </div>
          <div className="form-group">
            <label>Nilai Lama:</label>
            <input type="text" value={grade.nilai} disabled />
          </div>
          <div className="form-group">
            <label>Nilai Baru:</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={newGradeValue}
              onChange={(e) => setNewGradeValue(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Guru Penyetuju:</label>
            <select
              value={selectedGuruApproverId}
              onChange={(e) => setSelectedGuruApproverId(e.target.value)}
              required
            >
              <option value="">Pilih Guru</option>
              {teachers.map(teacher => (
                <option key={teacher.id_guru} value={teacher.id_guru}>
                  {teacher.nama_guru} ({teacher.username})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Catatan Admin (Alasan Perubahan):</label>
            <textarea
              value={catatanAdmin}
              onChange={(e) => setCatatanAdmin(e.target.value)}
              placeholder="Jelaskan mengapa nilai perlu diubah..."
            ></textarea>
          </div>
          <div className="modal-actions">
            <button type="submit" className="submit-button">Ajukan Perubahan</button>
            <button type="button" onClick={onClose} className="cancel-button">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const GradeManagementAdmin = ({ adminId }) => { // Terima adminId dari DashboardPage
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]); // Untuk daftar guru penyetuju
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const fetchGradesAndTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gradesData, teachersData] = await Promise.all([
        adminApi.getAllGrades(),
        adminApi.getTeachers() // Mengambil daftar guru
      ]);
      setGrades(gradesData);
      setTeachers(teachersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradesAndTeachers();
  }, []);

  const handleRequestChangeClick = (grade) => {
    setSelectedGrade(grade);
    setShowRequestModal(true);
  };

  if (loading) return <p>Memuat nilai siswa...</p>;
  if (error) return <p className="message error">Error: {error}</p>;

  return (
    <div className="feature-content">
      <h2>Manajemen Nilai Siswa</h2>
      {message && <div className={`message ${messageType}`}>{message}</div>}

      <h4>Daftar Semua Nilai Siswa</h4>
      {grades.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Nilai</th>
              <th>Siswa</th>
              <th>Guru</th>
              <th>Mata Pelajaran</th>
              <th>Kelas</th>
              <th>Tipe</th>
              <th>Nilai</th>
              <th>Tgl Input</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id_nilai}>
                <td>{grade.id_nilai}</td>
                <td>{grade.nama_siswa}</td>
                <td>{grade.nama_guru}</td>
                <td>{grade.nama_mapel}</td>
                <td>{grade.nama_kelas} ({grade.tahun_ajaran} {grade.semester})</td>
                <td>{grade.nama_tipe}</td>
                <td>{grade.nilai}</td>
                <td>{grade.tanggal_input}</td>
                <td>{grade.keterangan || '-'}</td>
                <td>
                  <button onClick={() => handleRequestChangeClick(grade)} className="action-button edit-button">Ajukan Perubahan</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Belum ada nilai yang diinput oleh guru.</p>
      )}

      {showRequestModal && selectedGrade && (
        <RequestGradeChangeModal
          grade={selectedGrade}
          onClose={() => setShowRequestModal(false)}
          onSave={fetchGradesAndTeachers}
          adminId={adminId}
          teachers={teachers}
        />
      )}
    </div>
  );
};

export default GradeManagementAdmin;
