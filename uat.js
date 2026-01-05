import React, { useState } from 'react';
import { FileText, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const UATDocument = () => {
  const [activeTab, setActiveTab] = useState('info');

  const testCases = [
    {
      id: 'UAT-000',
      feature: 'Login / Logout',
      description: 'Memastikan mekanisme autentikasi pengguna dan fungsi logout',
      priority: 'High',
      scenario: [
        'Pergi ke halaman login',
        'Masukkan kredensial yang valid (username: admin@test.com, password: Admin123)',
        'Klik tombol Masuk',
        'Verifikasi redirect ke Dashboard',
        'Klik tombol Logout',
        'Verifikasi redirect ke halaman Login'
      ],
      testData: 'Username: admin@test.com, Password: Admin123',
      expectedResult: 'Pengguna diarahkan ke halaman Dashboard setelah berhasil login dengan pesan "Login Berhasil", dan dikembalikan ke halaman Login setelah logout dengan session cleared',
      status: 'Pending',
      tester: '',
      executionDate: '',
      actualResult: '',
      bugId: '',
      notes: ''
    },
    {
      id: 'UAT-000-NEG',
      feature: 'Login - Negative Test',
      description: 'Memastikan sistem menolak kredensial yang tidak valid',
      priority: 'High',
      scenario: [
        'Pergi ke halaman login',
        'Masukkan kredensial yang tidak valid (password salah)',
        'Klik tombol Masuk',
        'Verifikasi error message muncul'
      ],
      testData: 'Username: admin@test.com, Password: WrongPass123',
      expectedResult: 'Sistem menampilkan pesan error "Username atau password salah" dan user tetap di halaman login',
      status: 'Pending',
      tester: '',
      executionDate: '',
      actualResult: '',
      bugId: '',
      notes: ''
    },
    {
      id: 'UAT-003',
      feature: 'Tambah Data Guru',
      description: 'Menambahkan data guru baru ke sistem',
      priority: 'High',
      scenario: [
        'Login sebagai admin',
        'Masuk menu Manajemen Guru',
        'Klik tombol "Tambah Guru"',
        'Isi NIP: 198501012020011001',
        'Isi Nama: Budi Santoso, S.Pd',
        'Isi Password: Guru123',
        'Klik Simpan',
        'Verifikasi data muncul di tabel'
      ],
      testData: 'NIP: 198501012020011001, Nama: Budi Santoso, S.Pd, Password: Guru123',
      expectedResult: 'Data guru baru muncul di tabel daftar guru, guru dapat login dengan kredensial yang dibuat, dan data tersimpan di database',
      status: 'Pending',
      tester: '',
      executionDate: '',
      actualResult: '',
      bugId: '',
      notes: ''
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Pending': return <Clock className="w-5 h-5 text-gray-400" />;
      case 'Blocked': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <FileText className="w-12 h-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DOKUMENTASI USER ACCEPTANCE TEST</h1>
                <p className="text-gray-600 mt-1">Sistem Manajemen Nilai Siswa</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-600">Nama Proyek</p>
              <p className="font-semibold">Sistem Nilai Kurikulum Merdeka</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Versi Sistem</p>
              <p className="font-semibold">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal Dokumen</p>
              <p className="font-semibold">05 Januari 2026</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Versi Dokumen</p>
              <p className="font-semibold">UAT-v1.2</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Informasi Proyek
            </button>
            <button
              onClick={() => setActiveTab('environment')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'environment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Environment & Prerequisites
            </button>
            <button
              onClick={() => setActiveTab('criteria')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'criteria' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Kriteria & Tim
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'testcases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Test Cases
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Summary & Sign-off
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tujuan UAT</h3>
                  <p className="text-gray-700">
                    Memastikan bahwa Sistem Manajemen Nilai Siswa memenuhi kebutuhan bisnis dan dapat digunakan oleh end-user (Admin dan Guru) sesuai dengan requirement yang telah disepakati. UAT ini mencakup pengujian fungsionalitas utama sistem termasuk manajemen data master, input nilai, pelaporan, dan analitik.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ruang Lingkup</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-900 mb-2">Yang Diuji:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Modul Autentikasi (Login/Logout)</li>
                      <li>Manajemen Master Data (Guru, Siswa, Kelas, Mata Pelajaran, Tahun Ajaran)</li>
                      <li>Manajemen Capaian Pembelajaran & ATP</li>
                      <li>Input dan Rekap Nilai</li>
                      <li>Penugasan Guru & Siswa</li>
                      <li>Analytics & Laporan</li>
                      <li>Fitur Import/Export Excel</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg mt-3">
                    <p className="font-medium text-orange-900 mb-2">Out of Scope:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Performance testing dan load testing</li>
                      <li>Security penetration testing</li>
                      <li>Mobile responsive testing detail</li>
                      <li>Integration dengan sistem eksternal</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Jadwal Pelaksanaan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">Persiapan UAT</p>
                      <p className="font-semibold">06 - 08 Januari 2026</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">Eksekusi Testing</p>
                      <p className="font-semibold">09 - 15 Januari 2026</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">Bug Fixing</p>
                      <p className="font-semibold">16 - 20 Januari 2026</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600">Sign-off Target</p>
                      <p className="font-semibold">22 Januari 2026</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Referensi Dokumen</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span>Software Requirement Specification (SRS) v2.1</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span>Functional Specification Document v1.5</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span>User Manual Sistem Nilai v1.0</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'environment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Lingkungan Testing</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">URL Testing</p>
                        <p className="font-mono text-sm">https://uat-sistem-nilai.example.com</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Database</p>
                        <p className="font-mono text-sm">PostgreSQL 14 (UAT Instance)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Browser Support</p>
                        <p className="text-sm">Chrome 120+, Firefox 121+, Edge 120+</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Resolution</p>
                        <p className="text-sm">1920x1080 (Desktop), 1366x768 (Laptop)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Prerequisites</h3>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div>
                      <p className="font-medium mb-2">Akun Testing:</p>
                      <div className="bg-blue-50 p-3 rounded space-y-2 text-sm font-mono">
                        <div>Admin: admin@test.com / Admin123</div>
                        <div>Guru: guru001@test.com / Guru123</div>
                        <div>Guru Admin: guruadmin@test.com / GuruAdmin123</div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Data Master yang Harus Tersedia:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Minimal 3 data guru dengan role berbeda</li>
                        <li>Minimal 30 data siswa untuk berbagai kelas</li>
                        <li>Minimal 5 kelas (VII-A, VII-B, VIII-A, VIII-B, IX-A)</li>
                        <li>Minimal 8 mata pelajaran sesuai kurikulum</li>
                        <li>Tahun ajaran aktif: 2024/2025</li>
                        <li>Template Excel untuk import tersedia di menu</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Sistem Requirement:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Unit testing: 100% pass</li>
                        <li>Integration testing: 100% pass</li>
                        <li>System testing: Completed</li>
                        <li>Bug Severity Critical/High: 0 open bugs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tools & Resources</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">Bug Tracking</p>
                      <p className="text-sm text-gray-600">Jira / GitHub Issues</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">Screen Recording</p>
                      <p className="text-sm text-gray-600">Loom / OBS Studio</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="font-medium">Test Data</p>
                      <p className="text-sm text-gray-600">Excel Templates & Sample Data</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'criteria' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Entry Criteria</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Semua fitur development sudah selesai (100%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>System Integration Testing (SIT) sudah pass dengan success rate minimal 95%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Environment UAT sudah setup dan stable</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Test data dan akun testing sudah tersedia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>User manual dan training material sudah tersedia</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <span>Tidak ada critical/high severity bug yang masih open</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Exit Criteria</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span>Minimal 95% test cases status PASS</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span>0 critical bugs dan 0 high severity bugs yang masih open</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span>Maksimal 3 medium bugs yang dapat di-defer ke post-launch</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span>Semua test cases priority HIGH sudah dieksekusi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span>Business stakeholder approval didapat (sign-off)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <span>Dokumentasi UAT lengkap dan ter-review</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Acceptance Criteria</h3>
                  <div className="border rounded-lg p-4">
                    <p className="mb-3">Sistem dianggap <span className="font-semibold text-green-700">DITERIMA</span> jika:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Semua fitur critical dan high priority berfungsi sesuai requirement</li>
                      <li>Performa halaman: Load time {'<'} 3 detik untuk normal load</li>
                      <li>Usability: User dapat menyelesaikan task tanpa bantuan teknis</li>
                      <li>Data integrity: Tidak ada data loss atau corrupt saat operasi CRUD</li>
                      <li>Exit criteria terpenuhi 100%</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tim UAT</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border p-3 text-left">Nama</th>
                          <th className="border p-3 text-left">Role</th>
                          <th className="border p-3 text-left">Responsibility</th>
                          <th className="border p-3 text-left">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-3">Andi Wijaya</td>
                          <td className="border p-3">Business Owner</td>
                          <td className="border p-3">Final approval, business validation</td>
                          <td className="border p-3 text-sm">andi.w@school.com</td>
                        </tr>
                        <tr>
                          <td className="border p-3">Siti Nurhaliza</td>
                          <td className="border p-3">Lead Tester</td>
                          <td className="border p-3">Koordinasi testing, review hasil</td>
                          <td className="border p-3 text-sm">siti.n@school.com</td>
                        </tr>
                        <tr>
                          <td className="border p-3">Budi Santoso</td>
                          <td className="border p-3">UAT Tester (Guru)</td>
                          <td className="border p-3">Testing modul guru, input nilai</td>
                          <td className="border p-3 text-sm">budi.s@school.com</td>
                        </tr>
                        <tr>
                          <td className="border p-3">Dewi Lestari</td>
                          <td className="border p-3">UAT Tester (Admin)</td>
                          <td className="border p-3">Testing modul admin, master data</td>
                          <td className="border p-3 text-sm">dewi.l@school.com</td>
                        </tr>
                        <tr>
                          <td className="border p-3">Rudi Hartono</td>
                          <td className="border p-3">Technical Support</td>
                          <td className="border p-3">Bug tracking, environment support</td>
                          <td className="border p-3 text-sm">rudi.h@devteam.com</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Prosedur Pelaporan Bug</h3>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div>
                      <p className="font-medium mb-2">Severity Level:</p>
                      <ul className="space-y-2 text-sm">
                        <li><span className="font-semibold text-red-600">Critical:</span> Sistem crash, data loss, tidak bisa login</li>
                        <li><span className="font-semibold text-orange-600">High:</span> Fitur utama tidak berfungsi, blocking user workflow</li>
                        <li><span className="font-semibold text-yellow-600">Medium:</span> Fitur minor error, ada workaround</li>
                        <li><span className="font-semibold text-green-600">Low:</span> Cosmetic issue, typo, minor UI issue</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Prosedur:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        <li>Screenshot atau screen recording bug</li>
                        <li>Catat step untuk reproduce bug</li>
                        <li>Log bug di Jira dengan label UAT-BUG-[ID]</li>
                        <li>Assign ke Technical Support untuk investigasi</li>
                        <li>Critical bug harus di-resolve dalam 24 jam</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Daftar Test Cases</h3>
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold">{testCases.length}</span> test cases (contoh)
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Catatan:</strong> Berikut adalah 3 contoh test case. Silakan tambahkan test case lainnya sesuai kebutuhan testing Anda dengan mengikuti format yang sama.
                  </p>
                </div>

                {testCases.map((tc, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold text-blue-600">{tc.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(tc.priority)}`}>
                          {tc.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tc.status)}
                        <span className="text-sm text-gray-600">{tc.status}</span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-lg mb-2">{tc.feature}</h4>
                    <p className="text-gray-700 text-sm mb-3">{tc.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Test Data:</p>
                        <p className="text-sm bg-gray-50 p-2 rounded font-mono">{tc.testData}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Tester:</p>
                        <input 
                          type="text" 
                          placeholder="Nama tester" 
                          className="text-sm w-full p-2 border rounded"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">Skenario Pengujian:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 bg-blue-50 p-3 rounded">
                        {tc.scenario.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">Expected Result:</p>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">{tc.expectedResult}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Actual Result:</p>
                        <textarea 
                          placeholder="Hasil aktual yang didapat saat testing" 
                          className="text-sm w-full p-2 border rounded h-20"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Notes / Bug ID:</p>
                        <textarea 
                          placeholder="Catatan tambahan atau ID bug jika ada" 
                          className="text-sm w-full p-2 border rounded h-20"
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-600 mb-2">Update Status:</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                          Mark as Pass
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                          Mark as Fail
                        </button>
                        <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm">
                          Mark as Blocked
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                          Reset to Pending
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Execution Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Passed</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">0</p>
                      <p className="text-xs text-gray-600 mt-1">0.00%</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Failed</span>
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-3xl font-bold text-red-600">0</p>
                      <p className="text-xs text-gray-600 mt-1">0.00%</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Blocked</span>
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-3xl font-bold text-orange-600">0</p>
                      <p className="text-xs text-gray-600 mt-1">0.00%</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Pending</span>
                        <Clock className="w-5 h-5 text-gray-600" />
                      </div>
                      <p className="text-3xl font-bold text-gray-600">3</p>
                      <p className="text-xs text-gray-600 mt-1">100.00%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Bug Summary</h3>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Critical</p>
                      <p className="text-2xl font-bold text-red-600">0</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">High</p>
                      <p className="text-2xl font-bold text-orange-600">0</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Medium</p>
                      <p className="text-2xl font-bold text-yellow-600">0</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Low</p>
                      <p className="text-2xl font-bold text-green-600">0</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Testing Progress</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="text-sm font-semibold">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{width: '0%'}}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">0 dari 3 test cases telah dieksekusi</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
                  <div className="border rounded-lg p-4">
                    <textarea 
                      placeholder="Temuan penting selama UAT, issue yang perlu diperhatikan, rekomendasi, dll." 
                      className="w-full p-3 border rounded h-32 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <div className="border rounded-lg p-4">
                    <textarea 
                      placeholder="Rekomendasi untuk perbaikan, improvement, atau action items untuk fase berikutnya" 
                      className="w-full p-3 border rounded h-32 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">UAT Sign-off</h3>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm text-blue-900 mb-2">
                        <strong>Status UAT:</strong> Belum selesai / Pending execution
                      </p>
                      <p className="text-xs text-blue-800">
                        UAT dapat di-sign-off setelah minimal 95% test cases berstatus PASS dan tidak ada critical/high bugs yang open.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border p-3 text-left">Role</th>
                            <th className="border p-3 text-left">Name</th>
                            <th className="border p-3 text-left">Signature</th>
                            <th className="border p-3 text-left">Date</th>
                            <th className="border p-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-3">Lead Tester</td>
                            <td className="border p-3">Siti Nurhaliza</td>
                            <td className="border p-3">
                              <input 
                                type="text" 
                                placeholder="Digital signature" 
                                className="w-full p-2 border rounded text-sm"
                              />
                            </td>
                            <td className="border p-3">
                              <input 
                                type="date" 
                                className="w-full p-2 border rounded text-sm"
                              />
                            </td>
                            <td className="border p-3">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="border p-3">Business Owner</td>
                            <td className="border p-3">Andi Wijaya</td>
                            <td className="border p-3">
                              <input 
                                type="text" 
                                placeholder="Digital signature" 
                                className="w-full p-2 border rounded text-sm"
                              />
                            </td>
                            <td className="border p-3">
                              <input 
                                type="date" 
                                className="w-full p-2 border rounded text-sm"
                              />
                            </td>
                            <td className="border p-3">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="border p-3">Technical Support</td>
                            <td className="border p-3">Rudi Hartono</td>
                            <td className="border p-3">
                              <input 
                                type="text" 
                                placeholder="Digital signature" 
                                className="w-full p-2 border rounded text-sm"
                              />
                            </td>
                            <td className="border p-3">
                              <input 
                                type="date" 
                                className="w-full p-2 border rounded text-sm"
                              />
                            </td>
                            <td className="border p-3">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pending</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                      <button className="px-4 py-2 border rounded hover:bg-gray-50">
                        Save Draft
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Submit Sign-off
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
                  <div className="border rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold min-w-[30px]">1.</span>
                        <span>Complete all pending test cases execution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold min-w-[30px]">2.</span>
                        <span>Resolve all critical and high priority bugs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold min-w-[30px]">3.</span>
                        <span>Re-test failed test cases after bug fixes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold min-w-[30px]">4.</span>
                        <span>Obtain sign-off from all stakeholders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold min-w-[30px]">5.</span>
                        <span>Prepare for production deployment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UATDocument;