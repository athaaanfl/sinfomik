// frontend/src/features/admin/studentClassEnroll.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

const SiswaKelasAssignment = ({ activeTASemester }) => {
  const [students, setStudents] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]); // Array of student IDs
  const [studentsInSelectedKelas, setStudentsInSelectedKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsData, kelasData] = await Promise.all([
        adminApi.getStudents(),
        activeTASemester ? adminApi.getKelas(activeTASemester.id_ta_semester) : Promise.resolve([])
      ]);
      setStudents(studentsData);
      setKelas(kelasData);
      if (kelasData.length > 0 && !selectedKelasId) {
        setSelectedKelasId(kelasData[0].id_kelas);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsInKelas = async (kelasId, taSemesterId) => {
    if (!kelasId || !taSemesterId) {
      setStudentsInSelectedKelas([]);
      return;
    }
    try {
      const data = await adminApi.getSiswaInKelas(kelasId, taSemesterId);
      setStudentsInSelectedKelas(data);
    } catch (err) {
      console.error("Error fetching students in class:", err);
      setStudentsInSelectedKelas([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTASemester]);

  useEffect(() => {
    fetchStudentsInKelas(selectedKelasId, activeTASemester?.id_ta_semester);
  }, [selectedKelasId, activeTASemester, students]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 6000);
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents(prevSelected => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter(id => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredAvailableStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredAvailableStudents.map(s => s.id_siswa));
    }
  };

  const handleAssignStudents = async () => {
    setMessage('');
    setMessageType('');
    setIsAssigning(true);
    
    if (!selectedKelasId || !activeTASemester || selectedStudents.length === 0) {
      showMessage('Please select a class and at least one student.', 'error');
      setIsAssigning(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;

    const assignmentPromises = selectedStudents.map(studentId => {
      return adminApi.assignSiswaToKelas({
        id_siswa: studentId,
        id_kelas: selectedKelasId,
        id_ta_semester: activeTASemester.id_ta_semester
      })
      .then(() => {
        successCount++;
      })
      .catch(err => {
        console.error(`Failed to assign student ${studentId}:`, err);
        failCount++;
      });
    });

    try {
      await Promise.all(assignmentPromises);

      if (successCount > 0) {
        showMessage(`Successfully assigned ${successCount} students to the class. ${failCount} failed or already enrolled.`, 'success');
        setSelectedStudents([]);
        fetchStudentsInKelas(selectedKelasId, activeTASemester.id_ta_semester);
      } else if (failCount > 0) {
        showMessage(`Failed to assign ${failCount} students. They might already be enrolled or there was an error.`, 'error');
      } else {
        showMessage('No students were assigned.', 'warning');
      }
    } catch (err) {
      showMessage(`General error during assignment: ${err.message}`, 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveStudent = async (id_siswa, nama_siswa) => {
    if (!window.confirm(`Are you sure you want to remove "${nama_siswa}" from this class?\n\nThis action will:\n• Remove student from class roster\n• Keep all existing grades\n• Student can be re-enrolled later`)) {
      return;
    }

    setMessage('');
    setMessageType('');

    try {
      await adminApi.unassignSiswaFromKelas({
        id_siswa: id_siswa,
        id_kelas: selectedKelasId,
        id_ta_semester: activeTASemester.id_ta_semester
      });

      showMessage(`Successfully removed "${nama_siswa}" from class.`, 'success');
      fetchStudentsInKelas(selectedKelasId, activeTASemester.id_ta_semester);
    } catch (err) {
      showMessage(`Failed to remove student: ${err.message}`, 'error');
    }
  };

  const availableStudents = students.filter(s =>
    !studentsInSelectedKelas.some(sisInKelas => sisInKelas.id_siswa === s.id_siswa)
  );

  const filteredAvailableStudents = availableStudents.filter(student =>
    student.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClass = kelas.find(k => k.id_kelas === selectedKelasId);

  const renderStudentCard = (student, isSelected) => (
    <div 
      key={student.id_siswa}
      className={`relative bg-white rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
          : 'border-gray-200 hover:border-emerald-300'
      }`}
      onClick={() => handleCheckboxChange(student.id_siswa)}
    >
      <div className="flex items-center space-x-3">
        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
          isSelected 
            ? 'bg-emerald-500 text-white' 
            : 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white'
        }`}>
          {isSelected ? (
            <i className="fas fa-check text-sm"></i>
          ) : (
            <i className="fas fa-user text-sm"></i>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{student.nama_siswa}</h4>
          <p className="text-xs text-gray-500">ID: {student.id_siswa}</p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <i className="fas fa-check text-white text-xs"></i>
          </div>
        </div>
      )}
    </div>
  );

  const renderStudentList = (student, isSelected) => (
    <div 
      key={student.id_siswa}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
      }`}
      onClick={() => handleCheckboxChange(student.id_siswa)}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        isSelected 
          ? 'bg-emerald-500 text-white' 
          : 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white'
      }`}>
        {isSelected ? (
          <i className="fas fa-check text-xs"></i>
        ) : (
          <i className="fas fa-user text-xs"></i>
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">{student.nama_siswa}</h4>
        <p className="text-xs text-gray-500">Student ID: {student.id_siswa}</p>
      </div>
      {isSelected && (
        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <i className="fas fa-check text-white text-xs"></i>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Loading class enrollment data...</span>
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
                  <i className="fas fa-users-class mr-3 text-4xl"></i>
                  Student Class Enrollment
                </h1>
                <p className="text-emerald-100 mt-2">Assign students to classes for the active academic term</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white text-sm">Selected Students</p>
                  <p className="text-2xl font-bold text-white">{selectedStudents.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 mb-6 rounded-lg transition-all duration-300 ease-in-out border-l-4 ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-500 text-green-700' 
                : messageType === 'error'
                ? 'bg-red-50 border-red-500 text-red-700'
                : messageType === 'warning'
                ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                : 'bg-blue-50 border-blue-500 text-blue-700'
            }`}>
              <i className={`fas ${
                messageType === 'success' ? 'fa-check-circle' : 
                messageType === 'error' ? 'fa-exclamation-circle' :
                messageType === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
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

          {kelas.length > 0 ? (
            <div className="space-y-8">
              {/* Class Selection */}
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-door-open mr-3 text-emerald-500 text-2xl"></i>
                  Select Target Class
                </h3>
                <div className="relative">
                  <select 
                    value={selectedKelasId} 
                    onChange={(e) => setSelectedKelasId(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                  >
                    {kelas.map(k => (
                      <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-4 text-gray-400"></i>
                </div>
              </div>

              {/* Current Students in Class */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-users mr-3 text-indigo-500 text-2xl"></i>
                  Students in {selectedClass?.nama_kelas || 'Selected Class'}
                  <span className="ml-2 bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-sm">
                    {studentsInSelectedKelas.length}
                  </span>
                </h3>
                
                {studentsInSelectedKelas.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Student ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {studentsInSelectedKelas.map((s, index) => (
                            <tr key={s.id_siswa} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{s.id_siswa}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-2 rounded-full mr-3">
                                    <i className="fas fa-user text-white text-xs"></i>
                                  </div>
                                  <span className="font-medium">{s.nama_siswa}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Enrolled
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleRemoveStudent(s.id_siswa, s.nama_siswa)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                  <i className="fas fa-user-minus mr-1"></i> Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                      <i className="fas fa-user-slash text-4xl text-gray-400"></i>
                    </div>
                    <h5 className="text-lg font-medium text-gray-700 mb-2">No Students Enrolled</h5>
                    <p className="text-gray-500">This class has no students enrolled for the active semester.</p>
                  </div>
                )}
              </div>

              {/* Add Students Section */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <i className="fas fa-user-plus mr-3 text-violet-500 text-2xl"></i>
                    Add Students to Class
                    <span className="ml-2 bg-violet-100 text-violet-600 px-2 py-1 rounded-full text-sm">
                      {filteredAvailableStudents.length} available
                    </span>
                  </h3>
                  
                  <div className="flex space-x-3 mt-3 md:mt-0">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search students..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                      >
                        <i className="fas fa-list"></i>
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                      >
                        <i className="fas fa-th"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {filteredAvailableStudents.length > 0 ? (
                  <div className="space-y-6">
                    {/* Select All & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={handleSelectAll}
                          className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedStudents.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0
                              ? 'bg-emerald-500 border-emerald-500' 
                              : selectedStudents.length > 0
                              ? 'bg-emerald-200 border-emerald-400'
                              : 'border-gray-300'
                          }`}>
                            {selectedStudents.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0 ? (
                              <i className="fas fa-check text-white text-xs"></i>
                            ) : selectedStudents.length > 0 ? (
                              <i className="fas fa-minus text-emerald-600 text-xs"></i>
                            ) : null}
                          </div>
                          <span className="font-medium">
                            {selectedStudents.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0
                              ? 'Deselect All' 
                              : 'Select All'}
                          </span>
                        </button>
                        <span className="text-sm text-gray-600">
                          {selectedStudents.length} of {filteredAvailableStudents.length} selected
                        </span>
                      </div>
                      
                      <button 
                        onClick={handleAssignStudents}
                        disabled={!activeTASemester || selectedStudents.length === 0 || isAssigning}
                        className="mt-3 sm:mt-0 flex items-center px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 font-medium"
                      >
                        {isAssigning ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Assigning...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus mr-2"></i>
                            Assign {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Students Display */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAvailableStudents.map(student => 
                          renderStudentCard(student, selectedStudents.includes(student.id_siswa))
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredAvailableStudents.map(student => 
                          renderStudentList(student, selectedStudents.includes(student.id_siswa))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                      <i className="fas fa-user-check text-4xl text-gray-400"></i>
                    </div>
                    <h5 className="text-lg font-medium text-gray-700 mb-2">
                      {searchTerm ? 'No Students Match Search' : 'All Students Enrolled'}
                    </h5>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `No available students match your search for "${searchTerm}".`
                        : 'All students are already enrolled in this class or no students are available.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-yellow-50 rounded-full mb-4">
                <i className="fas fa-door-closed text-4xl text-yellow-400"></i>
              </div>
              <h5 className="text-lg font-medium text-gray-700 mb-2">No Classes Available</h5>
              <p className="text-gray-500">No classes are registered for the active academic term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiswaKelasAssignment;
