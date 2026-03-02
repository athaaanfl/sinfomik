// backend/src/init_app_settings_table.js
// Script to initialize app_settings table in PostgreSQL database
const { getPool } = require('./config/db_postgres');
const fs = require('fs');
const path = require('path');

async function initializeAppSettingsTable() {
    const pool = getPool();
    
    try {
        console.log('🚀 Initializing app_settings table...');
        
        // Read SQL file
        const sqlPath = path.join(__dirname, 'init_app_settings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 Executing SQL migration...');
        
        // Execute SQL
        await pool.query(sql);
        
        console.log('✅ App settings table initialized successfully!');
        console.log('✅ Default settings inserted.');
        
        // Verify table creation
        const result = await pool.query('SELECT * FROM app_settings WHERE id = 1');
        console.log('📊 Current settings:', result.rows[0]);
        
        console.log('\n✨ Migration complete! You can now use the Settings page in admin dashboard.');
        
        // Close pool and exit
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing app_settings table:', error);
        await pool.end();
        process.exit(1);
    }
}

initializeAppSettingsTable();
