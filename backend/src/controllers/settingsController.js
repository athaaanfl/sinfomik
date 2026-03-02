// backend/src/controllers/settingsController.js
const { getPool } = require('../config/db_postgres');
const { getDb } = require('../config/db');
const { clearMaintenanceCache } = require('../middlewares/maintenanceMiddleware');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get PostgreSQL pool
const pool = getPool();

// Helper function for queries
const query = async (text, params) => {
    return await pool.query(text, params);
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/settings');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'school_logo': /jpeg|jpg|png|gif/,
        'favicon': /x-icon|png/,
        'login_background': /jpeg|jpg|png/
    };

    const fieldName = file.fieldname;
    const extname = allowedTypes[fieldName]?.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes[fieldName]?.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error(`Error: Invalid file type for ${fieldName}!`));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: fileFilter
});

// Middleware for handling multiple file uploads
exports.uploadFiles = upload.fields([
    { name: 'school_logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'login_background', maxCount: 1 }
]);

// Get current settings
exports.getSettings = async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM app_settings WHERE id = 1',
            []
        );

        if (result.rows.length === 0) {
            // Initialize default settings if not exists
            const initResult = await query(
                `INSERT INTO app_settings (id) VALUES (1) 
                 ON CONFLICT (id) DO NOTHING 
                 RETURNING *`,
                []
            );
            return res.json({
                success: true,
                data: initResult.rows[0]
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        const {
            school_name,
            login_tagline,
            login_subtitle,
            primary_color,
            announcement_text,
            announcement_enabled,
            maintenance_mode,
            maintenance_message
        } = req.body;

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (school_name !== undefined) {
            updates.push(`school_name = $${paramIndex++}`);
            values.push(school_name);
        }
        if (login_tagline !== undefined) {
            updates.push(`login_tagline = $${paramIndex++}`);
            values.push(login_tagline);
        }
        if (login_subtitle !== undefined) {
            updates.push(`login_subtitle = $${paramIndex++}`);
            values.push(login_subtitle);
        }
        if (primary_color !== undefined) {
            updates.push(`primary_color = $${paramIndex++}`);
            values.push(primary_color);
        }
        if (announcement_text !== undefined) {
            updates.push(`announcement_text = $${paramIndex++}`);
            values.push(announcement_text);
        }
        if (announcement_enabled !== undefined) {
            updates.push(`announcement_enabled = $${paramIndex++}`);
            values.push(announcement_enabled === 'true' || announcement_enabled === true);
        }
        if (maintenance_mode !== undefined) {
            updates.push(`maintenance_mode = $${paramIndex++}`);
            values.push(maintenance_mode === 'true' || maintenance_mode === true);
        }
        if (maintenance_message !== undefined) {
            updates.push(`maintenance_message = $${paramIndex++}`);
            values.push(maintenance_message);
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.school_logo) {
                const filePath = `/uploads/settings/${req.files.school_logo[0].filename}`;
                updates.push(`school_logo = $${paramIndex++}`);
                values.push(filePath);
            }
            if (req.files.favicon) {
                const filePath = `/uploads/settings/${req.files.favicon[0].filename}`;
                updates.push(`favicon = $${paramIndex++}`);
                values.push(filePath);
            }
            if (req.files.login_background) {
                const filePath = `/uploads/settings/${req.files.login_background[0].filename}`;
                updates.push(`login_background = $${paramIndex++}`);
                values.push(filePath);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const updateQuery = `
            UPDATE app_settings 
            SET ${updates.join(', ')}
            WHERE id = 1
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        // Clear maintenance cache so changes take effect immediately
        clearMaintenanceCache();

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
};

// Get public settings (for frontend without authentication)
exports.getPublicSettings = async (req, res) => {
    try {
        const result = await query(
            `SELECT 
                school_name, 
                school_logo, 
                favicon, 
                login_background, 
                login_tagline, 
                login_subtitle, 
                primary_color,
                announcement_text,
                announcement_enabled,
                maintenance_mode,
                maintenance_message
            FROM app_settings 
            WHERE id = 1`,
            []
        );

        if (result.rows.length === 0) {
            // Return default settings if not initialized
            return res.json({
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
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public settings',
            error: error.message
        });
    }
};

// Delete uploaded file (cleanup old files)
exports.deleteFile = async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath || filePath.startsWith('/logo-binekas') || filePath.startsWith('/bglogin')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete default files'
            });
        }

        const fullPath = path.join(__dirname, '../../', filePath);
        
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
};

// Get list of all superadmins
exports.getSuperadmins = async (req, res) => {
    try {
        const db = getDb();
        
        // Use promisify to convert callback to promise
        const rows = await new Promise((resolve, reject) => {
            db.all("SELECT id_admin, username, nama, role, last_login_timestamp FROM Admin WHERE role = 'superadmin' ORDER BY id_admin ASC", [], (err, rows) => {
                if (err) {
                    console.error('Error fetching superadmins from DB:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error in getSuperadmins:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching superadmins',
            error: error.message
        });
    }
};

// Change superadmin password
exports.changeSuperadminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From JWT token
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password dan new password harus diisi'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password baru minimal 6 karakter'
            });
        }
        
        const db = getDb();
        
        // Get current user data
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT id_admin, password_hash FROM Admin WHERE id_admin = ? AND role = 'superadmin'", [userId], (err, row) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }
        
        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password lama tidak sesuai'
            });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);
        
        // Update password
        await new Promise((resolve, reject) => {
            db.run("UPDATE Admin SET password_hash = ? WHERE id_admin = ?", [newPasswordHash, userId], (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        res.json({
            success: true,
            message: 'Password berhasil diubah'
        });
    } catch (error) {
        console.error('Error in changeSuperadminPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error mengubah password',
            error: error.message
        });
    }
};

// Create new superadmin
exports.createSuperadmin = async (req, res) => {
    try {
        const { username, nama, password } = req.body;
        
        if (!username || !nama || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, nama, dan password harus diisi'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimal 6 karakter'
            });
        }
        
        const db = getDb();
        
        // Check if username already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get("SELECT id_admin FROM Admin WHERE username = ?", [username], (err, row) => {
                if (err) {
                    console.error('Error checking username:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Insert new superadmin (id_admin will auto-increment as SERIAL)
        const insertedData = await new Promise((resolve, reject) => {
            const insertQuery = "INSERT INTO Admin (username, nama, password_hash, role) VALUES (?, ?, ?, 'superadmin')";
            db.run(insertQuery, [username, nama, passwordHash], function(err, result) {
                if (err) {
                    console.error('Error creating superadmin:', err);
                    reject(err);
                } else {
                    // result should contain the inserted row data with id_admin
                    resolve(result && result[0] ? result[0] : { id_admin: this.lastID });
                }
            });
        });
        
        res.json({
            success: true,
            message: 'Superadmin baru berhasil dibuat',
            data: {
                id_admin: insertedData.id_admin,
                username: username,
                nama: nama,
                role: 'superadmin'
            }
        });
    } catch (error) {
        console.error('Error in createSuperadmin:', error);
        res.status(500).json({
            success: false,
            message: 'Error membuat superadmin',
            error: error.message
        });
    }
};
