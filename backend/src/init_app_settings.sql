-- Create app_settings table for system-wide configuration
-- Run this migration after the main database setup
-- This script is idempotent (can be run multiple times safely)

-- Create table if not exists
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) DEFAULT 'Sekolah Binekas',
    school_logo TEXT DEFAULT '/logo-binekas.png',
    favicon TEXT DEFAULT '/logo-binekas.ico',
    login_background TEXT DEFAULT '/bglogin.jpg',
    login_tagline TEXT DEFAULT 'Membangun Generasi Cerdas dan Berkarakter',
    login_subtitle TEXT DEFAULT 'Sistem Informasi Akademik',
    primary_color VARCHAR(7) DEFAULT '#4F46E5',
    announcement_text TEXT,
    announcement_enabled BOOLEAN DEFAULT FALSE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT DEFAULT 'Sistem sedang dalam maintenance. Silakan coba lagi nanti.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings (only one row should exist)
INSERT INTO app_settings (id) 
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_app_settings_id ON app_settings(id);

-- Drop existing trigger and function if they exist (for idempotency)
DROP TRIGGER IF EXISTS trigger_update_app_settings_timestamp ON app_settings;
DROP FUNCTION IF EXISTS update_app_settings_timestamp();

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_app_settings_timestamp
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_app_settings_timestamp();
