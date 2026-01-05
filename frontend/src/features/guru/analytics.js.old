// frontend/src/features/guru/analytics.js
import React, { useState, useEffect } from 'react';
import { fetchGuruAnalytics, fetchStudentAnalytics } from '../../api/analytics';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ALLOWED_MAPEL_WALI, SCHOOL_CLASSES, normalizeName } from '../../config/constants';

const GuruAnalytics = ({ idGuru }) => {
    const [activeTab, setActiveTab] = useState('subject'); // 'subject', 'student'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Subject analytics state
    const [guruData, setGuruData] = useState([]);
    const [mataPelajaranList, setMataPelajaranList] = useState([]);
    const [selectedMapel, setSelectedMapel] = useState('all');
    const [selectedKelas, setSelectedKelas] = useState('all');
    const [kelasList, setKelasList] = useState([]);

    // Student analytics state
    const [studentId, setStudentId] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [selectedMapelStudent, setSelectedMapelStudent] = useState('all');

    // Extract unique mapel and kelas from guru data
    useEffect(() => {
        if (guruData.length > 0) {
            // Build unique lists
            const mapelMap = new Map();
            guruData.forEach(item => {
                if (!mapelMap.has(item.id_mapel)) {
                    mapelMap.set(item.id_mapel, { id: item.id_mapel, nama: item.nama_mapel });
                }
            });
            const kelasMap = new Map();
            guruData.forEach(item => {
                if (!kelasMap.has(item.id_kelas)) {
                    kelasMap.set(item.id_kelas, { id: item.id_kelas, nama: item.nama_kelas });
                }
            });

            const uniqueMapel = Array.from(mapelMap.values());
            const uniqueKelas = Array.from(kelasMap.values());

            // Apply school-level filters
            const allowedMapelSet = new Set(ALLOWED_MAPEL_WALI.map(normalizeName));
            const allowedClassSet = new Set(SCHOOL_CLASSES.map(normalizeName));

            const filteredMapel = uniqueMapel.filter(m => allowedMapelSet.has(normalizeName(m.nama)));
            const filteredKelas = uniqueKelas.filter(k => allowedClassSet.has(normalizeName(k.nama)));

            setMataPelajaranList(filteredMapel);
            setKelasList(filteredKelas);
        }
    }, [guruData]);

    // Auto-load guru data on mount
    useEffect(() => {
        if (idGuru) {
            loadGuruAnalytics();
        }
    }, [idGuru]);

    // Reload when filters change
    useEffect(() => {
        if (idGuru && activeTab === 'subject') {
            loadGuruAnalytics();
        }
    }, [selectedMapel, selectedKelas]);

    const loadGuruAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (selectedMapel && selectedMapel !== 'all') params.id_mapel = selectedMapel;
            if (selectedKelas && selectedKelas !== 'all') params.id_kelas = selectedKelas;

            const result = await fetchGuruAnalytics(idGuru, params);
            setGuruData(result.data || []);
        } catch (err) {
            setError('Gagal memuat data analytics guru');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentAnalytics = async () => {
        if (!studentId) {
            setError('Masukkan ID Siswa');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params = (selectedMapelStudent && selectedMapelStudent !== 'all') ? { id_mapel: selectedMapelStudent } : {};
            const result = await fetchStudentAnalytics(studentId, params);
            setStudentData(result);
        } catch (err) {
            setError('Gagal memuat data analytics siswa');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const prepareChartData = (data) => {
        if (!data || data.length === 0) return [];

        const grouped = data.reduce((acc, item) => {
            const key = `${item.tahun_ajaran} ${item.semester}`;
            if (!acc[key]) {
                acc[key] = {
                    period: key,
                    tahun_ajaran: item.tahun_ajaran,
                    semester: item.semester
                };
            }
            
            const label = item.nama_kelas ? 
                `${item.nama_mapel} - ${item.nama_kelas}` : 
                item.nama_mapel;
            
            acc[key][label] = item.rata_rata_kelas || item.rata_keseluruhan;
            return acc;
        }, {});

        return Object.values(grouped);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Analytics Dashboard - Guru</h2>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('subject')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'subject'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📚 Mata Pelajaran Saya
                    </button>
                    <button
                        onClick={() => setActiveTab('student')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'student'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        👤 Progress Siswa
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Subject Analytics Tab */}
            {activeTab === 'subject' && (
                <div>
                    <div className="mb-4 flex gap-4 items-center">
                        <select
                            value={selectedMapel}
                            onChange={(e) => setSelectedMapel(e.target.value)}
                            className="px-4 py-2 border rounded"
                        >
                            <option value="all">📚 Semua Mata Pelajaran</option>
                            {mataPelajaranList.map((mapel, idx) => (
                                <option key={idx} value={mapel.id}>{mapel.nama}</option>
                            ))}
                        </select>
                        <select
                            value={selectedKelas}
                            onChange={(e) => setSelectedKelas(e.target.value)}
                            className="px-4 py-2 border rounded"
                        >
                            <option value="all">🏫 Semua Kelas</option>
                            {kelasList.map((kelas, idx) => (
                                <option key={idx} value={kelas.id}>{kelas.nama}</option>
                            ))}
                        </select>
                        <button
                            onClick={loadGuruAnalytics}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {loading ? 'Loading...' : 'Refresh Data'}
                        </button>
                    </div>

                    {guruData.length > 0 ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                                    <p className="text-sm text-gray-600">Total Kelas Diajar</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {new Set(guruData.map(d => d.id_kelas)).size}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 border border-green-200 rounded">
                                    <p className="text-sm text-gray-600">Rata-rata Tertinggi</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {Math.max(...guruData.map(d => d.rata_rata_kelas || 0)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                                    <p className="text-sm text-gray-600">Total Siswa</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {guruData.reduce((sum, d) => sum + (d.jumlah_siswa || 0), 0)}
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Trend Nilai Kelas yang Diajar</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={prepareChartData(guruData)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
                                        <YAxis domain={[0, 100]} label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Legend />
                                        {guruData.length > 0 && Object.keys(prepareChartData(guruData)[0] || {})
                                            .filter(key => key !== 'period' && key !== 'tahun_ajaran' && key !== 'semester')
                                            .map((key, idx) => (
                                                <Bar
                                                    key={idx}
                                                    dataKey={key}
                                                    fill={`hsl(${idx * 60}, 70%, 50%)`}
                                                />
                                            ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detail Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border">Mata Pelajaran</th>
                                            <th className="px-4 py-2 border">Kelas</th>
                                            <th className="px-4 py-2 border">Periode</th>
                                            <th className="px-4 py-2 border">Rata-rata Kelas</th>
                                            <th className="px-4 py-2 border">Jumlah Siswa</th>
                                            <th className="px-4 py-2 border">Terendah</th>
                                            <th className="px-4 py-2 border">Tertinggi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {guruData.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 border">{item.nama_mapel}</td>
                                                <td className="px-4 py-2 border">{item.nama_kelas}</td>
                                                <td className="px-4 py-2 border">
                                                    {item.tahun_ajaran} {item.semester}
                                                </td>
                                                <td className="px-4 py-2 border font-semibold">
                                                    {item.rata_rata_kelas || '-'}
                                                </td>
                                                <td className="px-4 py-2 border">{item.jumlah_siswa || 0}</td>
                                                <td className="px-4 py-2 border text-red-600">
                                                    {item.nilai_terendah || '-'}
                                                </td>
                                                <td className="px-4 py-2 border text-green-600">
                                                    {item.nilai_tertinggi || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Belum ada data analytics untuk mata pelajaran yang Anda ajar.</p>
                            <p className="text-sm mt-2">Silakan input nilai terlebih dahulu.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Student Analytics Tab */}
            {activeTab === 'student' && (
                <div>
                    <div className="mb-4 flex gap-4 items-center">
                        <input
                            type="number"
                            placeholder="Masukkan ID Siswa"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="px-4 py-2 border rounded"
                        />
                        <select
                            value={selectedMapelStudent}
                            onChange={(e) => setSelectedMapelStudent(e.target.value)}
                            className="px-4 py-2 border rounded"
                        >
                            <option value="all">📚 Semua Mata Pelajaran</option>
                            {mataPelajaranList.map((mapel, idx) => (
                                <option key={idx} value={mapel.id}>{mapel.nama}</option>
                            ))}
                        </select>
                        <button
                            onClick={loadStudentAnalytics}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {loading ? 'Loading...' : 'Lihat Progress'}
                        </button>
                    </div>

                    {studentData && (
                        <>
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                                <h3 className="font-semibold text-lg">{studentData.student.nama_siswa}</h3>
                                <p className="text-sm text-gray-600">
                                    ID: {studentData.student.id_siswa} | 
                                    Angkatan: {studentData.student.tahun_ajaran_masuk}
                                </p>
                            </div>

                            {studentData.data && studentData.data.length > 0 ? (
                                <>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-4">
                                            Progress Akademik Siswa
                                        </h3>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={prepareChartData(studentData.data)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} style={{ fontSize: '12px' }} />
                                                <YAxis domain={[0, 100]} label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip />
                                                <Legend />
                                                {studentData.data.length > 0 && 
                                                    [...new Set(studentData.data.map(d => d.nama_mapel))].map((mapel, idx) => (
                                                        <Bar
                                                            key={idx}
                                                            dataKey={mapel}
                                                            fill={`hsl(${idx * 90}, 70%, 50%)`}
                                                        />
                                                    ))
                                                }
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 border">Mata Pelajaran</th>
                                                    <th className="px-4 py-2 border">Periode</th>
                                                    <th className="px-4 py-2 border">Kelas</th>
                                                    <th className="px-4 py-2 border">Rata TP</th>
                                                    <th className="px-4 py-2 border">UAS</th>
                                                    <th className="px-4 py-2 border">Nilai Akhir</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentData.data.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 border">{item.nama_mapel}</td>
                                                        <td className="px-4 py-2 border">
                                                            {item.tahun_ajaran} {item.semester}
                                                        </td>
                                                        <td className="px-4 py-2 border">{item.nama_kelas}</td>
                                                        <td className="px-4 py-2 border">{item.rata_tp || '-'}</td>
                                                        <td className="px-4 py-2 border">{item.nilai_uas || '-'}</td>
                                                        <td className="px-4 py-2 border font-semibold">
                                                            {item.rata_keseluruhan}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    Belum ada data nilai untuk siswa ini.
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default GuruAnalytics;
