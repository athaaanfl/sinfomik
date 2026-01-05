const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('=== Checking tables ===');
db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
    if (err) {
        console.error('Error getting tables:', err);
        return;
    }
    console.log('Available tables:', tables);
    
    // Try to get student 1001 data
    console.log('\n=== Checking student 1001 data ===');
    const query = `
        SELECT 
            n.*,
            m.nama_mapel,
            tas.tahun_ajaran,
            tas.semester,
            k.nama_kelas
        FROM nilai n
        JOIN mata_pelajaran m ON n.id_mapel = m.id_mapel
        JOIN tahun_ajaran_semester tas ON n.id_ta_semester = tas.id_ta_semester
        JOIN kelas k ON n.id_kelas = k.id_kelas
        WHERE n.id_siswa = 1001
        ORDER BY tas.tahun_ajaran, tas.semester, m.nama_mapel
        LIMIT 20
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error getting student data:', err);
        } else {
            console.log(`Found ${rows.length} records for student 1001:`);
            console.log(JSON.stringify(rows, null, 2));
        }
        
        // Check aggregated data like the API returns
        console.log('\n=== Checking aggregated data (like API) ===');
        const aggQuery = `
            SELECT 
                s.id_siswa,
                s.nama_siswa,
                s.tahun_ajaran_masuk,
                m.id_mapel,
                m.nama_mapel,
                tas.id_ta_semester,
                tas.tahun_ajaran,
                tas.semester,
                k.nama_kelas,
                ROUND(AVG(CASE WHEN n.jenis_nilai = 'TP' THEN n.nilai END), 2) as rata_tp,
                MAX(CASE WHEN n.jenis_nilai = 'UAS' THEN n.nilai END) as nilai_uas,
                ROUND(AVG(n.nilai), 2) as rata_keseluruhan
            FROM siswa s
            LEFT JOIN nilai n ON s.id_siswa = n.id_siswa
            LEFT JOIN mata_pelajaran m ON n.id_mapel = m.id_mapel
            LEFT JOIN tahun_ajaran_semester tas ON n.id_ta_semester = tas.id_ta_semester
            LEFT JOIN kelas k ON n.id_kelas = k.id_kelas
            WHERE s.id_siswa = 1001
            GROUP BY m.id_mapel, tas.id_ta_semester
            ORDER BY tas.tahun_ajaran, tas.semester, m.nama_mapel
        `;
        
        db.all(aggQuery, [], (err, aggRows) => {
            if (err) {
                console.error('Error getting aggregated data:', err);
            } else {
                console.log(`Found ${aggRows.length} aggregated records:`);
                console.log(JSON.stringify(aggRows, null, 2));
            }
            db.close();
        });
    });
});
