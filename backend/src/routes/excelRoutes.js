const express = require('express');
const router = express.Router();
const upload = require('../middlewares/fileUpload');
const excelController = require('../controllers/excelController');
const { verifyToken, isAdminOrGuru } = require('../middlewares/authMiddleware');

// Apply auth middleware to all excel routes
router.use(verifyToken);
router.use(isAdminOrGuru);

// Route untuk import Excel CP
router.post('/import-cp', upload.single('file'), excelController.importCapaianPembelajaran);

// Route untuk membaca ATP berdasarkan mapel dan fase
router.get('/atp/:id_mapel/:fase', excelController.getAtpByFase);

// Route untuk update ATP berdasarkan mapel dan fase
router.put('/atp/:id_mapel/:fase', excelController.updateAtpByFase);

// Route untuk mengambil TP berdasarkan mapel, fase, dan kelas
router.get('/tp/:id_mapel/:fase/:id_kelas', excelController.getTpByMapelFaseKelas);

// Routes untuk import siswa
router.get('/students/template', excelController.exportStudentTemplate);
router.post('/students/import', upload.single('file'), excelController.importStudents);

// Routes untuk import enrollment siswa ke kelas
router.get('/enrollment/template', excelController.exportEnrollmentTemplate);
router.post('/enrollment/import', upload.single('file'), excelController.importEnrollment);

module.exports = router;