// frontend/src/api/settings.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                     (window.location.hostname === 'localhost' 
                       ? 'http://localhost:5000' 
                       : 'https://YOUR-BACKEND-APP.azurewebsites.net');

// Get public settings (no auth required)
export const getPublicSettings = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/public`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch public settings');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching public settings:', error);
        // Return default settings on error
        return {
            success: true,
            data: {
                school_name: 'Sekolah Binekas',
                school_logo: '/logo-binekas.png',
                favicon: '/logo-binekas.ico',
                login_background: '/bglogin.jpg',
                login_tagline: 'Membangun Generasi Cerdas dan Berkarakter',
                login_subtitle: 'Sistem Informasi Akademik',
                primary_color: '#4F46E5',
                announcement_text: null,
                announcement_enabled: false,
                maintenance_mode: false,
                maintenance_message: 'Sistem sedang dalam maintenance. Silakan coba lagi nanti.'
            }
        };
    }
};

// Get settings (superadmin only)
export const getSettings = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
};

// Update settings (superadmin only)
export const updateSettings = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
            method: 'PUT',
            credentials: 'include',
            body: formData, // FormData for file uploads
        });

        if (!response.ok) {
            throw new Error('Failed to update settings');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

// Delete file (superadmin only)
export const deleteSettingsFile = async (filePath) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/file`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filePath }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

// Get all superadmins (superadmin only)
export const getSuperadmins = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/superadmin`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch superadmins');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching superadmins:', error);
        throw error;
    }
};

// Change superadmin password (superadmin only)
export const changeSuperadminPassword = async (currentPassword, newPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/superadmin/password`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to change password');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

// Create new superadmin (superadmin only)
export const createSuperadmin = async (username, nama, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/superadmin`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, nama, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create superadmin');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating superadmin:', error);
        throw error;
    }
};
