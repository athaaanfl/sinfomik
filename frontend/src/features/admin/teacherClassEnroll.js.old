// frontend/src/features/admin/teacherClassEnroll.js
import React, { useState, useEffect } from 'react';
import * as adminApi from '../../api/admin';

const GuruMapelKelasAssignment = ({ activeTASemester }) => {
  const [teachers, setTeachers] = useState([]);
  const [mataPelajaran, setMataPelajaran] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedGuruId, setSelectedGuruId] = useState('');
  const [selectedMapelId, setSelectedMapelId] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [isWaliKelas, setIsWaliKelas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped', 'table' or 'card'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [isDeleteConfirmClosing, setIsDeleteConfirmClosing] = useState(false);
  const [isDetailModalClosing, setIsDetailModalClosing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teachersData, mapelData, kelasData, assignmentsData] = await Promise.all([
        adminApi.getTeachers(),
        adminApi.getMataPelajaran(),
        activeTASemester ? adminApi.getKelas(activeTASemester.id_ta_semester) : Promise.resolve([]),
        activeTASemester ? adminApi.getGuruMapelKelasAssignments(activeTASemester.id_ta_semester) : Promise.resolve([])
      ]);
      setTeachers(teachersData);
      setMataPelajaran(mapelData);
      setKelas(kelasData);
      setAssignments(assignmentsData);

      // Set default selected values if available
      if (teachersData.length > 0 && !selectedGuruId) setSelectedGuruId(teachersData[0].id_guru);
      if (mapelData.length > 0 && !selectedMapelId) setSelectedMapelId(mapelData[0].id_mapel);
      if (kelasData.length > 0 && !selectedKelasId) setSelectedKelasId(kelasData[0].id_kelas);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTASemester]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 6000);
  };

  const handleAssignGuru = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsAssigning(true);
    
    if (!activeTASemester || !selectedGuruId || !selectedMapelId || !selectedKelasId) {
      showMessage('Please complete all selections.', 'error');
      setIsAssigning(false);
      return;
    }

    try {
      const response = await adminApi.assignGuruToMapelKelas({
        id_guru: selectedGuruId,
        id_mapel: selectedMapelId,
        id_kelas: selectedKelasId,
        id_ta_semester: activeTASemester.id_ta_semester,
        is_wali_kelas: isWaliKelas
      });
      showMessage(response.message, 'success');
      setIsWaliKelas(false); // Reset checkbox after successful assignment
      fetchData();
    } catch (err) {
      showMessage(err.message, 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  // Helper functions for icons and colors
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

  const getRandomColor = (index) => {
    const colors = [
      'from-rose-400 to-pink-500',
      'from-orange-400 to-amber-500', 
      'from-emerald-400 to-cyan-500',
      'from-blue-400 to-indigo-500',
      'from-purple-400 to-violet-500',
      'from-pink-400 to-rose-500',
      'from-teal-400 to-green-500',
      'from-indigo-400 to-blue-500'
    ];
    return colors[index % colors.length];
  };

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment =>
    assignment.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group assignments by teacher
  const groupedAssignments = () => {
    const grouped = {};
    
    filteredAssignments.forEach((assignment, index) => {
      const teacherKey = assignment.id_guru; // Use teacher ID as unique key
      
      if (!grouped[teacherKey]) {
        grouped[teacherKey] = {
          teacher: {
            id_guru: assignment.id_guru,
            nama_guru: assignment.nama_guru
          },
          subjects: new Set(),
          classes: new Set(),
          assignments: [],
          isWaliKelas: false // Check if teacher is homeroom teacher
        };
      }
      
      grouped[teacherKey].subjects.add(assignment.nama_mapel);
      grouped[teacherKey].classes.add(assignment.nama_kelas);
      grouped[teacherKey].assignments.push(assignment);
      
      // Check if this teacher is wali kelas for any assignment
      if (assignment.is_wali_kelas === 1) {
        grouped[teacherKey].isWaliKelas = true;
      }
    });
    
    // Convert Sets to Arrays for rendering
    Object.keys(grouped).forEach(key => {
      grouped[key].subjects = Array.from(grouped[key].subjects);
      grouped[key].classes = Array.from(grouped[key].classes);
    });
    
    return grouped;
  };

  // Function to get subject-to-class mapping for detailed view
  const getSubjectClassMapping = (assignments) => {
    const mapping = {};
    assignments.forEach(assignment => {
      const subject = assignment.nama_mapel;
      if (!mapping[subject]) {
        mapping[subject] = [];
      }
      mapping[subject].push({
        kelas: assignment.nama_kelas,
        id_kelas: assignment.id_kelas,
        tahun_ajaran: assignment.tahun_ajaran,
        semester: assignment.semester
      });
    });
    return mapping;
  };

  // NEW: Group assignments by class (for modal display)
  const getClassSubjectMapping = (assignments) => {
    const mapping = {};
    assignments.forEach(assignment => {
      const classKey = assignment.nama_kelas;
      if (!mapping[classKey]) {
        mapping[classKey] = {
          kelas: assignment.nama_kelas,
          id_kelas: assignment.id_kelas,
          tahun_ajaran: assignment.tahun_ajaran,
          semester: assignment.semester,
          subjects: []
        };
      }
      mapping[classKey].subjects.push({
        nama_mapel: assignment.nama_mapel,
        id_mapel: assignment.id_mapel,
        assignment: assignment // Keep reference for delete functionality
      });
    });
    return mapping;
  };

  // Function to open teacher detail modal
  const openTeacherDetail = (teacherGroup) => {
    setSelectedTeacherDetail(teacherGroup);
    setShowDetailModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsDetailModalClosing(true);
    setTimeout(() => {
      setShowDetailModal(false);
      setSelectedTeacherDetail(null);
      setEditMode(false);
      setIsDetailModalClosing(false);
      closeDeleteConfirmModal();
    }, 150); // Match animation duration
  };

  // Function to close delete confirmation modal with animation
  const closeDeleteConfirmModal = () => {
    setIsDeleteConfirmClosing(true);
    setTimeout(() => {
      setShowDeleteConfirm(false);
      setAssignmentToDelete(null);
      setIsDeleteConfirmClosing(false);
    }, 150); // Match animation duration
  };

  // Function to handle delete assignment
  const handleDeleteAssignment = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteConfirm(true);
  };

  // Function to confirm delete assignment
  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      // Start closing animations immediately for smooth UX
      setIsDeleteConfirmClosing(true);
      setIsDetailModalClosing(true);
      
      // Perform delete operation
      await adminApi.deleteGuruMapelKelasAssignment(assignmentToDelete.id_guru_mapel_kelas);
      
      // Complete modal closures
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setAssignmentToDelete(null);
        setIsDeleteConfirmClosing(false);
        setShowDetailModal(false);
        setSelectedTeacherDetail(null);
        setEditMode(false);
        setIsDetailModalClosing(false);
      }, 150);
      
      // Delay data refresh to avoid white flash during modal close
      setTimeout(async () => {
        // Use a more gentle refresh without full loading state
        try {
          const assignmentsData = activeTASemester ? 
            await adminApi.getGuruMapelKelasAssignments(activeTASemester.id_ta_semester) : 
            [];
          setAssignments(assignmentsData);
          
          setMessage('Assignment berhasil dihapus.');
          setMessageType('success');
          
          // Clear success message after delay
          setTimeout(() => {
            setMessage('');
            setMessageType('');
          }, 2000);
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
        }
      }, 200);
      
    } catch (error) {
      // Complete modal closures even on error
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setAssignmentToDelete(null);
        setIsDeleteConfirmClosing(false);
        setShowDetailModal(false);
        setSelectedTeacherDetail(null);
        setEditMode(false);
        setIsDetailModalClosing(false);
      }, 150);
      
      setTimeout(() => {
        setMessage(error.response?.data?.message || 'Gagal menghapus assignment.');
        setMessageType('error');
        
        // Clear error message after delay
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }, 200);
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const selectedTeacher = teachers.find(t => t.id_guru === selectedGuruId);
  const selectedSubject = mataPelajaran.find(mp => mp.id_mapel === selectedMapelId);
  const selectedClass = kelas.find(k => k.id_kelas === selectedKelasId);

  // Check if selected class already has a wali kelas
  const currentWaliKelas = selectedClass ? assignments.find(
    a => a.id_kelas === selectedClass.id_kelas && a.is_wali_kelas === 1
  ) : null;

  // Render grouped assignments table
  const renderGroupedAssignmentsTable = () => {
    const grouped = groupedAssignments();
    
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-emerald-50 to-cyan-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Subjects</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Classes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Total Assignments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Academic Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Semester</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.values(grouped).map((group, index) => (
              <tr 
                key={group.teacher.id_guru} 
                className={`hover:bg-gray-50 transition-all duration-200 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                onClick={() => openTeacherDetail(group)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full mr-3">
                      <i className="fas fa-chalkboard-teacher text-white text-sm"></i>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{group.teacher.nama_guru}</span>
                        {group.isWaliKelas && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                            <i className="fas fa-home mr-1"></i>
                            Wali Kelas
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">ID: {group.teacher.id_guru}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {group.subjects.map((subject, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <i className={`fas ${getSubjectIcon(subject)} mr-1`}></i>
                        {subject}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {group.classes.map((kelas, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <i className="fas fa-door-open mr-1"></i>
                        {kelas}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <i className="fas fa-tasks mr-1"></i>
                    {group.assignments.length}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                  {group.assignments[0]?.tahun_ajaran}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {group.assignments[0]?.semester}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAssignmentsTable = () => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-emerald-50 to-cyan-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Teacher</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Class</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Academic Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">Semester</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAssignments.map((assign, index) => (
            <tr key={index} className={`hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full mr-3">
                    <i className="fas fa-chalkboard-teacher text-white text-sm"></i>
                  </div>
                  <span className="font-medium">{assign.nama_guru}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <div className={`bg-gradient-to-br ${getRandomColor(index)} p-2 rounded-lg mr-3`}>
                    <i className={`fas ${getSubjectIcon(assign.nama_mapel)} text-white text-sm`}></i>
                  </div>
                  <span className="font-medium">{assign.nama_mapel}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <i className="fas fa-door-open mr-1"></i>
                  {assign.nama_kelas}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{assign.tahun_ajaran}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {assign.semester}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAssignmentsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAssignments.map((assign, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className={`bg-gradient-to-r ${getRandomColor(index)} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-3">
                  <i className="fas fa-chalkboard-teacher text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg truncate">{assign.nama_guru}</h3>
                  <p className="text-white/80 text-sm">Teacher</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <div className={`bg-gradient-to-br ${getRandomColor(index + 1)} p-2 rounded-lg mr-3`}>
                  <i className={`fas ${getSubjectIcon(assign.nama_mapel)} text-white text-sm`}></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium text-gray-900">{assign.nama_mapel}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-indigo-400 to-blue-500 p-2 rounded-lg mr-3">
                  <i className="fas fa-door-open text-white text-sm"></i>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium text-gray-900">{assign.nama_kelas}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">{assign.tahun_ajaran}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {assign.semester}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render grouped assignments cards
  const renderGroupedAssignmentsCards = () => {
    const grouped = groupedAssignments();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(grouped).map((group, index) => (
          <div 
            key={group.teacher.id_guru} 
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full cursor-pointer"
            onClick={() => openTeacherDetail(group)}
          >
            <div className={`bg-gradient-to-r ${getRandomColor(index)} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <i className="fas fa-chalkboard-teacher text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-white font-semibold text-lg mr-2">{group.teacher.nama_guru}</h3>
                      {group.isWaliKelas && (
                        <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                          <i className="fas fa-home mr-1"></i>
                          Wali Kelas
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm">ID: {group.teacher.id_guru}</p>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-bold">{group.assignments.length}</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Subjects ({group.subjects.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {group.subjects.map((subject, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        <i className={`fas ${getSubjectIcon(subject)} mr-1`}></i>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Classes ({group.classes.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {group.classes.map((kelas, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                        <i className="fas fa-door-open mr-1"></i>
                        {kelas}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                <span className="text-xs text-gray-500">{group.assignments[0]?.tahun_ajaran}</span>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                    {group.assignments[0]?.semester}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center">
                    <i className="fas fa-eye mr-1"></i>
                    Click to view details
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Loading teacher assignment data...</span>
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
                  <i className="fas fa-user-tie mr-3 text-4xl"></i>
                  Teacher Assignment System
                </h1>
                <p className="text-emerald-100 mt-2">Assign teachers to subjects and classes</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-white text-sm">Total Assignments</p>
                  <p className="text-2xl font-bold text-white">{assignments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Teachers</p>
                  <p className="text-2xl font-bold">{teachers.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-chalkboard-teacher text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Subjects</p>
                  <p className="text-2xl font-bold">{mataPelajaran.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-book text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Classes</p>
                  <p className="text-2xl font-bold">{kelas.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-door-open text-2xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Assignments</p>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <i className="fas fa-tasks text-2xl"></i>
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

          {teachers.length > 0 && mataPelajaran.length > 0 && kelas.length > 0 ? (
            <div className="space-y-8">
              {/* Assignment Form */}
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-user-plus mr-3 text-emerald-500 text-3xl"></i>
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Assign Teacher
                  </span>
                </h3>

                <form onSubmit={handleAssignGuru} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Teacher Selection */}
                    <div className="relative">
                      <select 
                        value={selectedGuruId} 
                        onChange={(e) => setSelectedGuruId(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                      >
                        {teachers.map(t => (
                          <option key={t.id_guru} value={t.id_guru}>{t.nama_guru}</option>
                        ))}
                      </select>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-600 font-medium">
                        Select Teacher
                      </label>
                      <i className="fas fa-chalkboard-teacher absolute right-3 top-4 text-gray-400"></i>
                    </div>

                    {/* Subject Selection */}
                    <div className="relative">
                      <select 
                        value={selectedMapelId} 
                        onChange={(e) => setSelectedMapelId(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                      >
                        {mataPelajaran.map(mp => (
                          <option key={mp.id_mapel} value={mp.id_mapel}>{mp.nama_mapel}</option>
                        ))}
                      </select>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-600 font-medium">
                        Select Subject
                      </label>
                      <i className="fas fa-book absolute right-3 top-4 text-gray-400"></i>
                    </div>

                    {/* Class Selection */}
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
                      <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-600 font-medium">
                        Select Class
                      </label>
                      <i className="fas fa-door-open absolute right-3 top-4 text-gray-400"></i>
                    </div>
                  </div>

                  {/* Assignment Preview */}
                  {selectedTeacher && selectedSubject && selectedClass && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Assignment Preview:</h4>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-2 rounded-full mr-2">
                            <i className="fas fa-chalkboard-teacher text-white text-sm"></i>
                          </div>
                          <span className="text-sm font-medium">{selectedTeacher.nama_guru}</span>
                        </div>
                        <i className="fas fa-arrow-right text-gray-400"></i>
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-2 rounded-lg mr-2">
                            <i className={`fas ${getSubjectIcon(selectedSubject.nama_mapel)} text-white text-sm`}></i>
                          </div>
                          <span className="text-sm font-medium">{selectedSubject.nama_mapel}</span>
                        </div>
                        <i className="fas fa-arrow-right text-gray-400"></i>
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-indigo-400 to-blue-500 p-2 rounded-lg mr-2">
                            <i className="fas fa-door-open text-white text-sm"></i>
                          </div>
                          <span className="text-sm font-medium">{selectedClass.nama_kelas}</span>
                        </div>
                        {isWaliKelas && (
                          <>
                            <i className="fas fa-arrow-right text-gray-400"></i>
                            <div className="flex items-center">
                              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-lg mr-2">
                                <i className="fas fa-home text-white text-sm"></i>
                              </div>
                              <span className="text-sm font-bold text-yellow-600">Wali Kelas</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wali Kelas Checkbox */}
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isWaliKelas}
                          onChange={(e) => setIsWaliKelas(e.target.checked)}
                          className="sr-only"
                          disabled={currentWaliKelas && currentWaliKelas.id_guru !== selectedGuruId}
                        />
                        <div className={`w-14 h-7 rounded-full transition-all duration-300 ${
                          isWaliKelas 
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                            : currentWaliKelas && currentWaliKelas.id_guru !== selectedGuruId
                            ? 'bg-gray-200'
                            : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                            isWaliKelas ? 'translate-x-7' : 'translate-x-0'
                          }`}>
                            <i className={`fas ${isWaliKelas ? 'fa-check text-yellow-500' : 'fa-times text-gray-400'} text-xs flex items-center justify-center h-full`}></i>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <span className={`text-sm font-semibold transition-colors duration-200 ${
                          isWaliKelas ? 'text-yellow-700' : 'text-gray-700'
                        }`}>
                          <i className="fas fa-home mr-2"></i>
                          Set as Wali Kelas (Homeroom Teacher)
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {currentWaliKelas && currentWaliKelas.id_guru !== selectedGuruId ? (
                            <span className="text-orange-600 font-medium">
                              ⚠️ {selectedClass?.nama_kelas} already has a wali kelas: <strong>{currentWaliKelas.nama_guru}</strong>
                            </span>
                          ) : isWaliKelas ? (
                            'This teacher will be assigned as the homeroom teacher for this class'
                          ) : (
                            'Check this box to assign as homeroom teacher'
                          )}
                        </p>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!activeTASemester || isAssigning}
                    className="w-full md:w-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 font-semibold shadow-lg"
                  >
                    {isAssigning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Assigning Teacher...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus mr-3 text-lg"></i>
                        Assign Teacher
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Assignments List */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <i className="fas fa-list-check mr-3 text-emerald-500 text-3xl"></i>
                    <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      Teacher Assignments
                    </span>
                  </h3>
                  
                  <div className="flex space-x-3 mt-3 md:mt-0">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search assignments..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    </div>
                    
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => setViewMode('grouped')}
                        className={`px-3 py-1 rounded-md transition-all duration-200 ${viewMode === 'grouped' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                        title="Grouped View"
                      >
                        <i className="fas fa-users"></i>
                      </button>
                      <button 
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 rounded-md transition-all duration-200 ${viewMode === 'table' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                        title="Table View"
                      >
                        <i className="fas fa-table"></i>
                      </button>
                      <button 
                        onClick={() => setViewMode('card')}
                        className={`px-3 py-1 rounded-md transition-all duration-200 ${viewMode === 'card' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
                        title="Card View"
                      >
                        <i className="fas fa-th-large"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {filteredAssignments.length > 0 ? (
                  viewMode === 'grouped' ? renderGroupedAssignmentsCards() : 
                  viewMode === 'table' ? renderAssignmentsTable() : renderAssignmentsCards()
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                      <i className="fas fa-clipboard-list text-4xl text-gray-400"></i>
                    </div>
                    <h5 className="text-lg font-medium text-gray-700 mb-2">
                      {searchTerm ? 'No Assignments Match Search' : 'No Teacher Assignments'}
                    </h5>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `No assignments match your search for "${searchTerm}".`
                        : 'No teacher assignments are registered for the active semester.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-yellow-50 rounded-full mb-4">
                <i className="fas fa-exclamation-triangle text-4xl text-yellow-400"></i>
              </div>
              <h5 className="text-lg font-medium text-gray-700 mb-2">Missing Required Data</h5>
              <p className="text-gray-500">Make sure Teachers, Subjects, and Classes are registered and an Active Academic Year/Semester is set.</p>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Detail Modal */}
      {showDetailModal && selectedTeacherDetail && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-200 ease-in-out ${
          isDetailModalClosing ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}>
          <div className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-200 ease-out ${
            isDetailModalClosing ? 'animate-slideOutDown' : 'animate-slideInUp'
          }`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <i className="fas fa-chalkboard-teacher text-white text-2xl"></i>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-2xl font-bold text-white mr-3">{selectedTeacherDetail.teacher.nama_guru}</h2>
                      {selectedTeacherDetail.isWaliKelas && (
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                          <i className="fas fa-home mr-2"></i>
                          Wali Kelas
                        </span>
                      )}
                    </div>
                    <p className="text-white/80">Teacher ID: {selectedTeacherDetail.teacher.id_guru}</p>
                    <p className="text-white/80">Total Assignments: {selectedTeacherDetail.assignments.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={toggleEditMode}
                    className={`${editMode ? 'bg-red-400 hover:bg-red-500' : 'bg-blue-400 hover:bg-blue-500'} text-white px-3 py-1 rounded-lg transition-colors duration-200 flex items-center`}
                    title={editMode ? "Cancel Edit" : "Edit Assignments"}
                  >
                    <i className={`fas ${editMode ? 'fa-times' : 'fa-edit'} mr-1`}></i>
                    {editMode ? 'Cancel' : 'Edit'}
                  </button>
                  <button 
                    onClick={closeModal}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors duration-200"
                  >
                    <i className="fas fa-times text-white text-xl"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <i className="fas fa-list-ul mr-2 text-emerald-500"></i>
                Subject-Class Assignments
              </h3>
              
              <div className="space-y-4">
                {Object.values(getClassSubjectMapping(selectedTeacherDetail.assignments)).map((classData) => {
                  // Check if teacher is wali kelas for this class
                  const isWaliKelasForClass = classData.subjects.some(s => s.assignment.is_wali_kelas === 1);
                  
                  return (
                  <div key={classData.kelas} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center flex-1">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-lg mr-4">
                          <i className="fas fa-door-open text-white text-lg"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800 text-lg">{classData.kelas}</h4>
                            {isWaliKelasForClass && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                                <i className="fas fa-home mr-1"></i>
                                Wali Kelas
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">{classData.tahun_ajaran} - {classData.semester}</p>
                          <p className="text-gray-400 text-xs">{classData.subjects.length} subject{classData.subjects.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      {/* Remove Wali Kelas Button */}
                      {editMode && isWaliKelasForClass && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Remove ${selectedTeacherDetail.teacher.nama_guru} sebagai wali kelas dari ${classData.kelas}?`)) {
                              try {
                                await adminApi.removeWaliKelas(classData.id_kelas);
                                setMessage(`Wali kelas berhasil dihapus dari ${classData.kelas}.`);
                                setMessageType('success');
                                setTimeout(() => {
                                  setMessage('');
                                  setMessageType('');
                                  closeModal();
                                  fetchData();
                                }, 1500);
                              } catch (err) {
                                setMessage(err.message);
                                setMessageType('error');
                                setTimeout(() => {
                                  setMessage('');
                                  setMessageType('');
                                }, 3000);
                              }
                            }
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors duration-200 flex items-center text-sm"
                          title="Remove Wali Kelas"
                        >
                          <i className="fas fa-user-times mr-1"></i>
                          Remove Wali Kelas
                        </button>
                      )}
                    </div>
                    
                    {/* Subject badges */}
                    <div className="ml-16">
                      <div className="flex flex-wrap gap-2">
                        {classData.subjects.map((subjectData, idx) => (
                          <div key={idx} className="relative group">
                            <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex items-center space-x-2 hover:shadow-md transition-all duration-200">
                              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 rounded-md">
                                <i className={`fas ${getSubjectIcon(subjectData.nama_mapel)} text-white text-xs`}></i>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{subjectData.nama_mapel}</span>
                              
                              {editMode && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteAssignment(subjectData.assignment);
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  title="Delete this assignment"
                                >
                                  <i className="fas fa-trash text-xs"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Summary Statistics */}
              <div className="mt-6 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-chart-bar mr-2 text-emerald-500"></i>
                  Teaching Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-lg mb-2">
                      <i className="fas fa-book text-blue-600 text-xl"></i>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{selectedTeacherDetail.subjects.length}</p>
                    <p className="text-sm text-gray-600">Subject{selectedTeacherDetail.subjects.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-indigo-100 p-3 rounded-lg mb-2">
                      <i className="fas fa-door-open text-indigo-600 text-xl"></i>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{selectedTeacherDetail.classes.length}</p>
                    <p className="text-sm text-gray-600">Class{selectedTeacherDetail.classes.length > 1 ? 'es' : ''}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-lg mb-2">
                      <i className="fas fa-tasks text-green-600 text-xl"></i>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{selectedTeacherDetail.assignments.length}</p>
                    <p className="text-sm text-gray-600">Assignment{selectedTeacherDetail.assignments.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-lg mb-2">
                      <i className="fas fa-calendar text-purple-600 text-xl"></i>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{selectedTeacherDetail.assignments[0]?.semester}</p>
                    <p className="text-sm text-gray-600">Semester</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
              <div className="flex justify-end">
                <button 
                  onClick={closeModal}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center"
                >
                  <i className="fas fa-times mr-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && assignmentToDelete && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-all duration-300 ease-in-out ${
            isDeleteConfirmClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          style={{zIndex: 9999}}
        >
          <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${
            isDeleteConfirmClosing ? 'animate-slideOutDown' : 'animate-slideInUp'
          }`}>
            {/* Confirmation Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Confirm Delete Assignment</h2>
                  <p className="text-white/80 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Confirmation Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-3">Are you sure you want to delete this assignment?</p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Teacher:</span>
                      <p className="text-gray-800">{selectedTeacherDetail?.teacher.nama_guru}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Subject:</span>
                      <p className="text-gray-800">{assignmentToDelete.nama_mapel}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Class:</span>
                      <p className="text-gray-800">{assignmentToDelete.nama_kelas}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Semester:</span>
                      <p className="text-gray-800">{assignmentToDelete.tahun_ajaran} - {assignmentToDelete.semester}</p>
                    </div>
                  </div>
                </div>

                {message && messageType === 'error' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm flex items-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      {message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button 
                onClick={closeDeleteConfirmModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
              <button 
                onClick={confirmDeleteAssignment}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuruMapelKelasAssignment;
