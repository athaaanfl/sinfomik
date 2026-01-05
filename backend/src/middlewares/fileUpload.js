const multer = require('multer');

// Konfigurasi penyimpanan
const storage = multer.memoryStorage();

// Filter file - hanya terima Excel
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung. Mohon upload file Excel (.xlsx atau .xls)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit 5MB
    }
});

module.exports = upload;