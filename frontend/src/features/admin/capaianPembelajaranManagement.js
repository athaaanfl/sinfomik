// frontend/src/features/admin/capaianPembelajaranManagement.js
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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Komponen Modal ATP Viewer (dengan Edit Mode)
const AtpViewerModal = ({ id_mapel, fase, nama_mapel, onClose }) => {
  const [atpData, setAtpData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchAtpData();
  }, [id_mapel, fase]);

  const fetchAtpData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/atp/${id_mapel}/${fase}`, {
        credentials: 'include', // ✅ Send HTTP-only cookie
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const now = Date.now();
        const last = window.__lastAuthRedirect || 0;
        if (now - last > 5000) {
          window.__lastAuthRedirect = now;
          window.location.replace('/login');
        }
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch ATP data');
      }
      const data = await response.json();
      setAtpData(data.data || []);
      setEditedData(JSON.parse(JSON.stringify(data.data || [])));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (rowIndex, field, value) => {
    const newData = [...editedData];
    newData[rowIndex][field] = value;
    setEditedData(newData);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/atp/${id_mapel}/${fase}`, {
        method: 'PUT',
        credentials: 'include', // ✅ Send HTTP-only cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: editedData })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const now2 = Date.now();
        const last2 = window.__lastAuthRedirect || 0;
        if (now2 - last2 > 5000) {
          window.__lastAuthRedirect = now2;
          window.location.replace('/login');
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save changes');
      }

      const result = await response.json();
      setSaveMessage(' Changes saved successfully!');
      setAtpData([...editedData]);
      setIsEditMode(false);
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage(` Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData(JSON.parse(JSON.stringify(atpData)));
    setIsEditMode(false);
    setSaveMessage('');
  };

  const dataToDisplay = isEditMode ? editedData : atpData;
  const filteredData = dataToDisplay.filter(row => {
    const matchesSearch = Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesKelas = filterKelas === 'all' || String(row.Kelas) === filterKelas;
    const matchesSemester = filterSemester === 'all' || String(row.Semester) === filterSemester;
    return matchesSearch && matchesKelas && matchesSemester;
  }).map((row, idx) => ({ ...row, _originalIndex: dataToDisplay.indexOf(row) }));

  const uniqueKelas = [...new Set(dataToDisplay.map(row => row.Kelas).filter(Boolean))].sort();
  const uniqueSemester = [...new Set(dataToDisplay.map(row => row.Semester).filter(Boolean))].sort();

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-table'} mr-3 text-3xl`}></i>
                {isEditMode ? 'Edit ' : ''}Alur Tujuan Pembelajaran (ATP)
              </h3>
              <p className="text-blue-100 mt-2">{nama_mapel} - Fase {fase}</p>
            </div>
            <div className="flex items-center flex-wrap gap-3">
              {!isEditMode && (
                <Button
                  variant="secondary"
                  icon="edit"
                  onClick={() => setIsEditMode(true)}
                  className="bg-white/20 hover:bg-white/30"
                >
                  Edit Mode
                </Button>
              )}
              {isEditMode && (
                <>
                  <Button
                    variant="success"
                    icon={saving ? 'spinner' : 'save'}
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="danger"
                    icon="times"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              )}
              <button 
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-white/20 rounded-full"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
          </div>
          {saveMessage && (
            <StatusMessage 
              type={saveMessage.startsWith('') ? 'success' : 'error'}
              message={saveMessage}
              className="mt-3"
            />
          )}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in all columns..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <select 
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              {uniqueKelas.map((kelas, idx) => (
                <option key={`kelas-${idx}-${kelas}`} value={kelas}>Kelas {kelas}</option>
              ))}
            </select>
            <select 
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Semesters</option>
              {uniqueSemester.map((sem, idx) => (
                <option key={`semester-${idx}-${sem}`} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredData.length} of {atpData.length} rows
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && <LoadingSpinner message="Loading ATP data..." />}

          {error && (
            <StatusMessage 
              type="error"
              message={error}
              icon="exclamation-circle"
            />
          )}

          {!loading && !error && filteredData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Elemen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Capaian Pembelajaran (CP)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Tujuan Pembelajaran (TP)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">KKTP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Materi Pokok</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">Kelas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Semester</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((row, idx) => {
                    const originalIndex = row._originalIndex;
                    const uniqueKey = `row-${originalIndex}-${row.Kelas}-${row.Semester}`;
                    
                    return (
                      <tr key={uniqueKey} className={`hover:bg-blue-50 transition-colors duration-150 ${isEditMode ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">{idx + 1}</td>
                        
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          {isEditMode ? (
                            <input 
                              type="text"
                              value={row.Elemen || ''}
                              onChange={(e) => handleCellEdit(originalIndex, 'Elemen', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            row.Elemen || '-'
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 max-w-xs">
                          {isEditMode ? (
                            <textarea 
                              value={row['Capaian Pembelajaran (CP)'] || ''}
                              onChange={(e) => handleCellEdit(originalIndex, 'Capaian Pembelajaran (CP)', e.target.value)}
                              rows="3"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          ) : (
                            <div className="line-clamp-3">{row['Capaian Pembelajaran (CP)'] || '-'}</div>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 max-w-md">
                          {isEditMode ? (
                            <textarea 
                              value={row['Tujuan Pembelajaran (TP)'] || ''}
                              onChange={(e) => handleCellEdit(originalIndex, 'Tujuan Pembelajaran (TP)', e.target.value)}
                              rows="3"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          ) : (
                            <div className="line-clamp-3">{row['Tujuan Pembelajaran (TP)'] || '-'}</div>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 max-w-md">
                          {isEditMode ? (
                            <textarea 
                              value={row['Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)'] || ''}
                              onChange={(e) => handleCellEdit(originalIndex, 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)', e.target.value)}
                              rows="3"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          ) : (
                            <div className="line-clamp-3">{row['Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)'] || '-'}</div>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                          {isEditMode ? (
                            <input 
                              type="text"
                              value={row['Materi Pokok'] || ''}
                              onChange={(e) => handleCellEdit(originalIndex, 'Materi Pokok', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            row['Materi Pokok'] || '-'
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 text-center font-medium">
                          {isEditMode ? (
                            <input 
                              type="text"
                              value={row.Kelas || ''}
                              onChange={(e) => handleCellEdit(originalIndex, 'Kelas', e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                            />
                          ) : (
                            row.Kelas || '-'
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">
                          {isEditMode ? (
                            <input 
                              type="text"
                              value={row.Semester || ''}
                              onChange={(e) => handleCellEdit(originalIndex, 'Semester', e.target.value)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                            />
                          ) : (
                            row.Semester || '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && filteredData.length === 0 && (
            <EmptyState
              icon="inbox"
              title="No Data Found"
              message={
                searchTerm || filterKelas !== 'all' || filterSemester !== 'all' 
                  ? 'No ATP data matches your filter criteria.' 
                  : 'No ATP data available for this phase.'
              }
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Komponen Modal Edit Capaian Pembelajaran
const EditCapaianPembelajaranModal = ({ cp, onClose, onSave }) => {
  const [editedCp, setEditedCp] = useState({
    id_cp: cp.id_cp,
    id_mapel: cp.id_mapel,
    fase: cp.fase,
    deskripsi_cp: cp.deskripsi_cp,
    nama_mapel: cp.nama_mapel
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);
    
    try {
      const response = await adminApi.updateCapaianPembelajaran(editedCp.id_cp, {
        deskripsi_cp: editedCp.deskripsi_cp
      });
      setMessage(response.message);
      setMessageType('success');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error updating CP:', err);
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
            Edit Capaian Pembelajaran
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {message && (
          <StatusMessage 
            type={messageType}
            message={message}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label>
              <i className="fas fa-book mr-2 text-gray-500"></i>
              Subject (Cannot be changed)
            </label>
            <input
              type="text"
              value={cp.nama_mapel}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-layer-group mr-2 text-gray-500"></i>
              Phase (Cannot be changed)
            </label>
            <input
              type="text"
              value={`Fase ${cp.fase}`}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-align-left mr-2 text-gray-500"></i>
              Deskripsi Capaian Pembelajaran
            </label>
            <textarea
              name="deskripsi_cp"
              value={editedCp.deskripsi_cp}
              onChange={(e) => setEditedCp(prev => ({ ...prev, deskripsi_cp: e.target.value }))}
              required
              rows="6"
              placeholder="Masukkan deskripsi capaian pembelajaran..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              icon="save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Komponen Modal Add ATP Row Manual
const AddAtpRowModal = ({ id_mapel, fase, nama_mapel, onClose, onSave }) => {
  const [newRow, setNewRow] = useState({
    Elemen: '',
    'Capaian Pembelajaran (CP)': '',
    'Tujuan Pembelajaran (TP)': '',
    'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)': '',
    'Materi Pokok': '',
    Kelas: '',
    Semester: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setNewRow(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/atp/${id_mapel}/${fase}/add-row`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row: newRow })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const now = Date.now();
        const last = window.__lastAuthRedirect || 0;
        if (now - last > 5000) {
          window.__lastAuthRedirect = now;
          window.location.replace('/login');
        }
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add ATP row');
      }

      const result = await response.json();
      setMessage(result.message || 'ATP row berhasil ditambahkan!');
      setMessageType('success');
      
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error adding ATP row:', err);
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <i className="fas fa-plus-circle mr-3 text-3xl"></i>
                Tambah ATP Manual
              </h3>
              <p className="text-green-100 mt-2">{nama_mapel} - Fase {fase}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors duration-200 p-2 hover:bg-white/20 rounded-full"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Info Notice */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start gap-3">
              <i className="fas fa-info-circle text-blue-500 text-xl mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Auto-Create Excel</p>
                <p>Jika file Excel ATP belum ada untuk fase ini, sistem akan otomatis membuatkan file baru saat Anda menyimpan data pertama kali.</p>
              </div>
            </div>
          </div>

          {message && (
            <StatusMessage 
              type={messageType}
              message={message}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Elemen */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-cube mr-2 text-gray-500"></i>
                  Elemen
                </label>
                <input
                  type="text"
                  value={newRow.Elemen}
                  onChange={(e) => handleChange('Elemen', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: Bilangan"
                  required
                />
              </div>

              {/* Materi Pokok */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-book-open mr-2 text-gray-500"></i>
                  Materi Pokok
                </label>
                <input
                  type="text"
                  value={newRow['Materi Pokok']}
                  onChange={(e) => handleChange('Materi Pokok', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: Penjumlahan & Pengurangan"
                  required
                />
              </div>
            </div>

            {/* Capaian Pembelajaran */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-bullseye mr-2 text-gray-500"></i>
                Capaian Pembelajaran (CP)
              </label>
              <textarea
                value={newRow['Capaian Pembelajaran (CP)']}
                onChange={(e) => handleChange('Capaian Pembelajaran (CP)', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Masukkan deskripsi capaian pembelajaran..."
                required
              />
            </div>

            {/* Tujuan Pembelajaran */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-target mr-2 text-gray-500"></i>
                Tujuan Pembelajaran (TP)
              </label>
              <textarea
                value={newRow['Tujuan Pembelajaran (TP)']}
                onChange={(e) => handleChange('Tujuan Pembelajaran (TP)', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Masukkan tujuan pembelajaran..."
                required
              />
            </div>

            {/* KKTP */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-check-circle mr-2 text-gray-500"></i>
                Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
              </label>
              <textarea
                value={newRow['Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)']}
                onChange={(e) => handleChange('Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Masukkan kriteria ketercapaian..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kelas */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-users mr-2 text-gray-500"></i>
                  Kelas
                </label>
                <select
                  value={newRow.Kelas}
                  onChange={(e) => handleChange('Kelas', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {fase === 'A' && (
                    <>
                      <option value="1">Kelas 1</option>
                      <option value="2">Kelas 2</option>
                    </>
                  )}
                  {fase === 'B' && (
                    <>
                      <option value="3">Kelas 3</option>
                      <option value="4">Kelas 4</option>
                    </>
                  )}
                  {fase === 'C' && (
                    <>
                      <option value="5">Kelas 5</option>
                      <option value="6">Kelas 6</option>
                    </>
                  )}
                </select>
              </div>

              {/* Semester */}
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-calendar-alt mr-2 text-gray-500"></i>
                  Semester
                </label>
                <select
                  value={newRow.Semester}
                  onChange={(e) => handleChange('Semester', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Pilih Semester</option>
                  <option value="1">Semester 1 (Ganjil)</option>
                  <option value="2">Semester 2 (Genap)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="success"
                icon={isSubmitting ? 'spinner' : 'save'}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan ATP'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Komponen Modal Pemetaan CP Viewer (Rise Up!)
const PemetaanCpViewerModal = ({ fase, nama_mapel, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [expandedTp, setExpandedTp] = useState({});

  // Determine kelas options based on fase
  const kelasOptions = fase === 'A' ? [1, 2] : fase === 'B' ? [3, 4] : [5, 6];

  useEffect(() => {
    setSelectedKelas(String(kelasOptions[0]));
  }, [fase]);

  useEffect(() => {
    if (selectedKelas) fetchData();
  }, [selectedKelas, selectedSemester]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/pemetaan-cp/${selectedKelas}/${selectedSemester}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
        return;
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTp = (idx) => {
    setExpandedTp(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    if (!data) return;
    const all = {};
    data.elemenData.forEach((_, idx) => { all[idx] = true; });
    setExpandedTp(all);
  };

  const collapseAll = () => setExpandedTp({});

  // Group elemenData by elemen name
  const groupedByElemen = data ? data.elemenData.reduce((acc, item, idx) => {
    const key = item.elemen || 'Lainnya';
    if (!acc[key]) acc[key] = { deskripsiCp: item.deskripsiCp, items: [] };
    acc[key].items.push({ ...item, _idx: idx });
    return acc;
  }, {}) : {};

  const getElemenColor = (elemen) => {
    const lower = (elemen || '').toLowerCase();
    if (lower.includes('menyimak') || lower.includes('berbicara')) return 'blue';
    if (lower.includes('membaca') || lower.includes('memirsa')) return 'emerald';
    if (lower.includes('menulis') || lower.includes('merepresentasi') || lower.includes('mempresentasi')) return 'purple';
    return 'gray';
  };

  const getActivityBadge = (text) => {
    const match = text.match(/^\[(\w+[^\]]*)\]/i);
    if (!match) return null;
    const type = match[1].trim();
    const colors = {
      'Vocabulary': 'bg-yellow-100 text-yellow-800',
      'Listening': 'bg-blue-100 text-blue-800',
      'Reading': 'bg-green-100 text-green-800',
      'Speaking and Writing': 'bg-purple-100 text-purple-800',
      'Language': 'bg-orange-100 text-orange-800',
      'Activity': 'bg-pink-100 text-pink-800'
    };
    return { type, color: colors[type] || 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <i className="fas fa-map mr-3 text-3xl"></i>
                Pemetaan CP - Rise Up!
              </h3>
              <p className="text-teal-100 mt-1">{nama_mapel} - Fase {fase}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-teal-200 p-2 hover:bg-white/20 rounded-full transition-colors">
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:ring-2 focus:ring-white/50"
            >
              {kelasOptions.map(k => (
                <option key={k} value={k} className="text-gray-800">Kelas {k}</option>
              ))}
            </select>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:ring-2 focus:ring-white/50"
            >
              <option value="1" className="text-gray-800">Semester 1 (Unit 1-6)</option>
              <option value="2" className="text-gray-800">Semester 2 (Unit 7-12)</option>
            </select>
            <button onClick={expandAll} className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm">
              <i className="fas fa-expand-alt mr-1"></i> Expand All
            </button>
            <button onClick={collapseAll} className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm">
              <i className="fas fa-compress-alt mr-1"></i> Collapse All
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && <LoadingSpinner message="Memuat data Pemetaan CP..." />}
          {error && <StatusMessage type="error" message={error} />}

          {!loading && !error && data && (
            <div className="space-y-6">
              {/* Capaian Umum */}
              {data.capaianUmum && (
                <div className="p-4 bg-gray-50 border-l-4 border-teal-500 rounded-r-lg">
                  <h4 className="font-semibold text-gray-800 mb-1"><i className="fas fa-bullseye mr-2 text-teal-500"></i>Capaian Umum Fase {data.fase}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{data.capaianUmum}</p>
                </div>
              )}

              {/* Units overview */}
              {data.units && data.units.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.units.map(u => (
                    <span key={u.unitNumber} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200">
                      {u.unitName}
                    </span>
                  ))}
                </div>
              )}

              {/* Elemen sections */}
              {Object.entries(groupedByElemen).map(([elemenName, group]) => {
                const color = getElemenColor(elemenName);
                return (
                  <div key={elemenName} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className={`bg-${color}-50 border-b border-${color}-200 p-4`}>
                      <h4 className={`font-bold text-${color}-800 text-lg flex items-center`}>
                        <i className={`fas fa-${elemenName.toLowerCase().includes('menyimak') ? 'headphones' : elemenName.toLowerCase().includes('membaca') ? 'book-reader' : 'pen-fancy'} mr-2`}></i>
                        {elemenName}
                      </h4>
                      {group.deskripsiCp && (
                        <p className={`text-sm text-${color}-600 mt-2 leading-relaxed`}>{group.deskripsiCp}</p>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.items.map((item, tpIdx) => (
                        <div key={item._idx} className="bg-white">
                          {/* TP Header - clickable */}
                          <button
                            onClick={() => toggleTp(item._idx)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-${color}-100 text-${color}-700 flex items-center justify-center text-sm font-bold`}>
                                {tpIdx + 1}
                              </span>
                              <span className="text-sm text-gray-800 font-medium line-clamp-2">{item.tpText}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-xs text-gray-400">{item.atpPerUnit.length} unit</span>
                              <i className={`fas fa-chevron-${expandedTp[item._idx] ? 'up' : 'down'} text-gray-400`}></i>
                            </div>
                          </button>

                          {/* ATP Details - expandable */}
                          {expandedTp[item._idx] && item.atpPerUnit.length > 0 && (
                            <div className="px-4 pb-4 pt-1">
                              <div className="grid gap-3">
                                {item.atpPerUnit.map((atp, atpIdx) => (
                                  <div key={atpIdx} className="ml-11 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs font-semibold">
                                        {atp.unitName}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {atp.detail.split('\n').filter(line => line.trim()).map((line, lineIdx) => {
                                        const badge = getActivityBadge(line.trim());
                                        return (
                                          <div key={lineIdx} className="flex items-start gap-2">
                                            {badge && (
                                              <span className={`${badge.color} px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 mt-0.5`}>
                                                {badge.type}
                                              </span>
                                            )}
                                            <span className="text-sm text-gray-700 leading-relaxed">
                                              {badge ? line.trim().replace(/^\[[^\]]+\]\s*/, '') : line.trim()}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {Object.keys(groupedByElemen).length === 0 && (
                <EmptyState
                  icon="map"
                  title="Tidak Ada Data"
                  message={`Tidak ada data pemetaan CP untuk Kelas ${selectedKelas} Semester ${selectedSemester}.`}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-500">
            {data && <span>{data.totalTp} Tujuan Pembelajaran | {data.units?.length || 0} Unit</span>}
          </div>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};

// Komponen Import Pemetaan CP (Rise Up!)
const ImportPemetaanCp = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Pilih file Excel Pemetaan CP terlebih dahulu');
      setMessageType('error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/import-pemetaan-cp`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal import');
      setMessage(data.message);
      setMessageType('success');
      onImportSuccess();
      setFile(null);
      e.target.reset();
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSection
      title="Import Pemetaan CP (Rise Up! - Bahasa Inggris)"
      icon="map"
      variant="info"
    >
      <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-teal-500 text-xl flex-shrink-0 mt-0.5"></i>
          <div className="text-sm text-teal-800">
            <p className="font-semibold mb-1">Format File Pemetaan CP Rise Up!</p>
            <p>File Excel harus berisi sheet bernama <b>"Book 1"</b> sampai <b>"Book 6"</b>. Setiap Book mewakili satu kelas (Book 1 = Kelas 1, dst). Unit 1-6 = Semester 1, Unit 7-12 = Semester 2.</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-teal-700">
              <li>Book 1 &amp; 2 → Kelas 1 &amp; 2 (Fase A)</li>
              <li>Book 3 &amp; 4 → Kelas 3 &amp; 4 (Fase B)</li>
              <li>Book 5 &amp; 6 → Kelas 5 &amp; 6 (Fase C)</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
          />
          <Button
            type="submit"
            variant="info"
            icon={loading ? 'spinner' : 'upload'}
            disabled={loading}
            className="whitespace-nowrap w-full sm:w-auto"
          >
            {loading ? 'Importing...' : 'Import Pemetaan CP'}
          </Button>
        </div>
        {message && <StatusMessage type={messageType} message={message} />}
      </form>
    </FormSection>
  );
};

// Komponen Import Excel
const ImportExcel = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select an Excel file first');
      setMessageType('error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/import-cp`, {
        method: 'POST',
        credentials: 'include', // ✅ Send HTTP-only cookie
        body: formData,
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const now3 = Date.now();
        const last3 = window.__lastAuthRedirect || 0;
        if (now3 - last3 > 5000) {
          window.__lastAuthRedirect = now3;
          window.location.replace('/login');
        }
        return;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error('Failed to process server response. Please check Excel file format.');
      }
      
      if (!response.ok) throw new Error(data.message || 'Failed to import file');
      
      setMessage(data.message);
      setMessageType('success');
      onImportSuccess();
      setFile(null);
      e.target.reset();
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/ATP Math.xlsx';
    link.download = 'Template_ATP.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FormSection 
      title="Import dari Excel" 
      icon="file-excel"
      variant="warning"
    >
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-blue-500 text-xl"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">Template Excel ATP</h4>
            <p className="text-sm text-blue-800 mb-3">
              Untuk memudahkan input data ATP, silakan download template Excel berikut. 
              Pastikan format dan struktur kolom sesuai dengan template.
            </p>
            <Button
              type="button"
              variant="info"
              icon="download"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              Download Template Excel
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
          />
          <Button
            type="submit"
            variant="warning"
            icon={loading ? 'spinner' : 'upload'}
            disabled={loading}
            className="whitespace-nowrap w-full sm:w-auto"
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </div>
        
        {message && (
          <StatusMessage 
            type={messageType}
            message={message}
          />
        )}
      </form>
    </FormSection>
  );
};

const CapaianPembelajaranManagement = () => {
  const [cps, setCps] = useState([]);
  const [mataPelajaranOptions, setMataPelajaranOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCp, setNewCp] = useState({
    id_mapel: '',
    fase: 'A',
    deskripsi_cp: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCp, setSelectedCp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showAtpModal, setShowAtpModal] = useState(false);
  const [selectedAtpData, setSelectedAtpData] = useState(null);
  const [showAddAtpModal, setShowAddAtpModal] = useState(false);
  const [addAtpData, setAddAtpData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, cp: null });
  const [showPemetaanModal, setShowPemetaanModal] = useState(false);
  const [pemetaanData, setPemetaanData] = useState(null);

  const fetchCpsAndMapel = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cpsData, mapelData] = await Promise.all([
        adminApi.getCapaianPembelajaran(),
        adminApi.getMataPelajaran()
      ]);
      setCps(cpsData);
      setMataPelajaranOptions(mapelData);
      if (mapelData.length > 0 && !newCp.id_mapel) {
        setNewCp(prev => ({ ...prev, id_mapel: mapelData[0].id_mapel }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCpsAndMapel();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddCp = async (e) => {
    e.preventDefault();
    
    if (!newCp.deskripsi_cp.trim()) {
      showMessage('Deskripsi capaian pembelajaran harus diisi', 'error');
      return;
    }

    try {
      const response = await adminApi.addCapaianPembelajaran({
        id_mapel: parseInt(newCp.id_mapel),
        fase: newCp.fase,
        deskripsi_cp: newCp.deskripsi_cp
      });
      showMessage(response.message);
      setNewCp({
        id_mapel: mataPelajaranOptions.length > 0 ? mataPelajaranOptions[0].id_mapel : '',
        fase: 'A',
        deskripsi_cp: ''
      });
      fetchCpsAndMapel();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleEditClick = (cp) => {
    setSelectedCp(cp);
    setShowEditModal(true);
  };

  const handleDeleteClick = (cp) => {
    setDeleteConfirm({ show: true, cp });
  };

  const confirmDelete = async () => {
    try {
      const response = await adminApi.deleteCapaianPembelajaran(deleteConfirm.cp.id_cp);
      showMessage(response.message);
      fetchCpsAndMapel();
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      setDeleteConfirm({ show: false, cp: null });
    }
  };

  const handleViewAtpClick = (id_mapel, fase, nama_mapel) => {
    setSelectedAtpData({ id_mapel, fase, nama_mapel });
    setShowAtpModal(true);
  };

  const handleAddAtpClick = (id_mapel, fase, nama_mapel) => {
    setAddAtpData({ id_mapel, fase, nama_mapel });
    setShowAddAtpModal(true);
  };

  const handleAddAtpSuccess = () => {
    fetchCpsAndMapel();
  };

  const handleViewPemetaanCp = (fase, nama_mapel) => {
    setPemetaanData({ fase, nama_mapel });
    setShowPemetaanModal(true);
  };

  // Helper: check if a mapel is Bahasa Inggris
  const isBahasaInggris = (nama_mapel) => {
    const lower = (nama_mapel || '').toLowerCase();
    return lower.includes('inggris') || lower.includes('english');
  };

  const filteredCps = cps.filter(cp => {
    const matchesSearch = cp.deskripsi_cp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cp.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || cp.nama_mapel === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getPhaseBadgeColor = (fase) => {
    switch(fase) {
      case 'A': return 'from-blue-400 to-indigo-400';
      case 'B': return 'from-orange-400 to-red-400';
      case 'C': return 'from-purple-400 to-pink-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getPhaseIcon = (fase) => {
    switch(fase) {
      case 'A': return 'star';
      case 'B': return 'certificate';
      case 'C': return 'trophy';
      default: return 'award';
    }
  };

  // Stats
  const statsData = [
    {
      label: 'Total Capaian Pembelajaran',
      value: cps.length,
      icon: 'list-check',
      gradient: 'from-emerald-400 to-cyan-400'
    },
    {
      label: 'Fase A',
      value: cps.filter(cp => cp.fase === 'A').length,
      icon: 'star',
      gradient: 'from-blue-400 to-indigo-400'
    },
    {
      label: 'Fase B',
      value: cps.filter(cp => cp.fase === 'B').length,
      icon: 'certificate',
      gradient: 'from-orange-400 to-red-400'
    },
    {
      label: 'Fase C',
      value: cps.filter(cp => cp.fase === 'C').length,
      icon: 'trophy',
      gradient: 'from-purple-400 to-pink-400'
    }
  ];

  return (
    <ModuleContainer>
      <PageHeader
        icon="clipboard-check"
        title="Manajemen Capaian Pembelajaran"
        subtitle="Kelola capaian pembelajaran kurikulum berdasarkan fase"
        badge={`${cps.length} Total`}
        action={
          <Button
            variant="secondary"
            icon="sync-alt"
            onClick={fetchCpsAndMapel}
            title="Refresh"
          />
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsData.map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-4 sm:p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs sm:text-sm">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <i className={`fas fa-${stat.icon} text-lg sm:text-2xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <StatusMessage 
          type={messageType}
          message={message}
          className="mb-6"
        />
      )}

      {loading && <LoadingSpinner message="Memuat data capaian pembelajaran..." />}

      {error && (
        <StatusMessage 
          type="error"
          message={error}
          icon="exclamation-circle"
        />
      )}

      {!loading && !error && (
        <>
          {/* Import Excel Section */}
          <ImportExcel onImportSuccess={fetchCpsAndMapel} />

          {/* Import Pemetaan CP (Rise Up!) */}
          <ImportPemetaanCp onImportSuccess={fetchCpsAndMapel} />

          {/* Add CP Form */}
          <FormSection 
            title="Tambah Capaian Pembelajaran Baru" 
            icon="plus-circle"
            variant="success"
          >
            <form onSubmit={handleAddCp} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group">
                  <label>
                    <i className="fas fa-book mr-2 text-gray-500"></i>
                    Mata Pelajaran
                  </label>
                  <select
                    name="id_mapel"
                    value={newCp.id_mapel}
                    onChange={(e) => setNewCp({ ...newCp, id_mapel: e.target.value })}
                    required
                  >
                    <option value="">Select Subject</option>
                    {mataPelajaranOptions.map(mapel => (
                      <option key={mapel.id_mapel} value={mapel.id_mapel}>{mapel.nama_mapel}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-layer-group mr-2 text-gray-500"></i>
                    Fase
                  </label>
                  <select
                    name="fase"
                    value={newCp.fase}
                    onChange={(e) => setNewCp({ ...newCp, fase: e.target.value })}
                    required
                  >
                    <option value="A">Fase A</option>
                    <option value="B">Fase B</option>
                    <option value="C">Fase C</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-align-left mr-2 text-gray-500"></i>
                  Deskripsi Capaian Pembelajaran
                </label>
                <textarea
                  name="deskripsi_cp"
                  value={newCp.deskripsi_cp}
                  onChange={(e) => setNewCp({ ...newCp, deskripsi_cp: e.target.value })}
                  required
                  rows="4"
                  placeholder="Masukkan deskripsi capaian pembelajaran..."
                />
              </div>

              <Button
                type="submit"
                variant="success"
                icon="plus"
                className="w-full"
              >
                Tambah Capaian Pembelajaran
              </Button>
            </form>
          </FormSection>

          {/* CPs List */}
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <i className="fas fa-list-alt mr-3 text-emerald-500 text-2xl sm:text-3xl"></i>
                Direktori Capaian Pembelajaran
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari capaian pembelajaran..." 
                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Subjects</option>
                  {mataPelajaranOptions.map(mapel => (
                    <option key={mapel.id_mapel} value={mapel.nama_mapel}>{mapel.nama_mapel}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredCps.length === 0 && (
              <EmptyState
                icon="clipboard-check"
                title="Tidak Ada Capaian Pembelajaran Ditemukan"
                message={
                  searchTerm || selectedSubject !== 'all' ? 
                    'Tidak ada capaian yang sesuai dengan kriteria pencarian Anda.' : 
                    "Anda belum mendaftarkan capaian pembelajaran apapun. Klik tombol 'Tambah Capaian Pembelajaran' di atas untuk memulai."
                }
              />
            )}

            {filteredCps.length > 0 && (
              <div className="space-y-6">
                {mataPelajaranOptions
                  .filter(mapel => filteredCps.some(cp => cp.id_mapel === mapel.id_mapel))
                  .map((mapel, idx) => {
                    const cpMapel = filteredCps.filter(cp => cp.id_mapel === mapel.id_mapel);
                    
                    return (
                      <div key={mapel.id_mapel} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        <div className={`bg-gradient-to-r ${idx % 3 === 0 ? 'from-blue-400 to-indigo-400' : idx % 3 === 1 ? 'from-emerald-400 to-cyan-400' : 'from-purple-400 to-pink-400'} p-4`}>
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg sm:text-xl flex items-center">
                              <i className="fas fa-book mr-2 sm:mr-3 text-xl sm:text-2xl"></i>
                              {mapel.nama_mapel}
                            </h3>
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                              {cpMapel.length} Capaian{cpMapel.length !== 1 ? '' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 sm:p-6 space-y-4">
                          {['A', 'B', 'C'].map(fase => {
                            const cpFase = cpMapel.find(cp => cp.fase === fase);
                            
                            return (
                              <div key={`${mapel.id_mapel}-${fase}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                  <div className={`bg-gradient-to-r ${getPhaseBadgeColor(fase)} p-3 sm:p-4 rounded-lg flex-shrink-0 self-start`}>
                                    <i className={`fas fa-${getPhaseIcon(fase)} text-white text-xl sm:text-2xl`}></i>
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                                      <h4 className="font-bold text-gray-800">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r ${getPhaseBadgeColor(fase)} text-white`}>
                                          Fase {fase}
                                        </span>
                                      </h4>
                                      {cpFase && (
                                        <div className="flex flex-wrap gap-2">
                                          {isBahasaInggris(mapel.nama_mapel) && (
                                            <Button
                                              variant="info"
                                              icon="map"
                                              size="sm"
                                              onClick={() => handleViewPemetaanCp(fase, mapel.nama_mapel)}
                                            >
                                              Pemetaan CP
                                            </Button>
                                          )}
                                          <Button
                                            variant="success"
                                            icon="plus"
                                            size="sm"
                                            onClick={() => handleAddAtpClick(mapel.id_mapel, fase, mapel.nama_mapel)}
                                          >
                                            Tambah ATP Manual
                                          </Button>
                                          <Button
                                            variant="info"
                                            icon="table"
                                            size="sm"
                                            onClick={() => handleViewAtpClick(mapel.id_mapel, fase, mapel.nama_mapel)}
                                          >
                                            Lihat ATP
                                          </Button>
                                          <Button
                                            variant="primary"
                                            icon="edit"
                                            size="sm"
                                            onClick={() => handleEditClick(cpFase)}
                                          >
                                            Edit
                                          </Button>
                                          <Button
                                            variant="danger"
                                            icon="trash-alt"
                                            size="sm"
                                            onClick={() => handleDeleteClick(cpFase)}
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                    {cpFase ? (
                                      <p className="text-gray-600 text-sm leading-relaxed break-words">{cpFase.deskripsi_cp}</p>
                                    ) : (
                                      <p className="text-gray-400 italic text-sm">Tidak ada TP untuk fase ini.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCp && (
        <EditCapaianPembelajaranModal
          cp={selectedCp}
          onClose={() => setShowEditModal(false)}
          onSave={fetchCpsAndMapel}
        />
      )}

      {/* ATP Viewer Modal */}
      {showAtpModal && selectedAtpData && (
        <AtpViewerModal
          id_mapel={selectedAtpData.id_mapel}
          fase={selectedAtpData.fase}
          nama_mapel={selectedAtpData.nama_mapel}
          onClose={() => setShowAtpModal(false)}
        />
      )}

      {/* Add ATP Row Modal */}
      {showAddAtpModal && addAtpData && (
        <AddAtpRowModal
          id_mapel={addAtpData.id_mapel}
          fase={addAtpData.fase}
          nama_mapel={addAtpData.nama_mapel}
          onClose={() => setShowAddAtpModal(false)}
          onSave={handleAddAtpSuccess}
        />
      )}

      {/* Pemetaan CP Viewer Modal */}
      {showPemetaanModal && pemetaanData && (
        <PemetaanCpViewerModal
          fase={pemetaanData.fase}
          nama_mapel={pemetaanData.nama_mapel}
          onClose={() => setShowPemetaanModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Hapus Capaian Pembelajaran"
        message={`Apakah Anda yakin ingin menghapus capaian pembelajaran: "${deleteConfirm.cp?.deskripsi_cp?.substring(0, 50)}..."? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, cp: null })}
        variant="danger"
      />
    </ModuleContainer>
  );
};

export default CapaianPembelajaranManagement;
