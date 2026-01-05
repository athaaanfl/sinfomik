// frontend/src/pages/AdminDashboardContent.js
import React from 'react';

// Komponen ini sekarang hanya berfungsi sebagai placeholder atau wrapper
// Konten sebenarnya (tab manajemen) sudah dipindahkan ke DashboardPage
function AdminDashboardContent({ username }) {
  return (
    <div>
      {/* Konten utama Admin Dashboard akan dirender langsung di DashboardPage */}
      {/* Ini bisa tetap kosong atau berisi pesan selamat datang umum */}
      {/* Header "Dashboard Admin: [username]" sudah di DashboardPage */}
      {/* Menu navigasi admin sudah di sidebar utama DashboardPage */}
      {/* Area fitur utama admin akan diisi oleh komponen yang dipilih di DashboardPage */}
      <p>Pilih menu di sidebar untuk mengelola data.</p>
    </div>
  );
}

export default AdminDashboardContent;