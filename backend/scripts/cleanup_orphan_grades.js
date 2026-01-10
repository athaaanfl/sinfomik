#!/usr/bin/env node
/*
  Script: cleanup_orphan_grades.js
  Usage examples:
    node scripts/cleanup_orphan_grades.js --dry-run
    node scripts/cleanup_orphan_grades.js --mapel 5 --kelas 10 --ta 3 --dry-run
    node scripts/cleanup_orphan_grades.js --mapel 5 --kelas 10 --ta 3 --delete --yes

  Behaviour:
  - Lists grades in `nilai` where the student is NOT enrolled (no row in SiswaKelas for same class & semester).
  - If --delete is provided, the script will delete those grades. Without --yes the script asks for confirmation.
*/

const path = require('path');
const readline = require('readline');
const { getDb } = require('../src/config/db');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--delete') args.delete = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--mapel' && argv[i+1]) { args.mapel = argv[++i]; }
    else if (a === '--kelas' && argv[i+1]) { args.kelas = argv[++i]; }
    else if (a === '--ta' && argv[i+1]) { args.ta = argv[++i]; }
  }
  return args;
}

async function promptConfirm() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('Proceed to DELETE these orphaned grades? Type "yes" to confirm: ', (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase() === 'yes');
    });
  });
}

(async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const db = getDb();

    let sql = `
      SELECT
        n.id_nilai,
        n.id_siswa,
        s.nama_siswa,
        n.jenis_nilai,
        n.urutan_tp,
        n.nilai,
        n.tanggal_input,
        n.keterangan,
        n.id_mapel,
        n.id_kelas,
        n.id_ta_semester
      FROM nilai n
      JOIN siswa s ON n.id_siswa = s.id_siswa
      LEFT JOIN SiswaKelas sk ON sk.id_siswa = n.id_siswa AND sk.id_kelas = n.id_kelas AND sk.id_ta_semester = n.id_ta_semester
      WHERE sk.id_siswa IS NULL
    `;
    const params = [];

    if (args.mapel) {
      sql += ' AND n.id_mapel = ?';
      params.push(args.mapel);
    }
    if (args.kelas) {
      sql += ' AND n.id_kelas = ?';
      params.push(args.kelas);
    }
    if (args.ta) {
      sql += ' AND n.id_ta_semester = ?';
      params.push(args.ta);
    }

    sql += '\nORDER BY n.id_ta_semester, n.id_kelas, n.id_mapel, s.nama_siswa, n.jenis_nilai, n.urutan_tp';

    console.log('Fetching orphaned grades...');
    const rows = await db.queryAsync(sql, params);

    if (!rows || rows.length === 0) {
      console.log('No orphaned grades found for the given filters.');
      process.exit(0);
    }

    console.log(`Found ${rows.length} orphaned grade(s):`);
    console.table(rows.map(r => ({ id_nilai: r.id_nilai, id_siswa: r.id_siswa, nama_siswa: r.nama_siswa, jenis: r.jenis_nilai, urutan_tp: r.urutan_tp, nilai: r.nilai, id_mapel: r.id_mapel, id_kelas: r.id_kelas, id_ta_semester: r.id_ta_semester })));

    if (!args.delete) {
      console.log('\nDry run (no deletion). Use --delete to remove these rows.');
      process.exit(0);
    }

    if (args.dryRun) {
      console.log('\n--dry-run specified; no deletion will occur.');
      process.exit(0);
    }

    let confirmed = !!args.yes;
    if (!confirmed) {
      confirmed = await promptConfirm();
    }

    if (!confirmed) {
      console.log('Aborted by user. No changes made.');
      process.exit(0);
    }

    // Proceed to delete inside a transaction (serialize)
    console.log('Deleting orphaned grades...');
    let deletedCount = 0;

    // Use adapter.serialize to run deletes atomically
    db.serialize(() => {
      rows.forEach(r => {
        db.run('DELETE FROM nilai WHERE id_nilai = ?', [r.id_nilai], (err) => {
          if (err) console.error(`Failed to delete id_nilai=${r.id_nilai}:`, err.message);
          else deletedCount++;
        });
      });
    });

    // Wait a short moment for serial operations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Done. Deleted ${deletedCount} orphaned grade(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
})();
