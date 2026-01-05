// frontend/src/features/admin/KenaikanKelas.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

const KenaikanKelas = () => {
  const [taSemesters, setTASemesters] = useState([]);
  const [fromTASemesterId, setFromTASemesterId] = useState('');
  const [toTASemesterId, setToTASemesterId] = useState('');
  const [fromKelasId, setFromKelasId] = useState('');
  const [toKelasId, setToKelasId] = useState('');
  const [kelasFrom, setKelasFrom] = useState([]);
  const [kelasTo, setKelasTo] = useState([]);
  const [studentsInFromKelas, setStudentsInFromKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const taData = await adminApi.getTASemester();
      setTASemesters(taData);
      if (taData.length > 0) {
        // Set default to the current active semester if available, otherwise first one
        const currentActive = taData.find(ta => ta.is_aktif);
        setFromTASemesterId(currentActive ? currentActive.id_ta_semester : taData[0].id_ta_semester);
        setToTASemesterId(currentActive ? currentActive.id_ta_semester : taData[0].id_ta_semester);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchKelasForSemester = async (semesterId, setKelasState) => {
    if (!semesterId) {
      setKelasState([]);
      return;
    }
    try {
      const data = await adminApi.getKelas(semesterId);
      setKelasState(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setKelasState([]);
    }
  };

  const fetchStudentsForPromotion = async () => {
    if (fromKelasId && fromTASemesterId) {
      try {
        const data = await adminApi.getSiswaInKelas(fromKelasId, fromTASemesterId);
        setStudentsInFromKelas(data);
      } catch (err) {
        console.error("Error fetching students for promotion:", err);
        setStudentsInFromKelas([]);
      }
    } else {
      setStudentsInFromKelas([]);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchKelasForSemester(fromTASemesterId, setKelasFrom);
  }, [fromTASemesterId]);

  useEffect(() => {
    // Set default fromKelasId when kelasFrom is loaded
    if (kelasFrom.length > 0 && !fromKelasId) {
        setFromKelasId(kelasFrom[0].id_kelas);
    } else if (kelasFrom.length === 0) {
        setFromKelasId(''); // Clear if no classes
    }
  }, [kelasFrom, fromKelasId]); // Add fromKelasId to dependency array

  useEffect(() => {
    fetchKelasForSemester(toTASemesterId, setKelasTo);
  }, [toTASemesterId]);

  useEffect(() => {
    // Set default toKelasId when kelasTo is loaded
    if (kelasTo.length > 0 && !toKelasId) {
        setToKelasId(kelasTo[0].id_kelas);
    } else if (kelasTo.length === 0) {
        setToKelasId(''); // Clear if no classes
    }
  }, [kelasTo, toKelasId]); // Add toKelasId to dependency array


  useEffect(() => {
    fetchStudentsForPromotion();
  }, [fromKelasId, fromTASemesterId]);

  const handlePromoteStudents = async () => {
    setMessage('');
    setMessageType('');
    if (!fromKelasId || !toKelasId || !fromTASemesterId || !toTASemesterId || studentsInFromKelas.length === 0) {
      setMessage('Harap lengkapi semua pilihan dan pastikan ada siswa di kelas asal.');
      setMessageType('error');
      return;
    }
    if (fromKelasId === toKelasId && fromTASemesterId === toTASemesterId) {
      setMessage('Kelas asal dan tujuan tidak boleh sama untuk kenaikan kelas di semester yang sama.');
      setMessageType('error');
      return;
    }

    const studentIdsToPromote = studentsInFromKelas.map(s => s.id_siswa);

    try {
      const response = await adminApi.promoteStudents(studentIdsToPromote, toKelasId, toTASemesterId);
      setMessage(response.message);
      setMessageType('success');
      fetchStudentsForPromotion(); // Refresh daftar siswa di kelas asal
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Loading class promotion data...</span>
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
                  <i className="fas fa-graduation-cap mr-3 text-4xl"></i>
                  Student Class Promotion System
                </h1>
                <p className="text-emerald-100 mt-2">Promote students to the next grade level efficiently</p>
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

          {/* Info Alert */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-8">
            <div className="flex items-start">
              <div className="bg-blue-500 p-3 rounded-full mr-4">
                <i className="fas fa-info-circle text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">About Class Promotion</h3>
                <p className="text-blue-700 mt-1">This feature helps you promote students to the next class for a new academic year/semester. Select the source class and destination class, then all students will be automatically moved.</p>
              </div>
            </div>
          </div>

          {/* Promotion Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Source Class */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-arrow-circle-right mr-2 text-orange-500 text-2xl"></i>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  From (Source)
                </span>
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <select 
                    value={fromTASemesterId} 
                    onChange={(e) => setFromTASemesterId(parseInt(e.target.value))}
                    className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 peer appearance-none"
                  >
                    {taSemesters.map(ta => (
                      <option key={ta.id_ta_semester} value={ta.id_ta_semester}>
                        {ta.tahun_ajaran} {ta.semester}
                      </option>
                    ))}
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                    Academic Year & Semester
                  </label>
                </div>

                <div className="relative">
                  <select 
                    value={fromKelasId} 
                    onChange={(e) => setFromKelasId(parseInt(e.target.value))}
                    className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 peer appearance-none"
                  >
                    {kelasFrom.map(k => (
                      <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                    ))}
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                    Source Class
                  </label>
                </div>
              </div>
            </div>

            {/* Destination Class */}
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-arrow-circle-left mr-2 text-emerald-500 text-2xl"></i>
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  To (Destination)
                </span>
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <select 
                    value={toTASemesterId} 
                    onChange={(e) => setToTASemesterId(parseInt(e.target.value))}
                    className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer appearance-none"
                  >
                    {taSemesters.map(ta => (
                      <option key={ta.id_ta_semester} value={ta.id_ta_semester}>
                        {ta.tahun_ajaran} {ta.semester}
                      </option>
                    ))}
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                    Academic Year & Semester
                  </label>
                </div>

                <div className="relative">
                  <select 
                    value={toKelasId} 
                    onChange={(e) => setToKelasId(parseInt(e.target.value))}
                    className="block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 peer appearance-none"
                  >
                    {kelasTo.map(k => (
                      <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                    ))}
                  </select>
                  <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-3 z-10 origin-[0] bg-white px-2">
                    Destination Class
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <i className="fas fa-users mr-3 text-indigo-500 text-3xl"></i>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Students in Source Class
                </span>
                {kelasFrom.find(k => k.id_kelas === fromKelasId) && (
                  <span className="ml-3 text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                    {kelasFrom.find(k => k.id_kelas === fromKelasId)?.nama_kelas}
                  </span>
                )}
              </h3>
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl px-4 py-2 text-white">
                <div className="flex items-center">
                  <i className="fas fa-user-friends mr-2"></i>
                  <span className="font-bold text-lg">{studentsInFromKelas.length}</span>
                  <span className="ml-1 text-sm">Students</span>
                </div>
              </div>
            </div>

            {studentsInFromKelas.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsInFromKelas.map((s, index) => (
                      <tr key={s.id_siswa} className={`hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.id_siswa}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-indigo-400 to-purple-500 p-2 rounded-full mr-3">
                              <i className="fas fa-user text-white text-sm"></i>
                            </div>
                            <span className="font-medium">{s.nama_siswa}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i> Ready to promote
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="inline-block p-6 bg-yellow-50 rounded-full mb-4">
                  <i className="fas fa-user-slash text-4xl text-yellow-400"></i>
                </div>
                <h5 className="text-lg font-medium text-gray-700 mb-2">No Students Found</h5>
                <p className="text-gray-500">There are no students in the selected source class.</p>
              </div>
            )}
          </div>

          {/* Promote Button */}
          <div className="flex justify-center">
            <button 
              onClick={handlePromoteStudents}
              disabled={studentsInFromKelas.length === 0 || !toKelasId}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 font-bold text-lg shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-user-graduate mr-3 text-2xl"></i>
              Promote {studentsInFromKelas.length} Student{studentsInFromKelas.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KenaikanKelas;