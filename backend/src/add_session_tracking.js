// backend/src/add_session_tracking.js
// Migration script to add last_login_timestamp column for single-session enforcement

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = process.env.DB_PATH || path.resolve(__dirname, '../academic_dashboard.db');

console.log(`🔍 Accessing database: ${DB_FILE}\n`);

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('✓ Connected to database\n');
    
    // Add column to Admin table
    db.run("ALTER TABLE Admin ADD COLUMN last_login_timestamp INTEGER", function(err) {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log('ℹ️  Admin table already has last_login_timestamp column');
            } else {
                console.error('❌ Error adding column to Admin:', err.message);
                db.close();
                process.exit(1);
            }
        } else {
            console.log('✓ Added last_login_timestamp column to Admin table');
        }
        
        // Add column to Guru table
        db.run("ALTER TABLE Guru ADD COLUMN last_login_timestamp INTEGER", function(err) {
            if (err) {
                if (err.message.includes('duplicate column')) {
                    console.log('ℹ️  Guru table already has last_login_timestamp column');
                } else {
                    console.error('❌ Error adding column to Guru:', err.message);
                    db.close();
                    process.exit(1);
                }
            } else {
                console.log('✓ Added last_login_timestamp column to Guru table');
            }
            
            // Verify migration
            console.log('\n📊 Verifying migration...\n');
            
            db.all("PRAGMA table_info(Admin)", [], (err, rows) => {
                if (err) {
                    console.error('Error checking Admin table:', err);
                } else {
                    const hasColumn = rows.some(col => col.name === 'last_login_timestamp');
                    console.log(`✓ Admin table: last_login_timestamp ${hasColumn ? 'EXISTS' : 'NOT FOUND'}`);
                }
                
                db.all("PRAGMA table_info(Guru)", [], (err, rows) => {
                    if (err) {
                        console.error('Error checking Guru table:', err);
                    } else {
                        const hasColumn = rows.some(col => col.name === 'last_login_timestamp');
                        console.log(`✓ Guru table: last_login_timestamp ${hasColumn ? 'EXISTS' : 'NOT FOUND'}`);
                    }
                    
                    db.close();
                    console.log('\n✅ Session tracking migration completed!');
                    process.exit(0);
                });
            });
        });
    });
});
