// backend/src/add_tempat_lahir_column.js
/**
 * Migration script to add tempat_lahir column to Siswa table (PostgreSQL)
 * This allows storing birthplace separately from birth date
 * 
 * Run this script ONCE to add the column to your existing PostgreSQL database
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

console.log('🔄 Starting migration: Add tempat_lahir column');
console.log(`📂 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('✅ Connected to PostgreSQL');
        
        // Start transaction
        await client.query('BEGIN');
        console.log('\n🔄 Transaction started');

        // Step 1: Check if column already exists
        console.log('\n📋 Step 1: Checking if tempat_lahir column exists...');
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'siswa' 
            AND column_name = 'tempat_lahir'
        `);
        
        if (checkColumn.rows.length > 0) {
            console.log('✅ Column tempat_lahir already exists - no migration needed');
            await client.query('ROLLBACK');
            await pool.end();
            process.exit(0);
        }

        // Step 2: Add tempat_lahir column
        console.log('\n📋 Step 2: Adding tempat_lahir column...');
        await client.query('ALTER TABLE siswa ADD COLUMN tempat_lahir TEXT');
        console.log('✅ Column tempat_lahir added to siswa table');

        // Step 3: Verify column was added
        console.log('\n📋 Step 3: Verifying column...');
        const verifyColumn = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'siswa' 
            AND column_name = 'tempat_lahir'
        `);
        
        if (verifyColumn.rows.length > 0) {
            console.log(`✅ Verified: tempat_lahir | ${verifyColumn.rows[0].data_type}`);
        }

        // Step 4: Show current columns
        console.log('\n📋 Step 4: Current siswa table columns:');
        const allColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'siswa'
            ORDER BY ordinal_position
        `);
        console.table(allColumns.rows);

        // Commit transaction
        await client.query('COMMIT');
        console.log('\n✅ Migration completed successfully!');
        console.log('✅ Transaction committed');
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        console.error('Stack:', err.stack);
        console.log('⚠️  Transaction rolled back');
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
        console.log('\n✅ Connection closed');
    }
}

// Run migration
runMigration();
