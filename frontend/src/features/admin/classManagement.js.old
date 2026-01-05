// frontend/src/features/admin/classManagement.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

// Komponen Modal Edit Kelas dengan Modern Tailwind Design
const EditKelasModal = ({ kelas, onClose, onSave, teachers }) => {
  const [editedKelas, setEditedKelas] = useState({ ...kelas });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedKelas(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const dataToUpdate = {
        nama_kelas: editedKelas.nama_kelas,
        id_wali_kelas: editedKelas.id_wali_kelas || null,
      };
      
      const response = await adminApi.updateKelas(editedKelas.id_kelas, dataToUpdate);
      setMessage(response.message);
      setMessageType('success');
      
      // Show success message then close modal after delay
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
                Edit Class
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
                value={editedKelas.id_kelas}
                disabled
                className="block w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg peer"
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-gray-100 px-2">
                Class ID (Cannot be changed)
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                name="nama_kelas"
                value={editedKelas.nama_kelas}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                placeholder=" "
              />
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                Class Name
              </label>
            </div>

            <div className="relative">
              <select
                name="id_wali_kelas"
                value={editedKelas.id_wali_kelas || ''}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer appearance-none"
              >
                <option value="">Select Homeroom Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id_guru} value={teacher.id_guru}>{teacher.nama_guru}</option>
                ))}
              </select>
              <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                Homeroom Teacher
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

const KelasManagement = ({ activeTASemester }) => {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newKelasName, setNewKelasName] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedWaliKelas, setSelectedWaliKelas] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');

  const fetchKelasAndTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTASemester) {
        const kelasData = await adminApi.getKelas(activeTASemester.id_ta_semester);
        setKelas(kelasData);
      } else {
        setKelas([]);
      }
      const teachersData = await adminApi.getTeachers();
      setTeachers(teachersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKelasAndTeachers();
  }, [activeTASemester]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddKelas = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    
    if (!activeTASemester) {
      showMessage('Harap atur Tahun Ajaran & Semester aktif terlebih dahulu.', 'error');
      return;
    }

    const waliKelasId = selectedWaliKelas ? teachers.find(t => t.nama_guru === selectedWaliKelas)?.id_guru : null;

    try {
      const response = await adminApi.addKelas({
        nama_kelas: newKelasName,
        id_wali_kelas: waliKelasId,
        id_ta_semester: activeTASemester.id_ta_semester
      });
      showMessage(response.message, 'success');
      setNewKelasName('');
      setSelectedWaliKelas('');
      fetchKelasAndTeachers();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleEditClick = (kelas) => {
    setSelectedKelas(kelas);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (id_kelas, nama_kelas) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kelas ${nama_kelas} (ID: ${id_kelas})? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const response = await adminApi.deleteKelas(id_kelas);
        showMessage(response.message, 'success');
        fetchKelasAndTeachers();
      } catch (err) {
        showMessage(err.message, 'error');
      }
    }
  };

  // Filter and search functionality
  const filteredKelas = kelas.filter(k => {
    const matchesSearch = k.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (k.wali_kelas && k.wali_kelas.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSemester = filterSemester === 'all' || k.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  // Calculate stats
  const totalClasses = kelas.length;
  const classesWithTeachers = kelas.filter(k => k.wali_kelas).length;
  const classesWithoutTeachers = totalClasses - classesWithTeachers;

  // Get current time
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Loading class data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2 text-xl"></i>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 -m-6 mb-6 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <i className="fas fa-chalkboard-teacher mr-3 text-4xl"></i>
                  Class Management System
                </h1>
                <p className="text-emerald-100 mt-2">Manage classes and homeroom teachers efficiently</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchKelasAndTeachers}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 mb-6 rounded-lg border-l-4 flex items-center transition-all duration-300 relative overflow-hidden ${
              messageType === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-700' 
                : messageType === 'error'
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 text-red-700'
                : messageType === 'warning'
                ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500 text-yellow-700'
                : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 text-blue-700'
            }`}>
              <i className={`fas ${
                messageType === 'success' ? 'fa-check-circle' : 
                messageType === 'error' ? 'fa-exclamation-circle' :
                messageType === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
              } mr-2`}></i>
              {message}
            </div>
          )}

          {/* Active Semester Info */}
          {activeTASemester ? (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200 mb-6">
              <div className="flex items-center">
                <div className="bg-indigo-500 p-3 rounded-full mr-4">
                  <i className="fas fa-calendar-alt text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Active Academic Term</h3>
                  <p className="text-indigo-600 font-medium">{activeTASemester.tahun_ajaran} - {activeTASemester.semester}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle mr-2 text-xl"></i>
                <span className="font-medium">Please set an active Academic Year & Semester first.</span>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Classes</p>
                  <p className="text-2xl font-bold">{totalClasses}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-school text-2xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">With Homeroom Teacher</p>
                  <p className="text-2xl font-bold">{classesWithTeachers}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-user-tie text-2xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Without Teacher</p>
                  <p className="text-2xl font-bold">{classesWithoutTeachers}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-exclamation-circle text-2xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Add New Class Form */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-plus-circle mr-3 text-emerald-500 text-3xl"></i>
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Add New Class
              </span>
            </h2>
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-100">
              <form onSubmit={handleAddKelas} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={newKelasName}
                      onChange={(e) => setNewKelasName(e.target.value)}
                      required
                      className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                      placeholder=" "
                    />
                    <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                      Class Name
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select 
                      value={selectedWaliKelas} 
                      onChange={(e) => setSelectedWaliKelas(e.target.value)}
                      className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer appearance-none"
                    >
                      <option value="">Select Homeroom Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id_guru} value={teacher.nama_guru}>{teacher.nama_guru}</option>
                      ))}
                    </select>
                    <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                      Homeroom Teacher
                    </label>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!activeTASemester}
                  className="w-full md:w-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 font-semibold shadow-lg"
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Add Class
                </button>
              </form>
            </div>
          </div>

          {/* Class List */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <i className="fas fa-list-alt mr-3 text-cyan-500 text-3xl"></i>
                <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  Class Directory
                </span>
              </h2>
              
              <div className="flex space-x-3 mt-3 md:mt-0">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search classes..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>
            </div>
            
            {filteredKelas.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-emerald-50 to-cyan-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Class Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Homeroom Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Academic Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredKelas.map((k, index) => (
                      <tr key={k.id_kelas} className={`hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{k.id_kelas}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{k.nama_kelas}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {k.wali_kelas ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className="fas fa-user-tie mr-1"></i> {k.wali_kelas}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <i className="fas fa-exclamation-circle mr-1"></i> No teacher assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{k.tahun_ajaran}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {k.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditClick(k)} 
                              className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                              <i className="fas fa-edit mr-1"></i> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(k.id_kelas, k.nama_kelas)} 
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
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="inline-block p-6 bg-emerald-50 rounded-full mb-4">
                  <i className="fas fa-school text-4xl text-emerald-400"></i>
                </div>
                <h5 className="text-lg font-medium text-gray-700 mb-2">
                  {searchTerm ? 'No Classes Match Search' : 'No Classes Found'}
                </h5>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `No classes match your search for "${searchTerm}".`
                    : 'No classes are registered for the active academic term.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedKelas && (
        <EditKelasModal
          kelas={selectedKelas}
          onClose={() => setShowEditModal(false)}
          onSave={fetchKelasAndTeachers}
          teachers={teachers}
        />
      )}
    </div>
  );
};

export default KelasManagement;