// backend/src/controllers/analyticsController.js
const { getDb } = require('../config/db');

/**
 * ANALYTICS ENDPOINT 1: School-Wide Analytics
 * GET /api/analytics/school
 * Query params: id_mapel (optional), id_ta_semester (optional)
 * Access: ADMIN only
 * 
 * Returns: Trend nilai rata-rata seluruh sekolah per mata pelajaran per tahun ajaran
 */
exports.getSchoolAnalytics = async (req, res) => {
    try {
        const { id_mapel, id_ta_semester } = req.query;
        const db = getDb();

        let query = `
            SELECT 
                m.id_mapel,
                m.nama_mapel,
                tas.id_ta_semester,
                tas.tahun_ajaran,
                tas.semester,
                ROUND(AVG(n.nilai)::NUMERIC, 2) as rata_rata_sekolah,
                COUNT(DISTINCT n.id_siswa) as jumlah_siswa,
                MIN(n.nilai) as nilai_terendah,
                MAX(n.nilai) as nilai_tertinggi,
                COUNT(n.id_nilai) as total_nilai_entries
            FROM Nilai n
            JOIN MataPelajaran m ON n.id_mapel = m.id_mapel
            JOIN TahunAjaranSemester tas ON n.id_ta_semester = tas.id_ta_semester
        `;

        const params = [];
        const conditions = [];

        if (id_mapel) {
            conditions.push('m.id_mapel = ?');
            params.push(id_mapel);
        }

        if (id_ta_semester) {
            conditions.push('tas.id_ta_semester = ?');
            params.push(id_ta_semester);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += `
            GROUP BY m.id_mapel, m.nama_mapel, tas.id_ta_semester, tas.tahun_ajaran, tas.semester
            ORDER BY tas.tahun_ajaran, tas.semester, m.nama_mapel
        `;

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error getting school analytics:', err);
                return res.status(500).json({ message: err.message });
            }
            res.json({ 
                type: 'school',
                data: rows,
                summary: {
                    total_records: rows.length
                }
            });
        });

    } catch (error) {
        console.error('Error in getSchoolAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ANALYTICS ENDPOINT 2: Angkatan Analytics
 * GET /api/analytics/angkatan/:tahun_ajaran_masuk
 * Query params: id_mapel (optional)
 * Access: ADMIN & GURU (wali kelas)
 * 
 * Returns: Trend nilai rata-rata per angkatan per mata pelajaran
 */
exports.getAngkatanAnalytics = async (req, res) => {
    try {
        // Accept tahun_ajaran_masuk either as a path param or as a query param
        const tahun_ajaran_masuk = req.params.tahun_ajaran_masuk || req.query.tahun_ajaran_masuk;
        const { id_mapel } = req.query;
        const db = getDb();

        if (!tahun_ajaran_masuk) {
            return res.status(400).json({ message: 'Parameter tahun_ajaran_masuk diperlukan' });
        }

        let query = `
            SELECT 
                CAST(substr(s.tahun_ajaran_masuk,1,4) AS INTEGER) as angkatan,
                m.id_mapel,
                m.nama_mapel,
                tas.id_ta_semester,
                tas.tahun_ajaran,
                tas.semester,
                ROUND(AVG(n.nilai)::NUMERIC, 2) as rata_rata_angkatan,
                COUNT(DISTINCT n.id_siswa) as jumlah_siswa,
                MIN(n.nilai) as nilai_terendah,
                MAX(n.nilai) as nilai_tertinggi
            FROM Nilai n
            JOIN Siswa s ON n.id_siswa = s.id_siswa
            JOIN MataPelajaran m ON n.id_mapel = m.id_mapel
            JOIN TahunAjaranSemester tas ON n.id_ta_semester = tas.id_ta_semester
            WHERE substr(s.tahun_ajaran_masuk, 1, 4) = ?
        `;

        // Normalize to single year (first 4 digits) so input can be '2024' or '2024/2025'
        const tahunTargetMatch = ('' + tahun_ajaran_masuk).match(/(\d{4})/);
        const tahunTarget = tahunTargetMatch ? tahunTargetMatch[1] : tahun_ajaran_masuk;

        const params = [tahunTarget];

        if (id_mapel) {
            query += ' AND m.id_mapel = ?';
            params.push(id_mapel);
        }

        query += `
            GROUP BY CAST(substr(s.tahun_ajaran_masuk,1,4) AS INTEGER), m.id_mapel, m.nama_mapel, tas.id_ta_semester, tas.tahun_ajaran, tas.semester
            ORDER BY tas.tahun_ajaran, tas.semester, m.nama_mapel
        `;

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error getting angkatan analytics:', err);
                return res.status(500).json({ message: err.message });
            }
            res.json({ 
                type: 'angkatan',
                angkatan: tahun_ajaran_masuk,
                data: rows,
                summary: {
                    total_records: rows.length
                }
            });
        });

    } catch (error) {
        console.error('Error in getAngkatanAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ANALYTICS ENDPOINT 3: Student Individual Analytics (Kenang-kenangan)
 * GET /api/analytics/student/:id_siswa
 * Query params: id_mapel (optional)
 * Access: ADMIN & GURU (guru yang mengajar siswa tersebut)
 * 
 * Returns: Complete historical record siswa per mata pelajaran
 */
exports.getStudentAnalytics = async (req, res) => {
    try {
        const { id_siswa } = req.params;
        const { id_mapel } = req.query;
        const db = getDb();

        // Get student info first
        const studentInfo = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id_siswa, nama_siswa, tahun_ajaran_masuk, tanggal_lahir, jenis_kelamin 
                 FROM Siswa WHERE id_siswa = ?`,
                [id_siswa],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!studentInfo) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }

        // Get historical grades
        // Select aggregated stats per (mapel, semester, kelas) for the student.
        // Note: do NOT include non-aggregated columns such as n.jenis_nilai or n.urutan_tp
        // to avoid GROUP BY errors in PostgreSQL.
        let query = `
            SELECT 
                s.id_siswa,
                s.nama_siswa,
                m.id_mapel,
                m.nama_mapel,
                tas.id_ta_semester,
                tas.tahun_ajaran,
                tas.semester,
                k.nama_kelas,
                ROUND(AVG(CASE WHEN n.jenis_nilai = 'TP' THEN n.nilai END)::NUMERIC, 2) as rata_tp,
                MAX(CASE WHEN n.jenis_nilai = 'UAS' THEN n.nilai END) as nilai_uas,
                ROUND(AVG(n.nilai)::NUMERIC, 2) as rata_keseluruhan,
                COUNT(CASE WHEN n.jenis_nilai = 'TP' THEN 1 END) as jumlah_tp
            FROM Siswa s
            LEFT JOIN Nilai n ON s.id_siswa = n.id_siswa
            LEFT JOIN MataPelajaran m ON n.id_mapel = m.id_mapel
            LEFT JOIN TahunAjaranSemester tas ON n.id_ta_semester = tas.id_ta_semester
            LEFT JOIN Kelas k ON n.id_kelas = k.id_kelas
            WHERE s.id_siswa = ?
        `;

        const params = [id_siswa];

        if (id_mapel) {
            query += ' AND m.id_mapel = ?';
            params.push(id_mapel);
        }

        // Group by student, subject, semester and class only — do NOT group by jenis_nilai or urutan_tp
        // so that TP averages aggregate across TP numbers and we get one row per (mapel, semester).
        query += `
            GROUP BY s.id_siswa, s.nama_siswa, m.id_mapel, m.nama_mapel, tas.id_ta_semester, tas.tahun_ajaran, tas.semester, k.id_kelas, k.nama_kelas
            ORDER BY tas.tahun_ajaran, tas.semester, m.nama_mapel
        `;

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error getting student analytics:', err);
                return res.status(500).json({ message: err.message });
            }

            // Filter out rows with no grades
            const validRows = rows.filter(row => row.nama_mapel !== null);

            // Normalize angkatan to single year (first 4 digits) for consistency
            const angkatanMatch = (studentInfo.tahun_ajaran_masuk || '').toString().match(/(\d{4})/);
            const angkatanYear = angkatanMatch ? angkatanMatch[1] : studentInfo.tahun_ajaran_masuk;
            // Replace studentInfo field for consistent UI display
            studentInfo.tahun_ajaran_masuk = angkatanYear;

            res.json({ 
                type: 'student',
                student: studentInfo,
                data: validRows,
                summary: {
                    total_records: validRows.length,
                    angkatan: angkatanYear
                }
            });
        });

    } catch (error) {
        console.error('Error in getStudentAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get detailed per-TP grades for a student+mapel
 * GET /api/analytics/student/:id_siswa/mapel/:id_mapel/details
 * Query params: id_ta_semester (optional)
 */
exports.getStudentMapelDetails = async (req, res) => {
    try {
        const { id_siswa, id_mapel } = req.params;
        const { id_ta_semester } = req.query;
        const db = getDb();

        if (!id_siswa || !id_mapel) {
            return res.status(400).json({ message: 'Parameters id_siswa and id_mapel are required' });
        }

        let query = `
            SELECT 
                n.id_nilai,
                n.id_guru,
                n.jenis_nilai,
                n.urutan_tp,
                n.nilai,
                n.tanggal_input,
                n.keterangan,
                n.id_kelas,
                k.nama_kelas,
                n.id_ta_semester,
                tas.tahun_ajaran,
                tas.semester,
                (n.id_guru || '-' || n.id_mapel || '-' || n.id_kelas || '-' || n.id_ta_semester) AS id_penugasan,
                COALESCE(
                    mt.tp_name,
                    (
                        SELECT tp_name FROM manual_tp m2
                        WHERE m2.id_penugasan = (n.id_guru || '-' || n.id_mapel || '-' || n.id_kelas || '-' || n.id_ta_semester)
                          AND m2.tp_number = n.urutan_tp
                        ORDER BY m2.id_ta_semester DESC
                        LIMIT 1
                    )
                ) AS tp_name
            FROM Nilai n
            LEFT JOIN Kelas k ON n.id_kelas = k.id_kelas
            LEFT JOIN TahunAjaranSemester tas ON n.id_ta_semester = tas.id_ta_semester
            LEFT JOIN manual_tp mt ON mt.id_penugasan = (n.id_guru || '-' || n.id_mapel || '-' || n.id_kelas || '-' || n.id_ta_semester) AND mt.tp_number = n.urutan_tp AND mt.id_ta_semester = n.id_ta_semester
            WHERE n.id_siswa = ? AND n.id_mapel = ?
        `;

        const params = [id_siswa, id_mapel];

        if (id_ta_semester) {
            query += ' AND n.id_ta_semester = ?';
            params.push(id_ta_semester);
        }

        // Order by year desc, semester, then TP number
        query += ' ORDER BY tas.tahun_ajaran DESC, tas.semester DESC, n.urutan_tp ASC';

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error getting student mapel details:', err);
                return res.status(500).json({ message: err.message });
            }

            res.json({
                success: true,
                student_id: id_siswa,
                id_mapel: id_mapel,
                total: rows.length,
                data: rows
            });
        });

    } catch (error) {
        console.error('Error in getStudentMapelDetails:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ANALYTICS ENDPOINT 4: Guru Subject Analytics
 * GET /api/analytics/guru/:id_guru
 * Query params: id_mapel (optional), id_kelas (optional), id_ta_semester (optional)
 * Access: GURU (own data only)
 * 
 * Returns: Trend nilai mata pelajaran yang diajarkan guru
 */
exports.getGuruAnalytics = async (req, res) => {
    try {
        const { id_guru } = req.params;
        const { id_mapel, id_kelas, id_ta_semester } = req.query;
        const db = getDb();

        // Get guru info
        const guruInfo = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id_guru, nama_guru, email FROM Guru WHERE id_guru = ?',
                [id_guru],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!guruInfo) {
            return res.status(404).json({ message: 'Guru tidak ditemukan' });
        }

        let query = `
            SELECT 
                g.id_guru,
                g.nama_guru,
                m.id_mapel,
                m.nama_mapel,
                k.id_kelas,
                k.nama_kelas,
                s.id_siswa,
                s.nama_siswa,
                tas.id_ta_semester,
                tas.tahun_ajaran,
                tas.semester,
                ROUND(AVG(n.nilai)::NUMERIC, 2) as rata_rata_kelas,
                COUNT(DISTINCT n.id_siswa) as jumlah_siswa,
                MIN(n.nilai) as nilai_terendah,
                MAX(n.nilai) as nilai_tertinggi,
                COUNT(CASE WHEN n.jenis_nilai = 'TP' THEN 1 END) as total_tp,
                COUNT(CASE WHEN n.jenis_nilai = 'UAS' THEN 1 END) as total_uas
            FROM Guru g
            JOIN GuruMataPelajaranKelas gmpk ON g.id_guru = gmpk.id_guru
            JOIN MataPelajaran m ON gmpk.id_mapel = m.id_mapel
            JOIN Kelas k ON gmpk.id_kelas = k.id_kelas
            JOIN TahunAjaranSemester tas ON gmpk.id_ta_semester = tas.id_ta_semester
            LEFT JOIN SiswaKelas sk ON k.id_kelas = sk.id_kelas AND tas.id_ta_semester = sk.id_ta_semester
            LEFT JOIN Siswa s ON sk.id_siswa = s.id_siswa
            LEFT JOIN Nilai n ON 
                n.id_guru = g.id_guru AND 
                n.id_mapel = m.id_mapel AND 
                n.id_kelas = k.id_kelas AND
                n.id_ta_semester = tas.id_ta_semester AND
                (s.id_siswa IS NULL OR n.id_siswa = s.id_siswa)
            WHERE g.id_guru = ?
        `;

        const params = [id_guru];

        if (id_mapel) {
            query += ' AND m.id_mapel = ?';
            params.push(id_mapel);
        }

        if (id_kelas) {
            query += ' AND k.id_kelas = ?';
            params.push(id_kelas);
        }

        if (id_ta_semester) {
            query += ' AND tas.id_ta_semester = ?';
            params.push(id_ta_semester);
        }

        query += `
            GROUP BY g.id_guru, g.nama_guru, m.id_mapel, m.nama_mapel, k.id_kelas, k.nama_kelas, tas.id_ta_semester, tas.tahun_ajaran, tas.semester, s.id_siswa, s.nama_siswa
            ORDER BY tas.tahun_ajaran, tas.semester, m.nama_mapel, k.nama_kelas
        `;

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error getting guru analytics:', err);
                return res.status(500).json({ message: err.message });
            }
            res.json({ 
                type: 'guru',
                guru: guruInfo,
                data: rows,
                summary: {
                    total_records: rows.length
                }
            });
        });

    } catch (error) {
        console.error('Error in getGuruAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ANALYTICS ENDPOINT 5: Get Available Angkatan List
 * GET /api/analytics/angkatan-list
 * Access: ADMIN & GURU
 * 
 * Returns: List of all angkatan available in system
 */
exports.getAngkatanList = (req, res) => {
    const db = getDb();
    
    db.all(`
        -- Group by first 4 digits (year) to support values like '2024' or '2024/2025'
        SELECT DISTINCT CAST(substr(tahun_ajaran_masuk,1,4) AS INTEGER) as angkatan, COUNT(*) as jumlah_siswa
        FROM Siswa
        WHERE tahun_ajaran_masuk IS NOT NULL AND tahun_ajaran_masuk != ''
        GROUP BY CAST(substr(tahun_ajaran_masuk,1,4) AS INTEGER)
        ORDER BY angkatan DESC
    `, [], (err, rows) => {
        if (err) {
            console.error('Error getting angkatan list:', err);
            return res.status(500).json({ message: err.message });
        }
        // Filter out null angkatan (shouldn't happen with WHERE clause, but just in case)
        const filteredRows = rows.filter(row => row.angkatan !== null);
        res.json(filteredRows);
    });
};

/**
 * ANALYTICS ENDPOINT 6: Get Comparison Between Students
 * GET /api/analytics/compare-students
 * Query params: id_siswa_list (comma separated), id_mapel (optional)
 * Access: ADMIN & GURU
 * 
 * Returns: Comparison data untuk multiple students
 */
exports.compareStudents = async (req, res) => {
    try {
        const { id_siswa_list, id_mapel } = req.query;
        
        if (!id_siswa_list) {
            return res.status(400).json({ message: 'id_siswa_list is required' });
        }

        const siswaIds = id_siswa_list.split(',').map(id => parseInt(id.trim()));
        const db = getDb();

        const placeholders = siswaIds.map(() => '?').join(',');
        
        let query = `
            SELECT 
                s.id_siswa,
                s.nama_siswa,
                m.id_mapel,
                m.nama_mapel,
                tas.tahun_ajaran,
                tas.semester,
                ROUND(AVG(n.nilai)::NUMERIC, 2) as rata_rata
            FROM Siswa s
            LEFT JOIN Nilai n ON s.id_siswa = n.id_siswa
            LEFT JOIN MataPelajaran m ON n.id_mapel = m.id_mapel
            LEFT JOIN TahunAjaranSemester tas ON n.id_ta_semester = tas.id_ta_semester
            WHERE s.id_siswa IN (${placeholders})
        `;

        const params = [...siswaIds];

        if (id_mapel) {
            query += ' AND m.id_mapel = ?';
            params.push(id_mapel);
        }

        query += `
            GROUP BY s.id_siswa, s.nama_siswa, m.id_mapel, m.nama_mapel, tas.id_ta_semester, tas.tahun_ajaran, tas.semester
            ORDER BY tas.tahun_ajaran, tas.semester, s.nama_siswa
        `;

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error comparing students:', err);
                return res.status(500).json({ message: err.message });
            }
            res.json({ 
                type: 'comparison',
                students_compared: siswaIds.length,
                data: rows
            });
        });

    } catch (error) {
        console.error('Error in compareStudents:', error);
        res.status(500).json({ message: error.message });
    }
};
