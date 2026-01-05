// frontend/src/features/admin/course.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';
import Button from '../../components/Button';
import Table from '../../components/Table';
import ModuleContainer from '../../components/ModuleContainer';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusMessage from '../../components/StatusMessage';
import EmptyState from '../../components/EmptyState';

// Komponen Modal Edit Mata Pelajaran
const EditMataPelajaranModal = ({ mapel, onClose, onSave }) => {
  const [editedMapelName, setEditedMapelName] = useState(mapel.nama_mapel);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);

    try {
      const response = await adminApi.updateMataPelajaran(mapel.id_mapel, editedMapelName);
      setMessage(response.message);
      setMessageType('success');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slideInUp">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-edit text-emerald-600"></i>
            Edit Mata Pelajaran: {mapel.nama_mapel}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label>
              <i className="fas fa-hashtag mr-2 text-gray-500"></i>
              ID Mata Pelajaran - Tidak dapat diubah
            </label>
            <input
              type="text"
              value={mapel.id_mapel}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-book mr-2 text-gray-500"></i>
              Nama Mata Pelajaran
            </label>
            <input
              type="text"
              value={editedMapelName}
              onChange={(e) => setEditedMapelName(e.target.value)}
              required
              placeholder="Contoh: Matematika"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="success"
              icon="save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MataPelajaranManagement = () => {
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMapelName, setNewMapelName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, mapel: null });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMataPelajaran = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getMataPelajaran();
      setMataPelajaran(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMataPelajaran();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddMataPelajaran = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    
    if (!newMapelName.trim()) {
      showMessage('Nama mata pelajaran harus diisi', 'error');
      return;
    }

    try {
      const response = await adminApi.addMataPelajaran(newMapelName);
      showMessage(response.message);
      setNewMapelName('');
      fetchMataPelajaran();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleEditClick = (mapel) => {
    setSelectedMapel(mapel);
    setShowEditModal(true);
  };

  const handleDeleteClick = (mapel) => {
    setDeleteConfirm({ show: true, mapel });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.mapel) return;
    
    setMessage('');
    setMessageType('');
    try {
      const response = await adminApi.deleteMataPelajaran(deleteConfirm.mapel.id_mapel);
      showMessage(response.message);
      fetchMataPelajaran();
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      setDeleteConfirm({ show: false, mapel: null });
    }
  };

  // Filter subjects based on search term
  const filteredMataPelajaran = mataPelajaran.filter(mapel => 
    mapel.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapel.id_mapel.toString().includes(searchTerm)
  );

  // Subject categories with icons for better visualization
  const getSubjectIcon = (namaMapel) => {
    const subject = namaMapel.toLowerCase();
    if (subject.includes('math') || subject.includes('matematika')) return 'calculator';
    if (subject.includes('science') || subject.includes('ipa') || subject.includes('fisika') || subject.includes('kimia') || subject.includes('biologi')) return 'flask';
    if (subject.includes('english') || subject.includes('bahasa')) return 'language';
    if (subject.includes('history') || subject.includes('sejarah')) return 'landmark';
    if (subject.includes('geography') || subject.includes('geografi')) return 'globe';
    if (subject.includes('art') || subject.includes('seni')) return 'palette';
    if (subject.includes('sport') || subject.includes('olahraga') || subject.includes('penjaskes')) return 'running';
    if (subject.includes('computer') || subject.includes('tik') || subject.includes('komputer')) return 'laptop';
    if (subject.includes('religion') || subject.includes('agama')) return 'pray';
    return 'book';
  };

  const getSubjectColor = (index) => {
    const colors = [
      'bg-emerald-100 text-emerald-800',
      'bg-blue-100 text-blue-800', 
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-yellow-100 text-yellow-800',
      'bg-green-100 text-green-800',
      'bg-teal-100 text-teal-800',
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[index % colors.length];
  };

  return (
    <ModuleContainer>
      <PageHeader
        icon="book-open"
        title="Manajemen Mata Pelajaran"
        subtitle="Kelola mata pelajaran, tambah mapel baru, dan update informasi kurikulum"
        badge={`${mataPelajaran.length} Mata Pelajaran`}
      />

      <StatusMessage
        type={messageType}
        message={message}
        onClose={() => setMessage('')}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Mata Pelajaran</p>
              <p className="text-3xl font-bold">{mataPelajaran.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <i className="fas fa-book text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Mapel Aktif</p>
              <p className="text-3xl font-bold">{mataPelajaran.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <i className="fas fa-chalkboard-teacher text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Kategori</p>
              <p className="text-3xl font-bold">Academic</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <i className="fas fa-tags text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <FormSection
        title="Tambah Mata Pelajaran Baru"
        icon="plus-circle"
        variant="success"
      >
        <form onSubmit={handleAddMataPelajaran} className="max-w-md space-y-4">
          <div className="form-group">
            <label>
              <i className="fas fa-book mr-2 text-gray-500"></i>
              Nama Mata Pelajaran
            </label>
            <input
              type="text"
              value={newMapelName}
              onChange={(e) => setNewMapelName(e.target.value)}
              required
              placeholder="Contoh: Matematika, Bahasa Indonesia, IPA"
            />
          </div>
          <Button
            type="submit"
            variant="success"
            icon="plus"
            fullWidth
          >
            Tambah Mata Pelajaran
          </Button>
        </form>
      </FormSection>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <i className="fas fa-list mr-2 text-indigo-600"></i>
            Daftar Mata Pelajaran
          </h2>
          <div className="mt-3 md:mt-0">
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari mata pelajaran..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full md:w-64"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
        </div>

        {loading && <LoadingSpinner text="Memuat data mata pelajaran..." />}
        
        {error && (
          <StatusMessage type="error" message={`Error: ${error}`} autoClose={false} />
        )}

        {!loading && !error && filteredMataPelajaran.length === 0 && (
          <EmptyState
            icon="book-open"
            title="Tidak Ada Mata Pelajaran"
            message={searchTerm 
              ? `Tidak ada mata pelajaran yang cocok dengan pencarian "${searchTerm}".`
              : "Belum ada mata pelajaran yang terdaftar. Klik tombol 'Tambah Mata Pelajaran' untuk memulai."
            }
          />
        )}

        {!loading && !error && filteredMataPelajaran.length > 0 && (
          <Table
            columns={[
              { 
                key: 'id_mapel', 
                label: 'ID', 
                sortable: true,
                render: (value) => (
                  <span className="font-mono font-semibold text-gray-900">{value}</span>
                )
              },
              { 
                key: 'nama_mapel', 
                label: 'Nama Mata Pelajaran', 
                sortable: true,
                render: (value, row, index) => (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getSubjectColor(index)}`}>
                      <i className={`fas fa-${getSubjectIcon(value)}`}></i>
                    </div>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                )
              },
              { 
                key: 'category', 
                label: 'Kategori', 
                sortable: false,
                render: (_, row, index) => (
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSubjectColor(index)}`}>
                    <i className="fas fa-graduation-cap mr-1"></i>
                    Academic
                  </span>
                )
              }
            ]}
            data={filteredMataPelajaran}
            emptyMessage="Belum ada mata pelajaran terdaftar"
            actions={(mapel) => (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon="edit"
                  onClick={() => handleEditClick(mapel)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon="trash-alt"
                  onClick={() => handleDeleteClick(mapel)}
                >
                  Hapus
                </Button>
              </div>
            )}
          />
        )}
      </div>

      {showEditModal && selectedMapel && (
        <EditMataPelajaranModal
          mapel={selectedMapel}
          onClose={() => setShowEditModal(false)}
          onSave={fetchMataPelajaran}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${deleteConfirm.mapel?.nama_mapel}" (ID: ${deleteConfirm.mapel?.id_mapel})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, mapel: null })}
      />
    </ModuleContainer>
  );
};

export default MataPelajaranManagement;
