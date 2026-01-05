import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

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
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/excel/atp/${id_mapel}/${fase}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      // Handle 401 Unauthorized
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
      setEditedData(JSON.parse(JSON.stringify(data.data || []))); // Deep copy
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
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/excel/atp/${id_mapel}/${fase}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ data: editedData })
      });

      // Handle 401 Unauthorized
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
      setSaveMessage('✓ Changes saved successfully!');
      setAtpData([...editedData]); // Update original data
      setIsEditMode(false);
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage(`✗ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData(JSON.parse(JSON.stringify(atpData))); // Reset to original
    setIsEditMode(false);
    setSaveMessage('');
  };

  // Filter data (gunakan editedData saat edit mode, atpData saat view mode)
  const dataToDisplay = isEditMode ? editedData : atpData;
  const filteredData = dataToDisplay.filter(row => {
    const matchesSearch = Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesKelas = filterKelas === 'all' || String(row.Kelas) === filterKelas;
    const matchesSemester = filterSemester === 'all' || String(row.Semester) === filterSemester;
    return matchesSearch && matchesKelas && matchesSemester;
  }).map((row, idx) => ({ ...row, _originalIndex: dataToDisplay.indexOf(row) }));

  // Get unique values for filters
  const uniqueKelas = [...new Set(dataToDisplay.map(row => row.Kelas).filter(Boolean))].sort();
  const uniqueSemester = [...new Set(dataToDisplay.map(row => row.Semester).filter(Boolean))].sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-table'} mr-3 text-3xl`}></i>
                {isEditMode ? 'Edit ' : ''}Alur Tujuan Pembelajaran (ATP)
              </h3>
              <p className="text-blue-100 mt-2">{nama_mapel} - Fase {fase}</p>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditMode && (
                <button 
                  onClick={() => setIsEditMode(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center font-medium"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Mode
                </button>
              )}
              {isEditMode && (
                <>
                  <button 
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
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
            <div className={`mt-3 p-3 rounded-lg ${saveMessage.startsWith('✓') ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'} font-medium`}>
              {saveMessage}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 text-blue-600">
                <i className="fas fa-spinner animate-spin mr-3 text-xl"></i>
                <span className="font-medium">Loading ATP data...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2 text-xl"></i>
                <span className="font-medium">Error: {error}</span>
              </div>
            </div>
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
                    // Use pre-calculated original index from filtered data
                    const originalIndex = row._originalIndex;
                    
                    // Create unique key from row data
                    const uniqueKey = `row-${originalIndex}-${row.Kelas}-${row.Semester}`;
                    
                    return (
                      <tr key={uniqueKey} className={`hover:bg-blue-50 transition-colors duration-150 ${isEditMode ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">{idx + 1}</td>
                        
                        {/* Elemen - editable */}
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
                        
                        {/* CP - editable textarea */}
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
                        
                        {/* TP - editable textarea */}
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
                        
                        {/* KKTP - editable textarea */}
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
                        
                        {/* Materi Pokok - editable */}
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
                        
                        {/* Kelas - editable */}
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
                        
                        {/* Semester - editable */}
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
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                <i className="fas fa-inbox text-4xl text-gray-400"></i>
              </div>
              <h5 className="text-lg font-medium text-gray-700 mb-2">No Data Found</h5>
              <p className="text-gray-500">
                {searchTerm || filterKelas !== 'all' || filterSemester !== 'all' 
                  ? 'No ATP data matches your filter criteria.' 
                  : 'No ATP data available for this phase.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            Close
          </button>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const response = await adminApi.updateCapaianPembelajaran(editedCp.id_cp, {
        deskripsi_cp: editedCp.deskripsi_cp
      });
      setMessage(response.message);
      setMessageType('success');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating CP:', err);
      setMessage(err.message);
      setMessageType('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-pulse-once">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-edit mr-3 text-emerald-500 text-2xl"></i>
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Edit Learning Achievement
              </span>
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {message && (
            <div className={`p-4 mb-6 rounded-lg transition-all duration-300 ease-in-out border-l-4 ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-500 text-green-700' 
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={cp.nama_mapel}
                disabled
                className="block w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg peer"
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-gray-100 px-2">
                Subject (Cannot be changed)
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                value={`Fase ${cp.fase}`}
                disabled
                className="block w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg peer"
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-gray-100 px-2">
                Phase (Cannot be changed)
              </label>
            </div>

            <div className="relative">
              <textarea
                name="deskripsi_cp"
                value={editedCp.deskripsi_cp}
                onChange={(e) => setEditedCp(prev => ({ ...prev, deskripsi_cp: e.target.value }))}
                required
                rows="6"
                className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                placeholder=" "
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                Learning Achievement Description
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:-translate-y-0.5 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-white bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-lg hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 transform hover:-translate-y-0.5 font-medium shadow-lg flex items-center"
              >
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/excel/import-cp', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      
      // Handle 401 Unauthorized
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

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-file-excel mr-3 text-orange-500 text-2xl"></i>
        <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Import from Excel
        </span>
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-0.5 font-medium shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-upload'} mr-2`}></i>
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
        
        {message && (
          <div className={`p-4 rounded-lg transition-all duration-300 ease-in-out border-l-4 ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
            {message}
          </div>
        )}
      </form>
    </div>
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
      showMessage('Learning achievement description must be filled', 'error');
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

  const handleDeleteClick = async (id_cp, deskripsi_cp) => {
    if (window.confirm(`Are you sure you want to delete Learning Achievement: "${deskripsi_cp.substring(0, 50)}..." (ID: ${id_cp})? This action cannot be undone.`)) {
      try {
        const response = await adminApi.deleteCapaianPembelajaran(id_cp);
        showMessage(response.message);
        fetchCpsAndMapel();
      } catch (err) {
        showMessage(err.message, 'error');
      }
    }
  };

  const handleViewAtpClick = (id_mapel, fase, nama_mapel) => {
    setSelectedAtpData({ id_mapel, fase, nama_mapel });
    setShowAtpModal(true);
  };

  // Filter CPs based on search and subject
  const filteredCps = cps.filter(cp => {
    const matchesSearch = cp.deskripsi_cp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cp.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || cp.nama_mapel === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Get phase badge color
  const getPhaseBadgeColor = (fase) => {
    switch(fase) {
      case 'A': return 'from-blue-400 to-indigo-400';
      case 'B': return 'from-orange-400 to-red-400';
      case 'C': return 'from-purple-400 to-pink-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // Get phase icon
  const getPhaseIcon = (fase) => {
    switch(fase) {
      case 'A': return 'fa-star';
      case 'B': return 'fa-certificate';
      case 'C': return 'fa-trophy';
      default: return 'fa-award';
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 -m-6 mb-6 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <i className="fas fa-graduation-cap mr-3 text-4xl"></i>
                  Learning Achievement Management
                </h1>
                <p className="text-emerald-100 mt-2">Manage curriculum learning achievements by phase</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchCpsAndMapel}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Achievements</p>
                  <p className="text-2xl font-bold">{cps.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-list-check text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Phase A</p>
                  <p className="text-2xl font-bold">{cps.filter(cp => cp.fase === 'A').length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-star text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Phase B</p>
                  <p className="text-2xl font-bold">{cps.filter(cp => cp.fase === 'B').length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-certificate text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Phase C</p>
                  <p className="text-2xl font-bold">{cps.filter(cp => cp.fase === 'C').length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-trophy text-2xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 mb-6 rounded-lg transition-all duration-300 ease-in-out border-l-4 ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-500 text-green-700' 
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
              {message}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-emerald-50 text-emerald-600">
                <i className="fas fa-spinner animate-spin mr-3 text-xl"></i>
                <span className="font-medium">Loading learning achievements...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle mr-2 text-xl"></i>
                <span className="font-medium">Error: {error}</span>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Import Excel Section */}
              <ImportExcel onImportSuccess={fetchCpsAndMapel} />

              {/* Add CP Form */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-plus-circle mr-3 text-emerald-500 text-3xl"></i>
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Add New Learning Achievement
                  </span>
                </h2>
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-100">
                  <form onSubmit={handleAddCp} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <select
                          name="id_mapel"
                          value={newCp.id_mapel}
                          onChange={(e) => setNewCp({ ...newCp, id_mapel: e.target.value })}
                          required
                          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer appearance-none"
                        >
                          <option value="">Select Subject</option>
                          {mataPelajaranOptions.map(mapel => (
                            <option key={mapel.id_mapel} value={mapel.id_mapel}>{mapel.nama_mapel}</option>
                          ))}
                        </select>
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                          Subject
                        </label>
                      </div>

                      <div className="relative">
                        <select
                          name="fase"
                          value={newCp.fase}
                          onChange={(e) => setNewCp({ ...newCp, fase: e.target.value })}
                          required
                          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer appearance-none"
                        >
                          <option value="A">Phase A</option>
                          <option value="B">Phase B</option>
                          <option value="C">Phase C</option>
                        </select>
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                          Phase
                        </label>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        name="deskripsi_cp"
                        value={newCp.deskripsi_cp}
                        onChange={(e) => setNewCp({ ...newCp, deskripsi_cp: e.target.value })}
                        required
                        rows="4"
                        className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                        placeholder=" "
                      />
                      <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                        Learning Achievement Description
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center items-center py-3 px-6 rounded-lg shadow-md text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-semibold"
                    >
                      <i className="fas fa-plus mr-2 text-lg"></i>
                      Add Learning Achievement
                    </button>
                  </form>
                </div>
              </div>

              {/* CPs List */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <i className="fas fa-list-alt mr-3 text-emerald-500 text-3xl"></i>
                    <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      Learning Achievements Directory
                    </span>
                  </h2>
                  <div className="flex space-x-3 mt-3 md:mt-0">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search achievements..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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

                {filteredCps.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="inline-block p-6 bg-blue-50 rounded-full mb-4">
                      <i className="fas fa-graduation-cap text-4xl text-blue-400"></i>
                    </div>
                    <h5 className="text-lg font-medium text-gray-700 mb-2">No Learning Achievements Found</h5>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm || selectedSubject !== 'all' ? 
                        `No achievements match your search criteria.` : 
                        "You haven't registered any learning achievements yet. Click the 'Add Learning Achievement' button above to get started."}
                    </p>
                  </div>
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
                                <h3 className="text-white font-bold text-xl flex items-center">
                                  <i className="fas fa-book mr-3 text-2xl"></i>
                                  {mapel.nama_mapel}
                                </h3>
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  {cpMapel.length} Achievement{cpMapel.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                              {['A', 'B', 'C'].map(fase => {
                                const cpFase = cpMapel.find(cp => cp.fase === fase);
                                
                                return (
                                  <div key={`${mapel.id_mapel}-${fase}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start space-x-4">
                                      <div className={`bg-gradient-to-r ${getPhaseBadgeColor(fase)} p-4 rounded-lg flex-shrink-0`}>
                                        <i className={`fas ${getPhaseIcon(fase)} text-white text-2xl`}></i>
                                      </div>
                                      <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-bold text-gray-800 flex items-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getPhaseBadgeColor(fase)} text-white mr-3`}>
                                              Phase {fase}
                                            </span>
                                          </h4>
                                          {cpFase && (
                                            <div className="flex space-x-2">
                                              <button 
                                                onClick={() => handleViewAtpClick(mapel.id_mapel, fase, mapel.nama_mapel)}
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 transform hover:-translate-y-0.5"
                                              >
                                                <i className="fas fa-table mr-1"></i> View Details ATP
                                              </button>
                                              <button 
                                                onClick={() => handleEditClick(cpFase)}
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 transform hover:-translate-y-0.5"
                                              >
                                                <i className="fas fa-edit mr-1"></i> Edit
                                              </button>
                                              <button 
                                                onClick={() => handleDeleteClick(cpFase.id_cp, cpFase.deskripsi_cp)}
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 transform hover:-translate-y-0.5"
                                              >
                                                <i className="fas fa-trash-alt mr-1"></i> Delete
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        {cpFase ? (
                                          <p className="text-gray-600 text-sm leading-relaxed">{cpFase.deskripsi_cp}</p>
                                        ) : (
                                          <p className="text-gray-400 italic text-sm">No learning achievement defined for this phase yet.</p>
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
        </div>
      </div>

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
    </div>
  );
};

export default CapaianPembelajaranManagement;
