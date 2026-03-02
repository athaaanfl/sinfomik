// backend/src/middlewares/maintenanceMiddleware.js
const { getPool } = require('../config/db_postgres');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sinfomik_super_secret_key_2025_change_in_production_please';

// Cache maintenance status to avoid database hit on every request
let maintenanceCache = {
    mode: false,
    message: '',
    lastCheck: 0,
    TTL: 30000 // 30 seconds cache
};

/**
 * Middleware to check if system is in maintenance mode
 * Blocks all users except superadmin
 * Should be applied AFTER authentication middleware
 */
exports.checkMaintenanceMode = async (req, res, next) => {
    try {
        const now = Date.now();
        
        // Refresh cache if expired
        if (now - maintenanceCache.lastCheck > maintenanceCache.TTL) {
            const pool = getPool();
            const result = await pool.query(
                'SELECT maintenance_mode, maintenance_message FROM app_settings WHERE id = 1'
            );
            
            if (result.rows.length > 0) {
                maintenanceCache.mode = result.rows[0].maintenance_mode;
                maintenanceCache.message = result.rows[0].maintenance_message || 'Sistem sedang dalam maintenance. Silakan coba lagi nanti.';
                maintenanceCache.lastCheck = now;
            }
        }
        
        // If maintenance mode is OFF, allow all requests
        if (!maintenanceCache.mode) {
            return next();
        }
        
        // Maintenance mode is ON, check if user is superadmin
        const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                
                // Allow superadmin to bypass maintenance mode
                if (decoded.role === 'superadmin') {
                    console.log(`🔧 Maintenance mode active, but allowing superadmin: ${decoded.id}`);
                    return next();
                }
            } catch (err) {
                // Invalid token, proceed to block
                console.log('🔧 Maintenance mode active, invalid token');
            }
        }
        
        // Block all other users
        console.log(`🚫 Maintenance mode active, blocking request to: ${req.path}`);
        return res.status(503).json({
            success: false,
            maintenance: true,
            message: maintenanceCache.message
        });
        
    } catch (error) {
        console.error('Error checking maintenance mode:', error);
        // On error, allow request to proceed (fail-open for availability)
        next();
    }
};

/**
 * Clear maintenance cache (call after updating settings)
 */
exports.clearMaintenanceCache = () => {
    maintenanceCache.lastCheck = 0;
    console.log('🔄 Maintenance cache cleared');
};
