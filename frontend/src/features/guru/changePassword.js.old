// frontend/src/features/guru/changePassword.js
import React, { useState } from 'react';
import * as guruApi from '../../api/guru';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('Semua field harus diisi');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Password baru dan konfirmasi password tidak sama');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password baru minimal 6 karakter');
      setMessageType('error');
      return;
    }

    if (oldPassword === newPassword) {
      setMessage('Password baru tidak boleh sama dengan password lama');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await guruApi.changePassword(oldPassword, newPassword);
      setMessage(response.message);
      setMessageType('success');
      
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      
    } catch (err) {
      setMessage(err.message || 'Gagal mengubah password');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
                <i className="fas fa-key text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Ganti Password</h2>
              <p className="text-gray-600">Ubah password akun Anda untuk keamanan yang lebih baik</p>
            </div>

            {/* Message Alert */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                  <span>{message}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Lama */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Lama <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan password lama"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan password baru (min. 6 karakter)"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan ulang password baru"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:-translate-y-0.5 hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Memproses...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key mr-2"></i>
                    Ubah Password
                  </>
                )}
              </button>
            </form>

            {/* Security Tips */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-shield-alt text-blue-500 mr-2"></i>
                Tips Keamanan:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 ml-6">
                <li>• Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</li>
                <li>• Jangan gunakan password yang mudah ditebak</li>
                <li>• Ubah password secara berkala</li>
                <li>• Jangan bagikan password Anda kepada siapapun</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
