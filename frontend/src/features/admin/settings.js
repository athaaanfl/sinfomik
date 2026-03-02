// frontend/src/features/admin/settings.js
import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings, getSuperadmins, changeSuperadminPassword, createSuperadmin } from '../../api/settings';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

function Settings() {
    const { refreshSettings } = useSettings();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        school_name: '',
        login_tagline: '',
        login_subtitle: '',
        primary_color: '#4F46E5',
        announcement_text: '',
        announcement_enabled: false,
        maintenance_mode: false,
        maintenance_message: ''
    });
    
    const [currentFiles, setCurrentFiles] = useState({
        school_logo: '',
        favicon: '',
        login_background: ''
    });
    
    const [newFiles, setNewFiles] = useState({
        school_logo: null,
        favicon: null,
        login_background: null
    });
    
    const [previewUrls, setPreviewUrls] = useState({
        school_logo: '',
        favicon: '',
        login_background: ''
    });
    
    const [activeTab, setActiveTab] = useState('branding');
    
    // Superadmin management states
    const [superadmins, setSuperadmins] = useState([]);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [createForm, setCreateForm] = useState({
        username: '',
        nama: '',
        password: '',
        confirmPassword: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSettings();
        if (activeTab === 'superadmin') {
            fetchSuperadmins();
        }
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await getSettings();
            
            if (response.success && response.data) {
                const data = response.data;
                setFormData({
                    school_name: data.school_name || '',
                    login_tagline: data.login_tagline || '',
                    login_subtitle: data.login_subtitle || '',
                    primary_color: data.primary_color || '#4F46E5',
                    announcement_text: data.announcement_text || '',
                    announcement_enabled: data.announcement_enabled || false,
                    maintenance_mode: data.maintenance_mode || false,
                    maintenance_message: data.maintenance_message || ''
                });
                
                setCurrentFiles({
                    school_logo: data.school_logo || '',
                    favicon: data.favicon || '',
                    login_background: data.login_background || ''
                });
                
                // Set preview URLs to existing files
                const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
                setPreviewUrls({
                    school_logo: data.school_logo?.startsWith('/uploads/') ? `${apiUrl}${data.school_logo}` : data.school_logo,
                    favicon: data.favicon?.startsWith('/uploads/') ? `${apiUrl}${data.favicon}` : data.favicon,
                    login_background: data.login_background?.startsWith('/uploads/') ? `${apiUrl}${data.login_background}` : data.login_background
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Gagal memuat pengaturan');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            
            // Validate file size
            const maxSize = name === 'login_background' ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for bg, 2MB for others
            if (file.size > maxSize) {
                toast.error(`Ukuran file terlalu besar. Maksimal ${maxSize / (1024 * 1024)}MB`);
                return;
            }
            
            setNewFiles(prev => ({
                ...prev,
                [name]: file
            }));
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls(prev => ({
                    ...prev,
                    [name]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            
            // Append new files if any
            if (newFiles.school_logo) {
                formDataToSend.append('school_logo', newFiles.school_logo);
            }
            if (newFiles.favicon) {
                formDataToSend.append('favicon', newFiles.favicon);
            }
            if (newFiles.login_background) {
                formDataToSend.append('login_background', newFiles.login_background);
            }
            
            const response = await updateSettings(formDataToSend);
            
            if (response.success) {
                toast.success('Pengaturan berhasil disimpan');
                
                // Refresh settings in context to update the whole app
                refreshSettings();
                
                // Clear new files state
                setNewFiles({
                    school_logo: null,
                    favicon: null,
                    login_background: null
                });
                
                // Refetch to get updated data
                await fetchSettings();
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setLoading(false);
        }
    };

    // Superadmin management functions
    const fetchSuperadmins = async () => {
        try {
            const response = await getSuperadmins();
            if (response.success) {
                setSuperadmins(response.data);
            }
        } catch (error) {
            console.error('Error fetching superadmins:', error);
            toast.error('Gagal memuat data superadmin');
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Password baru dan konfirmasi password tidak sama');
            return;
        }
        
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password baru minimal 6 karakter');
            return;
        }
        
        try {
            setSubmitting(true);
            const response = await changeSuperadminPassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );
            
            if (response.success) {
                toast.success('Password berhasil diubah');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.message || 'Gagal mengubah password');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateSuperadmin = async (e) => {
        e.preventDefault();
        
        if (createForm.password !== createForm.confirmPassword) {
            toast.error('Password dan konfirmasi password tidak sama');
            return;
        }
        
        if (createForm.password.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }
        
        if (!createForm.username || !createForm.nama) {
            toast.error('Username dan nama harus diisi');
            return;
        }
        
        try {
            setSubmitting(true);
            const response = await createSuperadmin(
                createForm.username,
                createForm.nama,
                createForm.password
            );
            
            if (response.success) {
                toast.success('Superadmin baru berhasil dibuat');
                setCreateForm({
                    username: '',
                    nama: '',
                    password: '',
                    confirmPassword: ''
                });
                // Refresh list
                await fetchSuperadmins();
            }
        } catch (error) {
            console.error('Error creating superadmin:', error);
            toast.error(error.message || 'Gagal membuat superadmin baru');
        } finally {
            setSubmitting(false);
        }
    };

    const renderBrandingTab = () => (
        <div className="settings-section">
            <h3 className="section-title">Branding & Identitas</h3>
            
            <div className="form-group">
                <label htmlFor="school_name">Nama Sekolah/Institusi</label>
                <input
                    type="text"
                    id="school_name"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Contoh: Sekolah Binekas"
                />
                <small className="form-text-muted">Akan ditampilkan di header, login, dan judul halaman</small>
            </div>
            
            <div className="form-group">
                <label htmlFor="school_logo">Logo Sekolah</label>
                <input
                    type="file"
                    id="school_logo"
                    name="school_logo"
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    className="form-control"
                />
                <small className="form-text-muted">Format: PNG, JPG, GIF. Maksimal 2MB. Untuk navbar dan header.</small>
                {previewUrls.school_logo && (
                    <div className="preview-container">
                        <img src={previewUrls.school_logo} alt="Logo Preview" className="preview-image-small" />
                    </div>
                )}
            </div>
            
            <div className="form-group">
                <label htmlFor="favicon">Favicon (Icon Tab Browser)</label>
                <input
                    type="file"
                    id="favicon"
                    name="favicon"
                    onChange={handleFileChange}
                    accept="image/x-icon,image/png"
                    className="form-control"
                />
                <small className="form-text-muted">Format: ICO atau PNG. Maksimal 2MB. Ukuran ideal: 32x32px atau 64x64px.</small>
                {previewUrls.favicon && (
                    <div className="preview-container">
                        <img src={previewUrls.favicon} alt="Favicon Preview" className="preview-image-tiny" />
                    </div>
                )}
            </div>
        </div>
    );

    const renderLoginPageTab = () => (
        <div className="settings-section">
            <h3 className="section-title">Halaman Login</h3>
            
            <div className="form-group">
                <label htmlFor="login_background">Gambar Latar Belakang Login</label>
                <input
                    type="file"
                    id="login_background"
                    name="login_background"
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/jpg"
                    className="form-control"
                />
                <small className="form-text-muted">Format: PNG, JPG. Maksimal 5MB. Ukuran ideal: 1920x1080px.</small>
                {previewUrls.login_background && (
                    <div className="preview-container">
                        <img src={previewUrls.login_background} alt="Background Preview" className="preview-image-large" />
                    </div>
                )}
            </div>
            
            <div className="form-group">
                <label htmlFor="login_tagline">Tagline (Kalimat Utama)</label>
                <input
                    type="text"
                    id="login_tagline"
                    name="login_tagline"
                    value={formData.login_tagline}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Contoh: Membangun Generasi Cerdas dan Berkarakter"
                />
                <small className="form-text-muted">Kalimat motivasi atau slogan sekolah yang ditampilkan di halaman login.</small>
            </div>
            
            <div className="form-group">
                <label htmlFor="login_subtitle">Sub-judul Login</label>
                <input
                    type="text"
                    id="login_subtitle"
                    name="login_subtitle"
                    value={formData.login_subtitle}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Contoh: Sistem Informasi Akademik"
                />
                <small className="form-text-muted">Teks deskriptif di bawah judul login.</small>
            </div>
        </div>
    );

    const renderAnnouncementTab = () => (
        <div className="settings-section">
            <h3 className="section-title">Pengumuman</h3>
            
            <div className="form-group">
                <div className="form-check">
                    <input
                        type="checkbox"
                        id="announcement_enabled"
                        name="announcement_enabled"
                        checked={formData.announcement_enabled}
                        onChange={handleInputChange}
                        className="form-check-input"
                    />
                    <label htmlFor="announcement_enabled" className="form-check-label">
                        Aktifkan Pengumuman Pop-up
                    </label>
                </div>
                <small className="form-text-muted">Tampilkan notifikasi pengumuman saat user login ke dashboard.</small>
            </div>
            
            <div className="form-group">
                <label htmlFor="announcement_text">Isi Pengumuman</label>
                <textarea
                    id="announcement_text"
                    name="announcement_text"
                    value={formData.announcement_text}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="4"
                    placeholder="Tulis pengumuman penting untuk semua pengguna..."
                    disabled={!formData.announcement_enabled}
                />
                <small className="form-text-muted">Pengumuman akan muncul sebagai notifikasi popup saat user login.</small>
            </div>
            
            {formData.announcement_enabled && formData.announcement_text && (
                <div className="announcement-preview">
                    <h4>Preview Pengumuman:</h4>
                    <div className="alert alert-info">
                        <i className="fas fa-bullhorn"></i>
                        <span>{formData.announcement_text}</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMaintenanceTab = () => (
        <div className="settings-section">
            <h3 className="section-title">Mode Maintenance</h3>
            
            <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <strong>Perhatian!</strong> Mode maintenance akan memblokir akses semua pengguna kecuali superadmin.
            </div>
            
            <div className="form-group">
                <div className="form-check">
                    <input
                        type="checkbox"
                        id="maintenance_mode"
                        name="maintenance_mode"
                        checked={formData.maintenance_mode}
                        onChange={handleInputChange}
                        className="form-check-input"
                    />
                    <label htmlFor="maintenance_mode" className="form-check-label">
                        <strong>Aktifkan Mode Maintenance</strong>
                    </label>
                </div>
                <small className="form-text-muted">Saat aktif, hanya superadmin yang dapat mengakses sistem.</small>
            </div>
            
            <div className="form-group">
                <label htmlFor="maintenance_message">Pesan Maintenance</label>
                <textarea
                    id="maintenance_message"
                    name="maintenance_message"
                    value={formData.maintenance_message}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="Sistem sedang dalam maintenance. Silakan coba lagi nanti."
                />
                <small className="form-text-muted">Pesan yang ditampilkan kepada pengguna saat mode maintenance aktif.</small>
            </div>
        </div>
    );

    const renderSuperadminTab = () => (
        <div className="settings-section">
            <h3 className="section-title">Manajemen Superadmin</h3>
            
            {/* Change Password Section */}
            <div className="superadmin-section">
                <h4 className="subsection-title"><i className="fas fa-key"></i> Ganti Password</h4>
                <form onSubmit={handleChangePassword} className="password-form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Password Lama</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="form-control"
                            required
                            placeholder="Masukkan password lama"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="newPassword">Password Baru</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="form-control"
                            required
                            minLength="6"
                            placeholder="Minimal 6 karakter"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPasswordChange">Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            id="confirmPasswordChange"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="form-control"
                            required
                            minLength="6"
                            placeholder="Ulangi password baru"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? (
                            <><i className="fas fa-spinner fa-spin"></i> Mengubah...</>
                        ) : (
                            <><i className="fas fa-save"></i> Ubah Password</>
                        )}
                    </button>
                </form>
            </div>
            
            <hr className="section-divider" />
            
            {/* Create New Superadmin Section */}
            <div className="superadmin-section">
                <h4 className="subsection-title"><i className="fas fa-user-plus"></i> Tambah Superadmin Baru</h4>
                <form onSubmit={handleCreateSuperadmin} className="create-form">
                    <div className="form-group">
                        <label htmlFor="createUsername">Username</label>
                        <input
                            type="text"
                            id="createUsername"
                            name="username"
                            value={createForm.username}
                            onChange={handleCreateFormChange}
                            className="form-control"
                            required
                            placeholder="Username untuk login"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="createNama">Nama Lengkap</label>
                        <input
                            type="text"
                            id="createNama"
                            name="nama"
                            value={createForm.nama}
                            onChange={handleCreateFormChange}
                            className="form-control"
                            required
                            placeholder="Nama lengkap superadmin"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="createPassword">Password</label>
                        <input
                            type="password"
                            id="createPassword"
                            name="password"
                            value={createForm.password}
                            onChange={handleCreateFormChange}
                            className="form-control"
                            required
                            minLength="6"
                            placeholder="Minimal 6 karakter"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPasswordCreate">Konfirmasi Password</label>
                        <input
                            type="password"
                            id="confirmPasswordCreate"
                            name="confirmPassword"
                            value={createForm.confirmPassword}
                            onChange={handleCreateFormChange}
                            className="form-control"
                            required
                            minLength="6"
                            placeholder="Ulangi password"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? (
                            <><i className="fas fa-spinner fa-spin"></i> Membuat...</>
                        ) : (
                            <><i className="fas fa-plus"></i> Buat Superadmin</>
                        )}
                    </button>
                </form>
            </div>
            
            <hr className="section-divider" />
            
            {/* List of Superadmins */}
            <div className="superadmin-section">
                <h4 className="subsection-title"><i className="fas fa-users"></i> Daftar Superadmin</h4>
                {superadmins.length > 0 ? (
                    <div className="superadmin-list">
                        {superadmins.map((admin) => (
                            <div key={admin.id_admin} className="superadmin-item">
                                <div className="admin-info">
                                    <strong>{admin.nama}</strong>
                                    <span className="admin-username">@{admin.username}</span>
                                </div>
                                <span className="admin-badge">Superadmin</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">Tidak ada data superadmin</p>
                )}
            </div>
        </div>
    );

    if (loading && !formData.school_name) {
        return <div className="loading-container">Memuat pengaturan...</div>;
    }

    return (
        <div className="settings-page">
            <div className="card">
                <div className="card-header">
                    <h2><i className="fas fa-cog"></i> Pengaturan Sistem</h2>
                    <p className="subtitle">Kelola tampilan dan konfigurasi aplikasi</p>
                </div>
                
                <div className="card-body">
                    <div className="settings-tabs">
                        <div className="tab-nav">
                            <button
                                className={`tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
                                onClick={() => setActiveTab('branding')}
                            >
                                <i className="fas fa-palette"></i> Branding
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                                onClick={() => setActiveTab('login')}
                            >
                                <i className="fas fa-sign-in-alt"></i> Halaman Login
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'announcement' ? 'active' : ''}`}
                                onClick={() => setActiveTab('announcement')}
                            >
                                <i className="fas fa-bullhorn"></i> Pengumuman
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('maintenance')}
                            >
                                <i className="fas fa-tools"></i> Maintenance
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'superadmin' ? 'active' : ''}`}
                                onClick={() => setActiveTab('superadmin')}
                            >
                                <i className="fas fa-user-shield"></i> Superadmin
                            </button>
                        </div>
                        
                        {activeTab !== 'superadmin' ? (
                            <form onSubmit={handleSubmit} className="settings-form">
                                <div className="tab-content">
                                    {activeTab === 'branding' && renderBrandingTab()}
                                    {activeTab === 'login' && renderLoginPageTab()}
                                    {activeTab === 'announcement' && renderAnnouncementTab()}
                                    {activeTab === 'maintenance' && renderMaintenanceTab()}
                                </div>
                                
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i> Simpan Pengaturan
                                            </>
                                        )}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={fetchSettings} disabled={loading}>
                                        <i className="fas fa-sync-alt"></i> Reset
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="tab-content">
                                {renderSuperadminTab()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                .settings-page {
                    padding: 20px;
                }
                
                .card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .card-header {
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .card-header h2 {
                    margin: 0;
                    font-size: 24px;
                    color: #1f2937;
                }
                
                .subtitle {
                    margin: 5px 0 0 0;
                    color: #6b7280;
                    font-size: 14px;
                }
                
                .card-body {
                    padding: 20px;
                }
                
                .settings-tabs {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .tab-nav {
                    display: flex;
                    gap: 10px;
                    border-bottom: 2px solid #e5e7eb;
                    flex-wrap: wrap;
                }
                
                .tab-btn {
                    padding: 12px 20px;
                    background: none;
                    border: none;
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-size: 14px;
                    color: #6b7280;
                    transition: all 0.2s;
                    margin-bottom: -2px;
                }
                
                .tab-btn:hover {
                    color: #4f46e5;
                }
                
                .tab-btn.active {
                    color: #4f46e5;
                    border-bottom-color: #4f46e5;
                    font-weight: 600;
                }
                
                .settings-section {
                    padding: 20px 0;
                }
                
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #1f2937;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #374151;
                }
                
                .form-control {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                
                .form-text-muted {
                    display: block;
                    margin-top: 5px;
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .form-check {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .form-check-input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }
                
                .form-check-label {
                    cursor: pointer;
                    margin: 0;
                }
                
                .preview-container {
                    margin-top: 10px;
                    padding: 10px;
                    background: #f9fafb;
                    border-radius: 6px;
                }
                
                .preview-image-tiny {
                    width: 32px;
                    height: 32px;
                    object-fit: contain;
                }
                
                .preview-image-small {
                    width: 100px;
                    height: 100px;
                    object-fit: contain;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                }
                
                .preview-image-large {
                    width: 100%;
                    max-width: 400px;
                    height: auto;
                    object-fit: cover;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                }
                
                .announcement-preview {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f0f9ff;
                    border-radius: 6px;
                }
                
                .announcement-preview h4 {
                    font-size: 14px;
                    margin-bottom: 10px;
                    color: #1f2937;
                }
                
                .alert {
                    padding: 12px 16px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .alert-info {
                    background: #dbeafe;
                    color: #1e40af;
                    border: 1px solid #93c5fd;
                }
                
                .alert-warning {
                    background: #fef3c7;
                    color: #92400e;
                    border: 1px solid #fcd34d;
                }
                
                .form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .btn-primary {
                    background: #4f46e5;
                    color: white;
                }
                
                .btn-primary:hover:not(:disabled) {
                    background: #4338ca;
                }
                
                .btn-secondary {
                    background: #e5e7eb;
                    color: #374151;
                }
                
                .btn-secondary:hover:not(:disabled) {
                    background: #d1d5db;
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .superadmin-section {
                    margin-bottom: 30px;
                }
                
                .subsection-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .section-divider {
                    margin: 40px 0;
                    border: none;
                    border-top: 2px solid #e5e7eb;
                }
                
                .superadmin-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .superadmin-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: #f9fafb;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                }
                
                .admin-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .admin-username {
                    font-size: 13px;
                    color: #6b7280;
                }
                
                .admin-badge {
                    padding: 4px 12px;
                    background: #4f46e5;
                    color: white;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .no-data {
                    text-align: center;
                    color: #6b7280;
                    padding: 20px;
                }
                
                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 40px;
                    color: #6b7280;
                }
                
                @media (max-width: 768px) {
                    .settings-page {
                        padding: 10px;
                    }
                    
                    .card-header, .card-body {
                        padding: 15px;
                    }
                    
                    .tab-nav {
                        overflow-x: auto;
                    }
                    
                    .tab-btn {
                        white-space: nowrap;
                        font-size: 13px;
                        padding: 10px 15px;
                    }
                    
                    .color-picker-container {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
}

export default Settings;
