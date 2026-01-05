// frontend/src/features/admin/course.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

// Komponen Modal Edit Mata Pelajaran
const EditMataPelajaranModal = ({ mapel, onClose, onSave }) => {
  const [editedMapelName, setEditedMapelName] = useState(mapel.nama_mapel);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const response = await adminApi.updateMataPelajaran(mapel.id_mapel, editedMapelName);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-pulse-once">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-edit mr-3 text-emerald-500 text-2xl"></i>
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Edit Subject
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
                value={mapel.id_mapel}
                disabled
                className="block w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg peer"
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-gray-100 px-2">
                Subject ID (Cannot be changed)
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                name="nama_mapel"
                value={editedMapelName}
                onChange={(e) => setEditedMapelName(e.target.value)}
                required
                className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                placeholder=" "
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                Subject Name
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


const MataPelajaranManagement = () => {
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMapelName, setNewMapelName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMapel, setSelectedMapel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

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
      showMessage('Subject name must be filled', 'error');
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

  const handleDeleteClick = async (id_mapel, nama_mapel) => {
    if (window.confirm(`Are you sure you want to delete subject "${nama_mapel}" (ID: ${id_mapel})? This action cannot be undone.`)) {
      try {
        const response = await adminApi.deleteMataPelajaran(id_mapel);
        showMessage(response.message);
        fetchMataPelajaran();
      } catch (err) {
        showMessage(err.message, 'error');
      }
    }
  };

  // Filter subjects based on search term
  const filteredMataPelajaran = mataPelajaran.filter(mapel => 
    mapel.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Subject categories with icons for better visualization
  const getSubjectIcon = (namaMapel) => {
    const subject = namaMapel.toLowerCase();
    if (subject.includes('math') || subject.includes('matematika')) return 'fa-calculator';
    if (subject.includes('science') || subject.includes('ipa') || subject.includes('fisika') || subject.includes('kimia') || subject.includes('biologi')) return 'fa-flask';
    if (subject.includes('english') || subject.includes('bahasa')) return 'fa-language';
    if (subject.includes('history') || subject.includes('sejarah')) return 'fa-landmark';
    if (subject.includes('geography') || subject.includes('geografi')) return 'fa-globe';
    if (subject.includes('art') || subject.includes('seni')) return 'fa-palette';
    if (subject.includes('sport') || subject.includes('olahraga') || subject.includes('penjaskes')) return 'fa-running';
    if (subject.includes('computer') || subject.includes('tik') || subject.includes('komputer')) return 'fa-laptop';
    if (subject.includes('religion') || subject.includes('agama')) return 'fa-pray';
    return 'fa-book';
  };

  const getSubjectColor = (index) => {
    const colors = [
      'from-emerald-400 to-cyan-400',
      'from-blue-400 to-indigo-400', 
      'from-purple-400 to-pink-400',
      'from-orange-400 to-red-400',
      'from-yellow-400 to-orange-400',
      'from-green-400 to-emerald-400',
      'from-teal-400 to-cyan-400',
      'from-indigo-400 to-purple-400'
    ];
    return colors[index % colors.length];
  };

  const renderSubjectsTable = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-emerald-50 to-cyan-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Subject Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredMataPelajaran.map((mapel, index) => (
            <tr key={mapel.id_mapel} className={`hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{mapel.id_mapel}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <div className={`bg-gradient-to-r ${getSubjectColor(index)} p-2 rounded-lg mr-3`}>
                    <i className={`fas ${getSubjectIcon(mapel.nama_mapel)} text-white text-sm`}></i>
                  </div>
                  <span className="font-medium">{mapel.nama_mapel}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getSubjectColor(index)} text-white`}>
                  Academic Subject
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(mapel)} 
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-edit mr-1"></i> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(mapel.id_mapel, mapel.nama_mapel)} 
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

  const renderSubjectsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredMataPelajaran.map((mapel, index) => (
        <div key={mapel.id_mapel} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className={`bg-gradient-to-r ${getSubjectColor(index)} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-3">
                  <i className={`fas ${getSubjectIcon(mapel.nama_mapel)} text-white text-xl`}></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg truncate">{mapel.nama_mapel}</h3>
                  <p className="text-white/80 text-sm">ID: {mapel.id_mapel}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <i className="fas fa-graduation-cap mr-1"></i>
                Academic Subject
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEditClick(mapel)}
                className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium"
              >
                <i className="fas fa-edit mr-1"></i> Edit
              </button>
              <button 
                onClick={() => handleDeleteClick(mapel.id_mapel, mapel.nama_mapel)}
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
                  <i className="fas fa-book-open mr-3 text-4xl"></i>
                  Subject Management System
                </h1>
                <p className="text-emerald-100 mt-2">Manage academic subjects and curriculum</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchMataPelajaran}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Subjects</p>
                  <p className="text-2xl font-bold">{mataPelajaran.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-book text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Courses</p>
                  <p className="text-2xl font-bold">{mataPelajaran.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-chalkboard-teacher text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Categories</p>
                  <p className="text-2xl font-bold">Academic</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-tags text-2xl"></i>
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
                <span className="font-medium">Loading subjects...</span>
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
              {/* Add Subject Form */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-plus-circle mr-3 text-emerald-500 text-3xl"></i>
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Add New Subject
                  </span>
                </h2>
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-100">
                  <form onSubmit={handleAddMataPelajaran} className="max-w-md space-y-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={newMapelName}
                        onChange={(e) => setNewMapelName(e.target.value)}
                        required
                        className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                        placeholder=" "
                      />
                      <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                        Subject Name
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center items-center py-3 px-6 rounded-lg shadow-md text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-semibold"
                    >
                      <i className="fas fa-plus mr-2 text-lg"></i>
                      Add Subject
                    </button>
                  </form>
                </div>
              </div>

              {/* Subjects List */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <i className="fas fa-list-alt mr-3 text-cyan-500 text-3xl"></i>
                    <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                      Subject Directory
                    </span>
                  </h2>
                  <div className="flex space-x-3 mt-3 md:mt-0">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search subjects..." 
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

                {filteredMataPelajaran.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="inline-block p-6 bg-emerald-50 rounded-full mb-4">
                      <i className="fas fa-book-open text-4xl text-emerald-400"></i>
                    </div>
                    <h5 className="text-lg font-medium text-gray-700 mb-2">No Subjects Found</h5>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchTerm ? `No subjects match your search for "${searchTerm}".` : "You haven't registered any subjects yet. Click the 'Add Subject' button above to get started."}
                    </p>
                  </div>
                )}

                {filteredMataPelajaran.length > 0 && (
                  viewMode === 'table' ? renderSubjectsTable() : renderSubjectsCards()
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedMapel && (
        <EditMataPelajaranModal
          mapel={selectedMapel}
          onClose={() => setShowEditModal(false)}
          onSave={fetchMataPelajaran}
        />
      )}
    </div>
  );
};

export default MataPelajaranManagement;
