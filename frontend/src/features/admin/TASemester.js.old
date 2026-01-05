// frontend/src/features/admin/TASemester.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

const TASemesterManagement = ({ activeTASemester, setActiveTASemester }) => {
  const [taSemesters, setTASemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTahunAjaran, setNewTahunAjaran] = useState('');
  const [newSemester, setNewSemester] = useState('Ganjil');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchTASemesters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTASemester();
      setTASemesters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTASemesters();
  }, []);

  const handleAddTASemester = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    
    if (!newTahunAjaran.trim()) {
      setMessage('Tahun Ajaran harus diisi');
      setMessageType('error');
      return;
    }
    
    try {
      const response = await adminApi.addTASemester(newTahunAjaran, newSemester);
      setMessage(response.message);
      setMessageType('success');
      setNewTahunAjaran('');
      setNewSemester('Ganjil');
      fetchTASemesters(); // Refresh daftar
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  const handleSetActive = async (id) => {
    setMessage('');
    setMessageType('');
    try {
      const response = await adminApi.setActiveTASemester(id);
      setMessage(response.message);
      setMessageType('success');
      // Update activeTASemester state in parent (AdminDashboardContent)
      const updatedActive = taSemesters.find(ta => ta.id_ta_semester === id);
      setActiveTASemester(updatedActive || null);
      fetchTASemesters(); // Refresh daftar untuk update status aktif
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>
            Manajemen Tahun Ajaran & Semester
          </h2>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            Aktif: <span>{activeTASemester ? `${activeTASemester.tahun_ajaran} - ${activeTASemester.semester}` : 'Tidak ada yang aktif'}</span>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg transition-all duration-300 ease-in-out ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
            {message}
          </div>
        )}

        {/* Add New Form */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <i className="fas fa-plus-circle mr-2 text-green-500"></i>
            Tambah Tahun Ajaran & Semester Baru
          </h4>
          <form onSubmit={handleAddTASemester} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-calendar text-gray-400"></i>
                  </div>
                  <input 
                    type="text" 
                    value={newTahunAjaran}
                    onChange={(e) => setNewTahunAjaran(e.target.value)}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border transition-colors duration-200" 
                    placeholder="Contoh: 2024/2025" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-book text-gray-400"></i>
                  </div>
                  <select 
                    value={newSemester} 
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border transition-colors duration-200"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <i className="fas fa-save mr-2"></i> Tambah
            </button>
          </form>
        </div>

        {/* List Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <i className="fas fa-list-alt mr-2 text-purple-500"></i>
            Daftar Tahun Ajaran & Semester
          </h4>
          
          {loading && (
            <div className="flex justify-center items-center py-8">
              <i className="fas fa-spinner animate-spin text-3xl text-blue-500"></i>
              <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>Error: {error}</span>
            </div>
          )}
          
          {!loading && !error && taSemesters.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-calendar-times text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-600">Belum ada Tahun Ajaran & Semester yang terdaftar.</p>
            </div>
          )}
          
          {!loading && !error && taSemesters.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Ajaran</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taSemesters.map((ta) => (
                    <tr key={ta.id_ta_semester} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ta.id_ta_semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ta.tahun_ajaran}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ta.semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ta.is_aktif 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ta.is_aktif ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {!ta.is_aktif && (
                          <button 
                            onClick={() => handleSetActive(ta.id_ta_semester)} 
                            className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200"
                          >
                            <i className="fas fa-check-circle mr-1"></i> Set Aktif
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TASemesterManagement;