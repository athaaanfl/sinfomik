// frontend/src/features/admin/teacher.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

// Komponen Modal Edit Guru dengan Modern Design
const EditTeacherModal = ({ teacher, onClose, onSave }) => {
  const [editedTeacher, setEditedTeacher] = useState({ ...teacher });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const dataToUpdate = {
        username: editedTeacher.username,
        nama_guru: editedTeacher.nama_guru,
        email: editedTeacher.email,
        ...(editedTeacher.password && { password: editedTeacher.password })
      };
      
      const response = await adminApi.updateTeacher(editedTeacher.id_guru, dataToUpdate);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Edit Teacher: {teacher.nama_guru}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        {message && (
          <div className={`p-4 mb-4 rounded-lg border-l-4 transition-all duration-300 ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID (cannot be changed):</label>
            <input 
              type="text" 
              value={editedTeacher.id_guru} 
              disabled 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
          
          <div className="relative">
            <input
              type="text"
              name="username"
              value={editedTeacher.username}
              onChange={handleChange}
              required
              className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
              Username
            </label>
          </div>
          
          <div className="relative">
            <input
              type="text"
              name="nama_guru"
              value={editedTeacher.nama_guru}
              onChange={handleChange}
              required
              className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
              Full Name
            </label>
          </div>
          
          <div className="relative">
            <input
              type="email"
              name="email"
              value={editedTeacher.email || ''}
              onChange={handleChange}
              className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
              Email (optional)
            </label>
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={editedTeacher.password || ''}
              onChange={handleChange}
              className="block w-full px-4 py-3 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
              placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
              New Password (leave blank to keep current)
            </label>
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 py-3 px-4 rounded-lg shadow-md text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold"
            >
              Save Changes
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const GuruManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTeacher, setNewTeacher] = useState({
    username: '',
    password: '',
    nama_guru: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const response = await adminApi.addTeacher(newTeacher);
      setMessage(response.message);
      setMessageType('success');
      setNewTeacher({
        username: '',
        password: '',
        nama_guru: '',
        email: ''
      });
      fetchTeachers();
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (id_guru, nama_guru) => {
    if (window.confirm(`Are you sure you want to delete teacher ${nama_guru} (ID: ${id_guru})? This action cannot be undone.`)) {
      try {
        const response = await adminApi.deleteTeacher(id_guru);
        showMessage(response.message);
        fetchTeachers();
      } catch (err) {
        setMessage(err.message);
        setMessageType('error');
      }
    }
  };

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher => 
    teacher.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderTeachersTable = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-emerald-50 to-cyan-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTeachers.map((teacher, index) => (
            <tr key={teacher.id_guru} className={`hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{teacher.id_guru}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{teacher.nama_guru}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(teacher)} 
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <i class="fas fa-edit mr-1"></i> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(teacher.id_guru, teacher.nama_guru)} 
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <i class="fas fa-trash-alt mr-1"></i> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTeachersCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTeachers.map((teacher) => (
        <div key={teacher.id_guru} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-emerald-100 to-cyan-100 p-3 rounded-full mr-4">
                <i className="fas fa-user-tie text-emerald-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{teacher.nama_guru}</h3>
                <p className="text-sm text-gray-500">ID: {teacher.id_guru}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p className="flex items-center">
                <i className="fas fa-user mr-2 text-emerald-400"></i>
                {teacher.username}
              </p>
              <p className="flex items-center">
                <i className="fas fa-envelope mr-2 text-emerald-400"></i>
                {teacher.email || 'No email'}
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => handleEditClick(teacher)}
                className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium"
              >
                <i className="fas fa-edit mr-1"></i> Edit
              </button>
              <button 
                onClick={() => handleDeleteClick(teacher.id_guru, teacher.nama_guru)}
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-chalkboard-teacher mr-3 text-emerald-600 text-4xl"></i>
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Teacher Management System
              </span>
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={fetchTeachers}
                className="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors duration-200"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
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

          {/* Add Teacher Form */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-100">
              <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <i className="fas fa-user-plus mr-2 text-emerald-600 text-2xl"></i>
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Register New Teacher
                </span>
              </h4>
              <form onSubmit={handleAddTeacher} className="max-w-md space-y-5">
                <div className="relative">
                  <input
                    type="text"
                    value={newTeacher.username}
                    onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                    required
                    className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Username
                  </label>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                    required
                    className="block w-full px-4 py-3 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={newTeacher.nama_guru}
                    onChange={(e) => setNewTeacher({ ...newTeacher, nama_guru: e.target.value })}
                    required
                    className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Full Name
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer"
                    placeholder=" "
                  />
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-emerald-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3 peer-focus:scale-75 peer-focus:-translate-y-4">
                    Email (optional)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-6 rounded-lg shadow-md text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-semibold"
                >
                  <i className="fas fa-user-plus mr-2 text-lg"></i>
                  Register Teacher
                </button>
              </form>
            </div>
          </div>

          {/* Teachers List */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-700 flex items-center">
                <i className="fas fa-users mr-2 text-emerald-600 text-2xl"></i>
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Teacher Directory
                </span>
              </h4>
              <div className="flex space-x-3 mt-3 md:mt-0">
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search teachers..." 
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

            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-600">
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  Loading teacher data...
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle mr-2 text-xl"></i>
                  <span className="font-medium">Error: {error}</span>
                </div>
              </div>
            )}

            {!loading && !error && filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block p-6 bg-emerald-50 rounded-full mb-4">
                  <i className="fas fa-user-graduate text-4xl text-emerald-400"></i>
                </div>
                <h5 className="text-lg font-medium text-gray-700 mb-2">No Teachers Found</h5>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm ? `No teachers match your search for "${searchTerm}".` : "You haven't registered any teachers yet. Click the 'Register Teacher' button above to get started."}
                </p>
              </div>
            )}

            {!loading && !error && filteredTeachers.length > 0 && (
              viewMode === 'table' ? renderTeachersTable() : renderTeachersCards()
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedTeacher && (
        <EditTeacherModal
          teacher={selectedTeacher}
          onClose={() => setShowEditModal(false)}
          onSave={fetchTeachers} // Panggil fetchTeachers setelah simpan
        />
      )}
    </div>
  );
};

export default GuruManagement;
