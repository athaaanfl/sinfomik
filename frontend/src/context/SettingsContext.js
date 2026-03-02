// frontend/src/context/SettingsContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../api/settings';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
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
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Apply theme (CSS variables)
    const applyTheme = useCallback((settingsData) => {
        const primaryColor = settingsData.primary_color || '#4F46E5';
        
        // Calculate lighter and darker shades
        const primaryLight = adjustColor(primaryColor, 40);
        const primaryDark = adjustColor(primaryColor, -30);
        
        // Set CSS variables
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary-light', primaryLight);
        document.documentElement.style.setProperty('--color-primary-dark', primaryDark);
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', primaryColor);
        }
    }, []);

    // Helper function to adjust color brightness
    const adjustColor = (color, amount) => {
        // Remove # if present
        const hex = color.replace('#', '');
        
        // Parse RGB
        const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Update favicon dynamically
    const updateFavicon = useCallback((faviconPath) => {
        const link = document.querySelector("link[rel~='icon']");
        if (link && faviconPath) {
            // Check if it's a custom uploaded favicon or default
            const fullPath = faviconPath.startsWith('/uploads/') 
                ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${faviconPath}`
                : faviconPath;
            link.href = fullPath;
        }
    }, []);

    // Update page title dynamically
    const updateTitle = useCallback((schoolName) => {
        document.title = `Sinfomik ${schoolName || 'Binekas'}`;
    }, []);

    // Fetch settings from API
    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPublicSettings();
            
            if (response.success && response.data) {
                setSettings(response.data);
                applyTheme(response.data);
                updateFavicon(response.data.favicon);
                updateTitle(response.data.school_name);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError(err.message);
            // Apply default theme on error - use default values
            applyTheme({
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
            });
        } finally {
            setLoading(false);
        }
    }, [applyTheme, updateFavicon, updateTitle]);

    // Refresh settings (can be called after updates)
    const refreshSettings = useCallback(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Fetch settings only once on mount
    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

    const value = {
        settings,
        loading,
        error,
        refreshSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
