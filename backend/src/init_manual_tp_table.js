// Script untuk membuat tabel manual_tp
// This can be run manually or called from server startup
const { getDb } = require('./config/db');

function initManualTpTable(callback) {
  const db = getDb();

  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS manual_tp (
    id_manual_tp INTEGER PRIMARY KEY AUTOINCREMENT,
    id_penugasan TEXT NOT NULL,
    id_ta_semester INTEGER NOT NULL,
    tp_number INTEGER NOT NULL,
    tp_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_penugasan, id_ta_semester, tp_number),
    FOREIGN KEY (id_ta_semester) REFERENCES TahunAjaranSemester(id_ta_semester) ON DELETE CASCADE
  );
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('❌ Error creating manual_tp table:', err.message);
      if (callback) callback(err);
    } else {
      console.log('✅ Table manual_tp ready');
      if (callback) callback(null);
    }
  });
}

// Export untuk digunakan di server.js
module.exports = { initManualTpTable };

// Jika dijalankan langsung
if (require.main === module) {
  initManualTpTable((err) => {
    if (!err) {
      console.log('✅ Manual TP table initialization complete');
    }
    process.exit(err ? 1 : 0);
  });
}
