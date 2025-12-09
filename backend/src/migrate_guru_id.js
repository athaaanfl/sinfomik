const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || '/home/data/academic_dashboard.db';
const db = new sqlite3.Database(dbPath);

console.log('🔧 Migrating Guru table schema...');

// Migration untuk mengubah id_guru dari INTEGER AUTOINCREMENT menjadi TEXT
const migration = async () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 1. Buat tabel baru dengan schema yang benar
            db.run(`
                CREATE TABLE IF NOT EXISTS Guru_new (
                    id_guru TEXT PRIMARY KEY,
                    username TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    nama_guru TEXT NOT NULL,
                    email TEXT UNIQUE
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Error creating new table:', err);
                    reject(err);
                    return;
                }
                console.log('✅ Created Guru_new table');

                // 2. Copy data dari tabel lama ke tabel baru
                db.run(`
                    INSERT INTO Guru_new (id_guru, username, password_hash, nama_guru, email)
                    SELECT id_guru, username, password_hash, nama_guru, email FROM Guru
                `, (err) => {
                    if (err) {
                        console.error('❌ Error copying data:', err);
                        reject(err);
                        return;
                    }
                    console.log('✅ Copied data to new table');

                    // 3. Hapus tabel lama
                    db.run(`DROP TABLE IF EXISTS Guru`, (err) => {
                        if (err) {
                            console.error('❌ Error dropping old table:', err);
                            reject(err);
                            return;
                        }
                        console.log('✅ Dropped old Guru table');

                        // 4. Rename tabel baru menjadi Guru
                        db.run(`ALTER TABLE Guru_new RENAME TO Guru`, (err) => {
                            if (err) {
                                console.error('❌ Error renaming table:', err);
                                reject(err);
                                return;
                            }
                            console.log('✅ Renamed Guru_new to Guru');

                            // 5. Update foreign key constraints di GuruMataPelajaranKelas jika perlu
                            db.run(`PRAGMA foreign_key_check`, (err, rows) => {
                                if (err) {
                                    console.error('⚠️  Warning checking foreign keys:', err);
                                } else if (rows && rows.length > 0) {
                                    console.warn('⚠️  Foreign key constraint violations found:', rows);
                                }
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });
};

migration()
    .then(() => {
        console.log('\n✅ Migration completed successfully!');
        console.log('✅ id_guru is now TEXT (NIP) instead of INTEGER AUTOINCREMENT');
        db.close();
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Migration failed:', err);
        db.close();
        process.exit(1);
    });
