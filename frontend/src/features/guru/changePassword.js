// frontend/src/features/guru/changePassword.js
import React, { useState } from 'react';
import * as guruApi from '../../api/guru';
import Button from '../../components/Button';
import ModuleContainer from '../../components/ModuleContainer';
import PageHeader from '../../components/PageHeader';
import FormSection from '../../components/FormSection';
import StatusMessage from '../../components/StatusMessage';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
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
      setMessage(response.message || 'Password berhasil diubah');
      setMessageType('success');
      
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      setMessage(err.message || 'Gagal mengubah password');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  return (
    <ModuleContainer>
      <PageHeader 
        icon="key"
        title="Ganti Password"
        subtitle="Ubah password akun Anda untuk keamanan yang lebih baik"
      />

      <StatusMessage 
        type={messageType} 
        message={message}
        onClose={clearMessage}
        autoClose={messageType === 'success'}
      />

      <FormSection title="Ubah Password" icon="lock">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Lama */}
          <div className="form-group">
            <label>
              <i className="fas fa-lock mr-2 text-gray-500"></i>
              Password Lama
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama"
                disabled={isLoading}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div className="form-group">
            <label>
              <i className="fas fa-key mr-2 text-gray-500"></i>
              Password Baru
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru (min. 6 karakter)"
                disabled={isLoading}
                required
                minLength={6}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div className="form-group">
            <label>
              <i className="fas fa-check-circle mr-2 text-gray-500"></i>
              Konfirmasi Password Baru
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Masukkan ulang password baru"
                disabled={isLoading}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              icon="key"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Memproses...' : 'Ubah Password'}
            </Button>
          </div>
        </form>
      </FormSection>

      {/* Security Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <i className="fas fa-shield-alt text-blue-600 mr-2"></i>
          Tips Keamanan Password
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
            <span>Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
            <span>Jangan gunakan password yang mudah ditebak seperti tanggal lahir</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
            <span>Ubah password secara berkala untuk meningkatkan keamanan</span>
          </li>
          <li className="flex items-start">
            <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
            <span>Jangan bagikan password Anda kepada siapapun</span>
          </li>
        </ul>
      </div>
    </ModuleContainer>
  );
};

export default ChangePassword;
