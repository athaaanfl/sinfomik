import React, { useState, useEffect, useRef } from 'react';
import { 
    fetchSchoolAnalytics, 
    fetchAngkatanAnalytics, 
    fetchAngkatanList,
    fetchStudentAnalytics 
} from '../../api/analytics';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, Label as RechartsLabel
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Custom Label component for showing values on chart points
const CustomizedLabel = (props) => {
    const { x, y, value } = props;
    return (
        <text 
            x={x} 
            y={y - 10} 
            fill="#000" 
            fontSize="12" 
            fontWeight="bold"
            textAnchor="middle"
        >
            {value ? value.toFixed(1) : ''}
        </text>
    );
};

// Simple test component to verify Recharts works
const SimpleChartTest = () => {
    const testData = [
        { name: 'A', value: 50 },
        { name: 'B', value: 70 },
        { name: 'C', value: 85 }
    ];
    
    console.log('🧪 SimpleChartTest rendering with data:', testData);
    console.log('🔍 ResponsiveContainer type:', typeof ResponsiveContainer);
    console.log('🔍 BarChart type:', typeof BarChart);
    
    return (
        <div style={{ 
            width: '100%', 
            minHeight: '350px', 
            background: '#fff3cd', 
            padding: '20px', 
            marginBottom: '20px', 
            border: '3px solid #ff9800',
            borderRadius: '8px'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ff6b00', fontSize: '16px', fontWeight: 'bold' }}>
                🧪 CHART TEST - Part 1: CSS Bar Chart (Should ALWAYS work)
            </h4>
            <div style={{ marginBottom: '20px' }}>
                {testData.map(item => (
                    <div key={item.name} style={{ marginBottom: '8px' }}>
                        <span style={{ display: 'inline-block', width: '30px', fontWeight: 'bold' }}>{item.name}:</span>
                        <div style={{ 
                            display: 'inline-block', 
                            width: `${item.value * 3}px`, 
                            height: '30px', 
                            background: 'linear-gradient(90deg, #4caf50, #66bb6a)', 
                            borderRadius: '4px',
                            marginLeft: '10px',
                            position: 'relative',
                            verticalAlign: 'middle'
                        }}>
                            <span style={{ 
                                position: 'absolute', 
                                right: '5px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <h4 style={{ margin: '20px 0 10px 0', color: '#ff6b00', fontSize: '16px', fontWeight: 'bold' }}>
                🧪 Part 2: Recharts SVG Chart (May not work if SVG broken)
            </h4>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                If you see green bars above but NOTHING below, then Recharts/SVG is the problem.
            </p>
            <div style={{ 
                width: '100%', 
                height: '200px', 
                background: 'white',
                border: '2px dashed #4caf50',
                marginTop: '10px'
            }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={testData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                        <XAxis dataKey="name" stroke="#333" />
                        <YAxis stroke="#333" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4caf50" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AdminAnalytics = () => {
    // State management
    const [activeTab, setActiveTab] = useState('school'); // 'school', 'angkatan', 'student'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Refs for capturing charts
    const schoolChartRef = useRef(null);
    const angkatanChartRef = useRef(null);
    const studentChartRef = useRef(null);

    // School analytics state
    const [schoolData, setSchoolData] = useState([]);
    const [selectedMapelSchool, setSelectedMapelSchool] = useState('all');
    const [mataPelajaranList, setMataPelajaranList] = useState([]);

    // Angkatan analytics state
    const [angkatanData, setAngkatanData] = useState([]);
    const [angkatanList, setAngkatanList] = useState([]);
    const [selectedAngkatan, setSelectedAngkatan] = useState('');
    const [selectedMapelAngkatan, setSelectedMapelAngkatan] = useState('all');

    // Student analytics state
    const [studentData, setStudentData] = useState(null);
    const [studentId, setStudentId] = useState('');
    const [selectedMapelStudent, setSelectedMapelStudent] = useState('all');

    // Fetch mata pelajaran list from school data (only once)
    useEffect(() => {
        if (schoolData.length > 0 && mataPelajaranList.length === 0) {
            // Store both id and nama for mata pelajaran
            const mapelMap = new Map();
            schoolData.forEach(item => {
                if (!mapelMap.has(item.id_mapel)) {
                    mapelMap.set(item.id_mapel, {
                        id: item.id_mapel,
                        nama: item.nama_mapel
                    });
                }
            });
            setMataPelajaranList(Array.from(mapelMap.values()));
        }
    }, [schoolData]);

    // Fetch angkatan list on mount
    useEffect(() => {
        loadAngkatanList();
    }, []);

    const loadAngkatanList = async () => {
        try {
            const data = await fetchAngkatanList();
            setAngkatanList(data);
            if (data.length > 0) {
                setSelectedAngkatan(data[0].angkatan);
            }
        } catch (err) {
            console.error('Error loading angkatan list:', err);
        }
    };

    // Export chart to PDF with professional formatting and Bhineka logo
    const exportChartToPDF = async (chartRef, filename, title, tableData, tabType, studentInfo = null) => {
        if (!chartRef.current) {
            alert('Grafik tidak tersedia untuk di-export!');
            return;
        }

        console.log('📄 Starting PDF export...');
        console.log('📊 Table Data:', tableData);
        console.log('📋 Tab Type:', tabType);
        console.log('👤 Student Info:', studentInfo);

        try {
            // Capture the chart as canvas with HIGHER quality for PDF
            const canvas = await html2canvas(chartRef.current, {
                scale: 3, // INCREASED from 2 to 3 for better quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 0;

            // ===== HEADER SECTION WITH LOGO =====
            // Blue header background
            pdf.setFillColor(41, 128, 185);
            pdf.rect(0, 0, pageWidth, 50, 'F');

            // Add Bhineka logo (LEFT side)
            try {
                const logoImg = new Image();
                logoImg.src = '/logo-binekas.png';
                await new Promise((resolve, reject) => {
                    logoImg.onload = resolve;
                    logoImg.onerror = reject;
                    setTimeout(reject, 3000); // Timeout after 3 seconds
                });
                
                // Add logo to PDF (LEFT side, vertically centered in header)
                const logoSize = 30;
                pdf.addImage(logoImg, 'PNG', 15, 10, logoSize, logoSize);
            } catch (err) {
                console.warn('Logo could not be loaded:', err);
                // Continue without logo
            }

            // Header text (ALL CENTERED)
            pdf.setFontSize(16);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SD BINEKAS', pageWidth / 2, 20, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Laporan Analitik Akademik', pageWidth / 2, 28, { align: 'center' });
            
            // Student info if available (for student report) - CENTERED
            if (studentInfo && tabType === 'student') {
                pdf.setFontSize(9);
                pdf.text(`${studentInfo.nama} (ID: ${studentInfo.id})`, pageWidth / 2, 35, { align: 'center' });
            }

            // Line separator
            pdf.setDrawColor(255, 255, 255);
            pdf.setLineWidth(0.5);
            pdf.line(15, 47, pageWidth - 15, 47);

            yPosition = 57;

            // ===== REPORT TITLE =====
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(13);
            pdf.setFont('helvetica', 'bold');
            pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;

            // ===== CHART SECTION (BIGGER & CLEARER FOR PDF) =====
            // Calculate dimensions - make chart take 60% of page for better visibility
            const imgWidth = pageWidth - 20; // Wider margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const maxImgHeight = 120; // INCREASED from 75 to 120mm (much bigger!)
            const finalImgHeight = Math.min(imgHeight, maxImgHeight);

            pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, finalImgHeight);
            yPosition += finalImgHeight + 8;

            // ===== TABLE SECTION =====
            if (tableData && tableData.length > 0) {
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(41, 128, 185);
                pdf.text('Tabel Data Nilai', 15, yPosition);
                yPosition += 2;

                let headers = [];
                let rows = [];

                if (tabType === 'student') {
                    headers = ['Mata Pelajaran', 'Periode', 'Nilai'];
                    rows = tableData.map(item => {
                        const nilai = parseFloat(item.rata_keseluruhan || item.nilai || 0);
                        return [
                            item.nama_mapel || '-',
                            `${item.tahun_ajaran || '-'} - Sem ${item.semester || '-'}`,
                            nilai > 0 ? nilai.toFixed(2) : '-'
                        ];
                    });
                } else if (tabType === 'school') {
                    headers = ['Mata Pelajaran', 'Periode', 'Rata-rata', 'Siswa', 'Min', 'Max'];
                    rows = tableData.map(item => [
                        item.nama_mapel || '-',
                        `${item.tahun_ajaran || '-'} - Sem ${item.semester || '-'}`,
                        item.rata_rata_sekolah || '-',
                        item.jumlah_siswa || '0',
                        item.nilai_terendah || '-',
                        item.nilai_tertinggi || '-'
                    ]);
                } else if (tabType === 'angkatan') {
                    headers = ['Mata Pelajaran', 'Periode', 'Rata-rata', 'Siswa', 'Min', 'Max'];
                    rows = tableData.map(item => [
                        item.nama_mapel || '-',
                        `${item.tahun_ajaran || '-'} - Sem ${item.semester || '-'}`,
                        item.rata_rata_angkatan || '-',
                        item.jumlah_siswa || '0',
                        item.nilai_terendah || '-',
                        item.nilai_tertinggi || '-'
                    ]);
                }

                // Define column styles
                let columnStyles = {};
                if (tabType === 'student') {
                    columnStyles = {
                        0: { cellWidth: 'auto' },
                        1: { halign: 'center' },
                        2: { halign: 'center', fontStyle: 'bold', textColor: [41, 128, 185] }
                    };
                } else {
                    columnStyles = {
                        0: { cellWidth: 'auto' },
                        1: { halign: 'center' },
                        2: { halign: 'center', fontStyle: 'bold' },
                        3: { halign: 'center' },
                        4: { halign: 'center', textColor: [220, 53, 69] },
                        5: { halign: 'center', textColor: [40, 167, 69] }
                    };
                }

                // Add professional table
                autoTable(pdf, {
                    head: [headers],
                    body: rows,
                    startY: yPosition + 3,
                    theme: 'striped',
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 9,
                        halign: 'center'
                    },
                    bodyStyles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    alternateRowStyles: {
                        fillColor: [245, 248, 250]
                    },
                    columnStyles: columnStyles,
                    margin: { left: 15, right: 15 },
                    didDrawPage: function (data) {
                        // Footer
                        const footerY = pageHeight - 15;
                        pdf.setDrawColor(41, 128, 185);
                        pdf.setLineWidth(0.5);
                        pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);

                        pdf.setFontSize(8);
                        pdf.setTextColor(100, 100, 100);
                        pdf.setFont('helvetica', 'normal');

                        const today = new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        pdf.text(`Dicetak: ${today}`, 15, footerY);
                        pdf.text(`Halaman ${data.pageNumber}`, pageWidth - 15, footerY, { align: 'right' });
                    }
                });
            } else {
                // Footer if no table
                const footerY = pageHeight - 15;
                pdf.setDrawColor(41, 128, 185);
                pdf.setLineWidth(0.5);
                pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);

                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.setFont('helvetica', 'normal');

                const today = new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                pdf.text(`Dicetak: ${today}`, 15, footerY);
                pdf.text('Halaman 1', pageWidth - 15, footerY, { align: 'right' });
            }

            // Save PDF
            pdf.save(`${filename}.pdf`);
            alert('✅ Laporan PDF berhasil dibuat!');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('❌ Gagal membuat PDF: ' + error.message);
        }
    };

    // Load school analytics
    const loadSchoolAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = (selectedMapelSchool && selectedMapelSchool !== 'all') ? { id_mapel: selectedMapelSchool } : {};
            const result = await fetchSchoolAnalytics(params);
            setSchoolData(result.data || []);
        } catch (err) {
            setError('Gagal memuat data analytics sekolah');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load angkatan analytics
    const loadAngkatanAnalytics = async () => {
        if (!selectedAngkatan) return;
        
        setLoading(true);
        setError(null);
        try {
            const params = (selectedMapelAngkatan && selectedMapelAngkatan !== 'all') ? { id_mapel: selectedMapelAngkatan } : {};
            const result = await fetchAngkatanAnalytics(selectedAngkatan, params);
            setAngkatanData(result.data || []);
        } catch (err) {
            setError('Gagal memuat data analytics angkatan');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load student analytics
    const loadStudentAnalytics = async () => {
        if (!studentId) {
            setError('Masukkan ID Siswa');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const params = {};
            // Only add id_mapel if a specific mapel is selected (not 'all' or empty string)
            if (selectedMapelStudent && selectedMapelStudent !== 'all' && selectedMapelStudent !== '') {
                params.id_mapel = selectedMapelStudent;
            }
            
            const result = await fetchStudentAnalytics(studentId, params);
            setStudentData(result);
            
            // Populate mata pelajaran list from student data (only if empty)
            if (result.data && result.data.length > 0 && mataPelajaranList.length === 0) {
                const mapelMap = new Map();
                result.data.forEach(item => {
                    if (item.id_mapel && item.nama_mapel && !mapelMap.has(item.id_mapel)) {
                        mapelMap.set(item.id_mapel, {
                            id: item.id_mapel,
                            nama: item.nama_mapel
                        });
                    }
                });
                if (mapelMap.size > 0) {
                    setMataPelajaranList(Array.from(mapelMap.values()));
                }
            }
        } catch (err) {
            setError('Gagal memuat data analytics siswa');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh student analytics when subject changes (if ID already filled and tab active)
    useEffect(() => {
        if (activeTab === 'student' && studentId) {
            // Re-fetch to ensure server-side filtering is applied
            loadStudentAnalytics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMapelStudent]);

    // Auto-load school data on tab switch (only once)
    useEffect(() => {
        if (activeTab === 'school' && schoolData.length === 0) {
            loadSchoolAnalytics();
        }
    }, [activeTab]);

    // Auto-load angkatan data when angkatan or mapel filter changes
    useEffect(() => {
        if (activeTab === 'angkatan' && selectedAngkatan) {
            loadAngkatanAnalytics();
        }
    }, [selectedAngkatan, selectedMapelAngkatan, activeTab]);

    // Prepare chart data - simpler approach, use 'nilai' as the key for single subject view
    const prepareChartData = (data, mapelName = 'nilai') => {
        if (!data || data.length === 0) {
            return [];
        }

        // Group by tahun_ajaran + semester
        const tempGrouped = {};
        
        data.forEach(item => {
            const periodKey = `${item.tahun_ajaran} ${item.semester}`;
            const value = item.rata_rata_sekolah || item.rata_rata_angkatan || item.rata_keseluruhan;
            
            if (!tempGrouped[periodKey]) {
                tempGrouped[periodKey] = {
                    period: periodKey,
                    tahun_ajaran: item.tahun_ajaran,
                    semester: item.semester,
                    values: []
                };
            }
            
            if (value !== null && value !== undefined) {
                tempGrouped[periodKey].values.push(parseFloat(value));
            }
        });

        // Average multiple values per period and use generic 'nilai' key
        const finalGrouped = Object.keys(tempGrouped).map(periodKey => {
            const periodData = tempGrouped[periodKey];
            const values = periodData.values;
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            
            return {
                period: periodData.period,
                tahun_ajaran: periodData.tahun_ajaran,
                semester: periodData.semester,
                nilai: parseFloat(average.toFixed(2))
            };
        });

        // Sort by period chronologically
        const sortedData = finalGrouped.sort((a, b) => {
            // Sort by year first, then semester
            if (a.tahun_ajaran !== b.tahun_ajaran) {
                return a.tahun_ajaran.localeCompare(b.tahun_ajaran);
            }
            // Ganjil comes before Genap
            return a.semester === 'Ganjil' ? -1 : 1;
        });

        console.log('📊 Chart data prepared:', sortedData);
        return sortedData;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Analytics Dashboard - Admin</h2>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('school')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'school'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        🏫 Analisis Sekolah
                    </button>
                    <button
                        onClick={() => setActiveTab('angkatan')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'angkatan'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        🎓 Analisis Angkatan
                    </button>
                    <button
                        onClick={() => setActiveTab('student')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'student'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        👤 Analisis Siswa
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* School Analytics Tab */}
            {activeTab === 'school' && (
                <div>
                    <div className="mb-4 flex gap-4 items-center">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter Mata Pelajaran (untuk grafik):
                            </label>
                            <select
                                value={selectedMapelSchool}
                                onChange={(e) => setSelectedMapelSchool(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">📚 Semua Mata Pelajaran</option>
                                {mataPelajaranList.map((mapel) => (
                                    <option key={mapel.id} value={mapel.id}>{mapel.nama}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={loadSchoolAnalytics}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mt-6"
                        >
                            {loading ? 'Loading...' : '🔄 Refresh Data'}
                        </button>
                    </div>

                    {schoolData.length > 0 ? (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">📈 Grafik Trend Nilai Sekolah</h3>
                                    {selectedMapelSchool && selectedMapelSchool !== 'all' && (
                                        <button
                                            onClick={() => {
                                                const mapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapelSchool))?.nama || 'Mata Pelajaran';
                                                // Filter data sesuai mata pelajaran yang dipilih
                                                const filteredData = schoolData && schoolData.length > 0 
                                                    ? schoolData.filter(item => item && item.id_mapel && parseInt(item.id_mapel) === parseInt(selectedMapelSchool))
                                                    : [];
                                                exportChartToPDF(
                                                    schoolChartRef,
                                                    `laporan_sekolah_${mapelName}`,
                                                    `Laporan Analitik Sekolah - ${mapelName}`,
                                                    filteredData,
                                                    'school'
                                                );
                                            }}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <span>📄</span>
                                            <span>Export ke PDF</span>
                                        </button>
                                    )}
                                </div>
                                {(() => {
                                    // Show chart for both 'all' and specific mapel
                                    if (selectedMapelSchool === 'all') {
                                        // Multi-line chart for all subjects
                                        const chartData = prepareChartData(schoolData);
                                        
                                        if (chartData.length === 0) {
                                            return <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded">Tidak ada data untuk ditampilkan</div>;
                                        }
                                        
                                        // Get all unique subject names
                                        const subjectKeys = Object.keys(chartData[0] || {}).filter(k => k !== 'period' && k !== 'tahun_ajaran' && k !== 'semester');
                                        
                                        return (
                                            <div ref={schoolChartRef}>
                                                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded">
                                                    <span className="text-sm text-gray-700">Menampilkan trend rata-rata sekolah untuk: </span>
                                                    <span className="font-bold text-blue-700 text-lg">Semua Mata Pelajaran</span>
                                                </div>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis 
                                                            dataKey="period" 
                                                            angle={-45} 
                                                            textAnchor="end" 
                                                            height={100}
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                        <YAxis 
                                                            domain={[0, 100]} 
                                                            label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft' }}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px' }}
                                                            labelStyle={{ fontWeight: 'bold', color: '#1e40af' }}
                                                        />
                                                        <Legend />
                                                        {subjectKeys.map((subject, idx) => (
                                                            <Bar
                                                                key={idx}
                                                                dataKey={subject}
                                                                fill={`hsl(${idx * 60}, 70%, 50%)`}
                                                                name={subject}
                                                            />
                                                        ))}
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    } else {
                                        // Single line chart for specific subject
                                        const chartData = prepareChartData(schoolData);
                                        const selectedMapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapelSchool))?.nama || '';
                                        
                                        if (chartData.length === 0) {
                                            return <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded">Tidak ada data untuk mata pelajaran ini</div>;
                                        }
                                        
                                        // Dynamic Y-axis for better visualization
                                        const nilaiValues = chartData.map(d => d.nilai);
                                        const minNilai = Math.min(...nilaiValues);
                                        const maxNilai = Math.max(...nilaiValues);
                                        const padding = (maxNilai - minNilai) * 0.2 || 10;
                                        const yMin = Math.max(0, Math.floor(minNilai - padding));
                                        const yMax = Math.min(100, Math.ceil(maxNilai + padding));
                                        
                                        return (
                                            <div ref={schoolChartRef}>
                                                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded">
                                                    <span className="text-sm text-gray-700">Menampilkan trend rata-rata sekolah untuk: </span>
                                                    <span className="font-bold text-blue-700 text-lg">{selectedMapelName}</span>
                                                </div>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis 
                                                            dataKey="period" 
                                                            angle={-45} 
                                                            textAnchor="end" 
                                                            height={100}
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                        <YAxis 
                                                            domain={[yMin, yMax]} 
                                                            label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft' }}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px' }}
                                                            labelStyle={{ fontWeight: 'bold', color: '#1e40af' }}
                                                        />
                                                        <Legend />
                                                        <Bar
                                                            dataKey="nilai"
                                                            fill="#3b82f6"
                                                            name={selectedMapelName}
                                                            label={{ position: 'top', formatter: (value) => value.toFixed(1) }}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>

                            {/* Summary Table */}
                            <div className="mb-3">
                                <h3 className="text-md font-semibold text-gray-700">
                                    📊 Tabel Data Sekolah
                                    {selectedMapelSchool && selectedMapelSchool !== 'all' && (
                                        <span className="ml-2 text-sm text-blue-600">
                                            (Menampilkan: {mataPelajaranList.find(m => m.id === parseInt(selectedMapelSchool))?.nama || 'Mata Pelajaran'})
                                        </span>
                                    )}
                                </h3>
                            </div>

                            <div className="overflow-x-auto" key={`school-table-${selectedMapelSchool}`}>
                                <table className="min-w-full bg-white border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border">Mata Pelajaran</th>
                                            <th className="px-4 py-2 border">Tahun Ajaran</th>
                                            <th className="px-4 py-2 border">Semester</th>
                                            <th className="px-4 py-2 border">Rata-rata</th>
                                            <th className="px-4 py-2 border">Jumlah Siswa</th>
                                            <th className="px-4 py-2 border">Terendah</th>
                                            <th className="px-4 py-2 border">Tertinggi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schoolData && schoolData.length > 0 ? (
                                            schoolData
                                                .filter(item => {
                                                    if (!selectedMapelSchool || selectedMapelSchool === 'all') return true;
                                                    return item && item.id_mapel && parseInt(item.id_mapel) === parseInt(selectedMapelSchool);
                                                })
                                                .map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 border">{item.nama_mapel || '-'}</td>
                                                        <td className="px-4 py-2 border">{item.tahun_ajaran || '-'}</td>
                                                        <td className="px-4 py-2 border">{item.semester || '-'}</td>
                                                        <td className="px-4 py-2 border font-semibold">{item.rata_rata_sekolah || '-'}</td>
                                                        <td className="px-4 py-2 border">{item.jumlah_siswa || '0'}</td>
                                                        <td className="px-4 py-2 border text-red-600">{item.nilai_terendah || '-'}</td>
                                                        <td className="px-4 py-2 border text-green-600">{item.nilai_tertinggi || '-'}</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                    Tidak ada data untuk ditampilkan
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500">Belum ada data analytics sekolah.</p>
                    )}
                </div>
            )}

            {/* Angkatan Analytics Tab */}
            {activeTab === 'angkatan' && (
                <div>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pilih Angkatan:
                            </label>
                            <select
                                value={selectedAngkatan}
                                onChange={(e) => setSelectedAngkatan(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">-- Pilih Angkatan --</option>
                                {angkatanList.map((item, idx) => (
                                    <option key={idx} value={item.angkatan}>
                                        Angkatan {item.angkatan} ({item.jumlah_siswa} siswa)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter Mata Pelajaran (untuk grafik):
                            </label>
                            <select
                                value={selectedMapelAngkatan}
                                onChange={(e) => setSelectedMapelAngkatan(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500"
                            >
                                <option value="all">📚 Semua Mata Pelajaran</option>
                                {mataPelajaranList.map((mapel) => (
                                    <option key={mapel.id} value={mapel.id}>{mapel.nama}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {angkatanData.length > 0 ? (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">
                                        📈 Grafik Perkembangan Angkatan {selectedAngkatan}
                                    </h3>
                                    {selectedMapelAngkatan && selectedMapelAngkatan !== 'all' && prepareChartData(angkatanData).length > 0 && (
                                        <button
                                            onClick={() => {
                                                const mapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapelAngkatan))?.nama || 'Mata Pelajaran';
                                                // Filter data sesuai mata pelajaran yang dipilih
                                                const filteredData = angkatanData && angkatanData.length > 0
                                                    ? angkatanData.filter(item => item && item.id_mapel && parseInt(item.id_mapel) === parseInt(selectedMapelAngkatan))
                                                    : [];
                                                exportChartToPDF(
                                                    angkatanChartRef,
                                                    `laporan_angkatan_${selectedAngkatan}_${mapelName}`,
                                                    `Laporan Analitik Angkatan ${selectedAngkatan} - ${mapelName}`,
                                                    filteredData,
                                                    'angkatan'
                                                );
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                                        >
                                            📥 Export ke PDF
                                        </button>
                                    )}
                                </div>
                                {(() => {
                                    // Show chart for both 'all' and specific mapel
                                    if (selectedMapelAngkatan === 'all') {
                                        // Multi-line chart for all subjects
                                        const chartData = prepareChartData(angkatanData);
                                        
                                        if (chartData.length === 0) {
                                            return <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded">Tidak ada data untuk ditampilkan</div>;
                                        }
                                        
                                        // Get all unique subject names
                                        const subjectKeys = Object.keys(chartData[0] || {}).filter(k => k !== 'period' && k !== 'tahun_ajaran' && k !== 'semester');
                                        
                                        return (
                                            <div ref={angkatanChartRef}>
                                                <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded">
                                                    <span className="text-sm text-gray-700">Menampilkan perkembangan angkatan {selectedAngkatan} untuk: </span>
                                                    <span className="font-bold text-green-700 text-lg">Semua Mata Pelajaran</span>
                                                </div>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis 
                                                            dataKey="period" 
                                                            angle={-45} 
                                                            textAnchor="end" 
                                                            height={100}
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                        <YAxis 
                                                            domain={[0, 100]} 
                                                            label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft' }}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: '#fff', border: '2px solid #10b981', borderRadius: '8px' }}
                                                            labelStyle={{ fontWeight: 'bold', color: '#047857' }}
                                                        />
                                                        <Legend />
                                                        {subjectKeys.map((subject, idx) => (
                                                            <Bar
                                                                key={idx}
                                                                dataKey={subject}
                                                                fill={`hsl(${idx * 60}, 70%, 50%)`}
                                                                name={subject}
                                                            />
                                                        ))}
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    } else {
                                        // Single line chart for specific subject
                                        const chartData = prepareChartData(angkatanData);
                                        const selectedMapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapelAngkatan))?.nama || '';
                                        
                                        if (chartData.length === 0) {
                                            return <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded">Tidak ada data untuk mata pelajaran ini</div>;
                                        }
                                        
                                        // Dynamic Y-axis for better visualization
                                        const nilaiValues = chartData.map(d => d.nilai);
                                        const minNilai = Math.min(...nilaiValues);
                                        const maxNilai = Math.max(...nilaiValues);
                                        const padding = (maxNilai - minNilai) * 0.2 || 10;
                                        const yMin = Math.max(0, Math.floor(minNilai - padding));
                                        const yMax = Math.min(100, Math.ceil(maxNilai + padding));
                                        
                                        return (
                                            <div ref={angkatanChartRef}>
                                                <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded">
                                                    <span className="text-sm text-gray-700">Menampilkan perkembangan angkatan {selectedAngkatan} untuk: </span>
                                                    <span className="font-bold text-green-700 text-lg">{selectedMapelName}</span>
                                                </div>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis 
                                                            dataKey="period" 
                                                            angle={-45} 
                                                            textAnchor="end" 
                                                            height={100}
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                        <YAxis 
                                                            domain={[yMin, yMax]} 
                                                            label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft' }}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: '#fff', border: '2px solid #10b981', borderRadius: '8px' }}
                                                            labelStyle={{ fontWeight: 'bold', color: '#047857' }}
                                                        />
                                                        <Legend />
                                                        <Bar
                                                            dataKey="nilai"
                                                            fill="#10b981"
                                                            name={selectedMapelName}
                                                            label={{ position: 'top', formatter: (value) => value.toFixed(1) }}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border">Mata Pelajaran</th>
                                            <th className="px-4 py-2 border">Periode</th>
                                            <th className="px-4 py-2 border">Rata-rata Angkatan</th>
                                            <th className="px-4 py-2 border">Jumlah Siswa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {angkatanData.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 border">{item.nama_mapel}</td>
                                                <td className="px-4 py-2 border">{item.tahun_ajaran} {item.semester}</td>
                                                <td className="px-4 py-2 border font-semibold">{item.rata_rata_angkatan}</td>
                                                <td className="px-4 py-2 border">{item.jumlah_siswa}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500">Pilih angkatan untuk melihat data analytics.</p>
                    )}
                </div>
            )}

            {/* Student Analytics Tab */}
            {activeTab === 'student' && (
                <div>
                    <div className="mb-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ID Siswa:
                                </label>
                                <input
                                    type="number"
                                    placeholder="Contoh: 1001"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter Mata Pelajaran (untuk grafik):
                                </label>
                                <select
                                    value={selectedMapelStudent}
                                    onChange={(e) => setSelectedMapelStudent(e.target.value)}
                                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="all">📚 Semua Mata Pelajaran</option>
                                    {mataPelajaranList.map((mapel) => (
                                        <option key={mapel.id} value={mapel.id}>{mapel.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                                <button
                                    onClick={loadStudentAnalytics}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
                                >
                                    {loading ? 'Loading...' : '🔍 Lihat Data'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {studentData && (
                        <>
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                                <h3 className="font-semibold text-lg">{studentData.student.nama_siswa}</h3>
                                <p className="text-sm text-gray-600">
                                    ID: {studentData.student.id_siswa} | Angkatan: {studentData.student.tahun_ajaran_masuk}
                                </p>
                            </div>

                            {studentData.data && studentData.data.length > 0 ? (
                                <>
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">📈 Grafik Perkembangan Nilai</h3>
                                            {selectedMapelStudent && selectedMapelStudent !== 'all' && (
                                                <button
                                                    onClick={() => {
                                                        const mapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapelStudent))?.nama || 'Mata Pelajaran';
                                                        const filteredData = Array.isArray(studentData.data)
                                                            ? studentData.data.filter(it => parseInt(it.id_mapel, 10) === parseInt(selectedMapelStudent, 10))
                                                            : [];
                                                        
                                                        exportChartToPDF(
                                                            studentChartRef,
                                                            `laporan_${studentData.student.nama_siswa}_${mapelName}`,
                                                            `Laporan Nilai - ${mapelName}`,
                                                            filteredData,
                                                            'student',
                                                            {
                                                                id: studentData.student.id_siswa,
                                                                nama: studentData.student.nama_siswa
                                                            }
                                                        );
                                                    }}
                                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
                                                >
                                                    <span>📄</span>
                                                    <span>Export ke PDF</span>
                                                </button>
                                            )}
                                        </div>
                                        {(() => {
                                            if (selectedMapelStudent === 'all') {
                                                // Multi-line chart for all subjects
                                                const chartData = prepareChartData(studentData.data);
                                                
                                                if (chartData.length === 0) {
                                                    return <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded">Tidak ada data untuk ditampilkan</div>;
                                                }
                                                
                                                // Get all unique subject names
                                                const subjectKeys = Object.keys(chartData[0] || {}).filter(k => k !== 'period' && k !== 'tahun_ajaran' && k !== 'semester');
                                                
                                                return (
                                                    <div ref={studentChartRef}>
                                                        <div className="mb-2 p-3 bg-purple-50 border border-purple-200 rounded">
                                                            <span className="text-sm text-gray-700">Progress untuk: </span>
                                                            <span className="font-bold text-purple-700 text-lg">Semua Mata Pelajaran</span>
                                                        </div>
                                                        <ResponsiveContainer width="100%" height={400}>
                                                            <BarChart data={chartData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis 
                                                                    dataKey="period" 
                                                                    angle={-45} 
                                                                    textAnchor="end" 
                                                                    height={100}
                                                                    style={{ fontSize: '12px' }}
                                                                />
                                                                <YAxis 
                                                                    domain={[0, 100]} 
                                                                    label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft' }}
                                                                />
                                                                <Tooltip 
                                                                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #9333ea', borderRadius: '8px' }}
                                                                    labelStyle={{ fontWeight: 'bold', color: '#6b21a8' }}
                                                                />
                                                                <Legend />
                                                                {subjectKeys.map((subject, idx) => (
                                                                    <Bar
                                                                        key={idx}
                                                                        dataKey={subject}
                                                                        fill={`hsl(${idx * 60}, 70%, 50%)`}
                                                                        name={subject}
                                                                    />
                                                                ))}
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                );
                                            } else {
                                                // Single line chart for specific subject - Filter and map data directly
                                                const filtered = Array.isArray(studentData.data)
                                                    ? studentData.data.filter(it => parseInt(it.id_mapel, 10) === parseInt(selectedMapelStudent, 10))
                                                    : [];
                                                
                                                // Map directly to chart format
                                                const chartData = filtered.map(item => ({
                                                    period: `${item.tahun_ajaran} ${item.semester}`,
                                                    tahun_ajaran: item.tahun_ajaran,
                                                    semester: item.semester,
                                                    nilai: parseFloat(item.rata_keseluruhan || 0)
                                                })).sort((a, b) => {
                                                    if (a.tahun_ajaran !== b.tahun_ajaran) {
                                                        return a.tahun_ajaran.localeCompare(b.tahun_ajaran);
                                                    }
                                                    return a.semester === 'Ganjil' ? -1 : 1;
                                                });
                                                
                                                const selectedMapelName = mataPelajaranList.find(m => m.id === parseInt(selectedMapelStudent))?.nama || '';
                                                
                                                console.log('🎨 Rendering STUDENT chart for:', selectedMapelName);
                                                console.log('📊 Raw student data:', studentData.data);
                                                console.log('🔍 Filtered data:', filtered);
                                                console.log('📈 Final chart data:', chartData);
                                                
                                                if (!chartData || chartData.length === 0) {
                                                    return (
                                                        <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded">
                                                            <div className="text-4xl mb-2">📊</div>
                                                            <p>Tidak ada data untuk ditampilkan dalam grafik</p>
                                                            <p className="text-sm mt-2">Debug: {filtered.length} filtered, {studentData.data?.length || 0} total</p>
                                                        </div>
                                                    );
                                                }
                                                
                                                // Calculate dynamic Y-axis domain for better visualization
                                                const nilaiValues = chartData.map(d => d.nilai);
                                                const minNilai = Math.min(...nilaiValues);
                                                const maxNilai = Math.max(...nilaiValues);
                                                const padding = (maxNilai - minNilai) * 0.2 || 10; // 20% padding or minimum 10
                                                const yMin = Math.max(0, Math.floor(minNilai - padding));
                                                const yMax = Math.min(100, Math.ceil(maxNilai + padding));
                                                
                                                return (
                                                    <div ref={studentChartRef} style={{ width: '100%', minHeight: '500px', padding: '20px', background: '#ffffff', border: '2px solid #8b5cf6', borderRadius: '8px' }}>
                                                        <div style={{ marginBottom: '15px', padding: '12px', background: '#f3e8ff', border: '1px solid #8b5cf6', borderRadius: '6px', textAlign: 'center' }}>
                                                            <span style={{ fontWeight: 'bold', color: '#6d28d9', fontSize: '18px' }}>{selectedMapelName}</span>
                                                            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '5px' }}>({chartData.length} periode)</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '400px', background: '#fafafa', border: '1px solid #e5e7eb' }}>
                                                            <ResponsiveContainer width="100%" height={400}>
                                                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                                                    <XAxis 
                                                                        dataKey="period" 
                                                                        angle={-45} 
                                                                        textAnchor="end" 
                                                                        height={100}
                                                                        style={{ fontSize: '12px' }}
                                                                        stroke="#666"
                                                                    />
                                                                    <YAxis 
                                                                        domain={[yMin, yMax]} 
                                                                        label={{ value: 'Nilai', angle: -90, position: 'insideLeft' }}
                                                                        stroke="#666"
                                                                        tickFormatter={(value) => value.toFixed(0)}
                                                                    />
                                                                    <Tooltip 
                                                                        contentStyle={{ backgroundColor: '#fff', border: '2px solid #8b5cf6', borderRadius: '8px', padding: '10px' }}
                                                                        labelStyle={{ fontWeight: 'bold', color: '#6d28d9' }}
                                                                        formatter={(value) => [value.toFixed(2), 'Nilai']}
                                                                    />
                                                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                                    <Bar
                                                                        dataKey="nilai"
                                                                        fill="#8b5cf6"
                                                                        name={selectedMapelName}
                                                                        label={{ position: 'top', formatter: (value) => value.toFixed(1) }}
                                                                    />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                        <div style={{ marginTop: '15px', padding: '10px', background: '#f3f4f6', borderRadius: '4px', fontSize: '12px' }}>
                                                            <strong>📊 Info:</strong> Rentang nilai: {minNilai.toFixed(2)} - {maxNilai.toFixed(2)} | Y-axis: {yMin} - {yMax}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>

                                    {/* Tabel Data */}
                                    <div className="mb-3">
                                        <h3 className="text-md font-semibold text-gray-700">
                                            📊 Tabel Riwayat Nilai
                                            {selectedMapelStudent && selectedMapelStudent !== 'all' && (
                                                <span className="ml-2 text-sm text-blue-600">
                                                    (Menampilkan: {mataPelajaranList.find(m => m.id === parseInt(selectedMapelStudent))?.nama || 'Mata Pelajaran'})
                                                </span>
                                            )}
                                        </h3>
                                    </div>

                                    <div className="overflow-x-auto" key={`student-table-${selectedMapelStudent}`}>
                                        <table className="min-w-full bg-white border">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 border">Mata Pelajaran</th>
                                                    <th className="px-4 py-2 border">Periode</th>
                                                    <th className="px-4 py-2 border">Kelas</th>
                                                    <th className="px-4 py-2 border">Rata-rata TP</th>
                                                    <th className="px-4 py-2 border">UAS</th>
                                                    <th className="px-4 py-2 border">Nilai Akhir</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentData && studentData.data && studentData.data.length > 0 ? (
                                                    studentData.data
                                                        .filter(item => {
                                                            if (!selectedMapelStudent || selectedMapelStudent === 'all') return true;
                                                            return item && item.id_mapel && parseInt(item.id_mapel) === parseInt(selectedMapelStudent);
                                                        })
                                                        .map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 border">{item.nama_mapel || '-'}</td>
                                                                <td className="px-4 py-2 border">{item.tahun_ajaran || '-'} {item.semester || ''}</td>
                                                                <td className="px-4 py-2 border">{item.nama_kelas || '-'}</td>
                                                                <td className="px-4 py-2 border">{item.rata_tp || '-'}</td>
                                                                <td className="px-4 py-2 border">{item.nilai_uas || '-'}</td>
                                                                <td className="px-4 py-2 border font-semibold">{item.rata_keseluruhan || '-'}</td>
                                                            </tr>
                                                        ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-4 py-2 border text-center text-gray-500">
                                                            Tidak ada data untuk ditampilkan
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500">Belum ada data nilai untuk siswa ini.</p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
