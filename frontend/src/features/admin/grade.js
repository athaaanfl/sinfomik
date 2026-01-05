// frontend/src/features/admin/grade.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

// Komponen Modal Edit Tipe Nilai
const EditTipeNilaiModal = ({ tipe, onClose, onSave }) => {
  const [editedTipe, setEditedTipe] = useState({ ...tipe });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTipe(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const response = await adminApi.updateTipeNilai(editedTipe.id_tipe_nilai, {
        nama_tipe: editedTipe.nama_tipe,
        deskripsi: editedTipe.deskripsi
      });
      setMessage(response.message);
      setMessageType('success');
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-pulse-once">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-edit mr-3 text-emerald-500 text-2xl"></i>
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Edit Grade Type
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
                value={editedTipe.id_tipe_nilai}
                disabled
                className="block w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg peer"
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-gray-100 px-2">
                Grade Type ID (Cannot be changed)
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                name="nama_tipe"
                value={editedTipe.nama_tipe}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                placeholder=" "
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                Grade Type Name
              </label>
            </div>

            <div className="relative">
              <textarea
                name="deskripsi"
                value={editedTipe.deskripsi || ''}
                onChange={handleChange}
                rows="3"
                className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer resize-none"
                placeholder=" "
              ></textarea>
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                Description (optional)
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


const TipeNilaiManagement = () => {
  const [tipeNilai, setTipeNilai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTipeName, setNewTipeName] = useState('');
  const [newTipeDescription, setNewTipeDescription] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTipe, setSelectedTipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  const fetchTipeNilai = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTipeNilai();
      setTipeNilai(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipeNilai();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddTipeNilai = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    
    if (!newTipeName.trim()) {
      showMessage('Grade type name must be filled', 'error');
      return;
    }

    try {
      const response = await adminApi.addTipeNilai({
        nama_tipe: newTipeName,
        deskripsi: newTipeDescription
      });
      showMessage(response.message);
      setNewTipeName('');
      setNewTipeDescription('');
      fetchTipeNilai();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleEditClick = (tipe) => {
    setSelectedTipe(tipe);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (id_tipe_nilai, nama_tipe) => {
    if (window.confirm(`Are you sure you want to delete grade type "${nama_tipe}" (ID: ${id_tipe_nilai})? This action cannot be undone.`)) {
      try {
        const response = await adminApi.deleteTipeNilai(id_tipe_nilai);
        showMessage(response.message);
        fetchTipeNilai();
      } catch (err) {
        showMessage(err.message, 'error');
      }
    }
  };

  // Filter grade types based on search term
  const filteredTipeNilai = tipeNilai.filter(tipe => 
    tipe.nama_tipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tipe.deskripsi && tipe.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderGradeTypesTable = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-emerald-50 to-cyan-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Grade Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTipeNilai.map((tipe, index) => (
            <tr key={tipe.id_tipe_nilai} className={`hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{tipe.id_tipe_nilai}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{tipe.nama_tipe}</td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{tipe.deskripsi || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(tipe)} 
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-edit mr-1"></i> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(tipe.id_tipe_nilai, tipe.nama_tipe)} 
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-trash-alt mr-1"></i> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGradeTypesCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTipeNilai.map((tipe) => (
        <div key={tipe.id_tipe_nilai} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-emerald-100 to-cyan-100 p-3 rounded-full mr-4">
                <i className="fas fa-graduation-cap text-emerald-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{tipe.nama_tipe}</h3>
                <p className="text-sm text-gray-500">ID: {tipe.id_tipe_nilai}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {tipe.deskripsi || 'No description available'}
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => handleEditClick(tipe)}
                className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium"
              >
                <i className="fas fa-edit mr-1"></i> Edit
              </button>
              <button 
                onClick={() => handleDeleteClick(tipe.id_tipe_nilai, tipe.nama_tipe)}
                className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium"
              >
                <i className="fas fa-trash-alt mr-1"></i> Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
                  Grade Management System
                </h1>
                <p className="text-emerald-100 mt-2">Manage grade types and assessment categories</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchTipeNilai}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
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
                <span className="font-medium">Loading grade types...</span>
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
              {/* Add Grade Type Form */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-plus-circle mr-3 text-emerald-500 text-3xl"></i>
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Add New Grade Type
                  </span>
                </h2>
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-100">
                  <form onSubmit={handleAddTipeNilai} className="max-w-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <input
                          type="text"
                          value={newTipeName}
                          onChange={(e) => setNewTipeName(e.target.value)}
                          required
                          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                          placeholder=" "
                        />
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                          Grade Type Name
                        </label>
                      </div>

                      <div className="relative">
                        <textarea
                          value={newTipeDescription}
                          onChange={(e) => setNewTipeDescription(e.target.value)}
                          rows="3"
                          className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer resize-none"
                          placeholder=" "
                        ></textarea>
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                          Description (optional)
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full md:w-auto flex justify-center items-center py-3 px-8 rounded-lg shadow-md text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-semibold"
                    >
                      <i className="fas fa-plus mr-2 text-lg"></i>
                      Add Grade Type
                    </button>
                  </form>
                </div>
              </div>

              {/* Grade Types List */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <i className="fas fa-list-alt mr-3 text-emerald-500 text-3xl"></i>
                    <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      Grade Type Directory
                    </span>
                  </h2>
                  <div className="flex space-x-3 mt-3 md:mt-0">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search grade types..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 rounded-md transition-all duration-200 ${viewMode === 'table' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                      >
                        <i className="fas fa-table"></i>
                      </button>
                      <button 
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-1 rounded-md transition-all duration-200 ${viewMode === 'card' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                      >
                        <i className="fas fa-th-large"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {filteredTipeNilai.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="inline-block p-6 bg-emerald-50 rounded-full mb-4">
                      <i className="fas fa-inbox text-4xl text-emerald-400"></i>
                    </div>
                    <h5 className="text-lg font-medium text-gray-700 mb-2">No Grade Types Found</h5>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm ? `No grade types match your search for "${searchTerm}".` : "You haven't registered any grade types yet. Click the 'Add Grade Type' button above to get started."}
                    </p>
                  </div>
                )}

                {filteredTipeNilai.length > 0 && (
                  viewMode === 'table' ? renderGradeTypesTable() : renderGradeTypesCards()
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedTipe && (
        <EditTipeNilaiModal
          tipe={selectedTipe}
          onClose={() => setShowEditModal(false)}
          onSave={fetchTipeNilai}
        />
      )}
    </div>
  );
};

export default TipeNilaiManagement;
