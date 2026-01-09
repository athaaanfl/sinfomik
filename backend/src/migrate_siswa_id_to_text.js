// backend/src/migrate_siswa_id_to_text.js
/**
 * Migration script to change id_siswa from INTEGER to TEXT (PostgreSQL)
 * This fixes issues with:
 * - Leading zeros being lost (0213456789 -> 213456789)
 * - 10-digit NISN causing issues
 * 
 * Run this script ONCE to migrate your existing PostgreSQL database
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

console.log('🔄 Starting migration: id_siswa INTEGER -> TEXT (PostgreSQL)');
console.log(`📂 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('✅ Connected to PostgreSQL');
        
        // Start transaction
        await client.query('BEGIN');
        console.log('\n🔄 Transaction started');

        // Step 1: Check if migration is needed
        console.log('\n📋 Step 1: Checking current schema...');
        const checkType = await client.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'siswa' 
            AND column_name = 'id_siswa'
        `);
        
        if (checkType.rows.length === 0) {
            console.log('❌ Table siswa not found!');
            await client.query('ROLLBACK');
            process.exit(1);
        }

        const currentType = checkType.rows[0].data_type;
        console.log(`Current id_siswa type: ${currentType}`);
        
        if (currentType === 'text' || currentType === 'character varying') {
            console.log('✅ Migration not needed - id_siswa already TEXT');
            await client.query('ROLLBACK');
            await pool.end();
            process.exit(0);
        }

        // Step 2: Drop foreign key constraints
        console.log('\n📋 Step 2: Dropping foreign key constraints...');
        
        // Drop FK dari SiswaKelas
        await client.query('ALTER TABLE siswakelas DROP CONSTRAINT IF EXISTS siswakelas_id_siswa_fkey');
        console.log('✅ Dropped FK: siswakelas_id_siswa_fkey');
        
        // Drop FK dari Nilai
        await client.query('ALTER TABLE nilai DROP CONSTRAINT IF EXISTS nilai_id_siswa_fkey');
        console.log('✅ Dropped FK: nilai_id_siswa_fkey');
        
        // Drop FK dari SiswaCapaianPembelajaran
        await client.query('ALTER TABLE siswacapaianpembelajaran DROP CONSTRAINT IF EXISTS siswacapaianpembelajaran_id_siswa_fkey');
        console.log('✅ Dropped FK: siswacapaianpembelajaran_id_siswa_fkey');
        
        // Drop FK dari StudentClassEnrollment if exists
        const checkEnrollmentFK = await client.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'studentclassenrollment' 
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%id_siswa%'
        `);
        
        if (checkEnrollmentFK.rows.length > 0) {
            await client.query(`ALTER TABLE studentclassenrollment DROP CONSTRAINT IF EXISTS ${checkEnrollmentFK.rows[0].constraint_name}`);
            console.log(`✅ Dropped FK: ${checkEnrollmentFK.rows[0].constraint_name}`);
        }

        // Step 3: Alter all tables to TEXT
        console.log('\n📋 Step 3: Altering all tables to TEXT...');
        await client.query('ALTER TABLE siswa ALTER COLUMN id_siswa TYPE TEXT');
        console.log('✅ Siswa.id_siswa changed to TEXT');

        await client.query('ALTER TABLE siswakelas ALTER COLUMN id_siswa TYPE TEXT');
        console.log('✅ SiswaKelas.id_siswa changed to TEXT');
        
        await client.query('ALTER TABLE nilai ALTER COLUMN id_siswa TYPE TEXT');
        console.log('✅ Nilai.id_siswa changed to TEXT');
        
        await client.query('ALTER TABLE siswacapaianpembelajaran ALTER COLUMN id_siswa TYPE TEXT');
        console.log('✅ SiswaCapaianPembelajaran.id_siswa changed to TEXT');
        
        // StudentClassEnrollment (if exists)
        const checkEnrollment = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'studentclassenrollment'
        `);
        
        if (checkEnrollment.rows.length > 0) {
            await client.query('ALTER TABLE studentclassenrollment ALTER COLUMN id_siswa TYPE TEXT');
            console.log('✅ StudentClassEnrollment.id_siswa changed to TEXT');
        }

        // Step 4: Recreate foreign key constraints
        console.log('\n📋 Step 4: Recreating foreign key constraints...');
        
        await client.query(`
            ALTER TABLE siswakelas 
            ADD CONSTRAINT siswakelas_id_siswa_fkey 
            FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) ON DELETE CASCADE
        `);
        console.log('✅ Recreated FK: siswakelas_id_siswa_fkey');
        
        await client.query(`
            ALTER TABLE nilai 
            ADD CONSTRAINT nilai_id_siswa_fkey 
            FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) ON DELETE CASCADE
        `);
        console.log('✅ Recreated FK: nilai_id_siswa_fkey');
        
        await client.query(`
            ALTER TABLE siswacapaianpembelajaran 
            ADD CONSTRAINT siswacapaianpembelajaran_id_siswa_fkey 
            FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) ON DELETE CASCADE
        `);
        console.log('✅ Recreated FK: siswacapaianpembelajaran_id_siswa_fkey');
        
        if (checkEnrollment.rows.length > 0) {
            await client.query(`
                ALTER TABLE studentclassenrollment 
                ADD CONSTRAINT studentclassenrollment_id_siswa_fkey 
                FOREIGN KEY (id_siswa) REFERENCES siswa(id_siswa) ON DELETE CASCADE
            `);
            console.log('✅ Recreated FK: studentclassenrollment_id_siswa_fkey');
        }

        // Step 5: Verify migration
        console.log('\n📋 Step 5: Verifying migration...');
        const verifyTables = ['siswa', 'siswakelas', 'nilai', 'siswacapaianpembelajaran'];
        
        for (const table of verifyTables) {
            const result = await client.query(`
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = $1 
                AND column_name = 'id_siswa'
            `, [table]);
            
            if (result.rows.length > 0) {
                console.log(`✅ ${table}.id_siswa = ${result.rows[0].data_type}`);
            }
        }

        // Step 5: Show sample data
        console.log('\n📋 Step 5: Sample data...');
        const sample = await client.query('SELECT * FROM siswa LIMIT 5');
        console.table(sample.rows);

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
