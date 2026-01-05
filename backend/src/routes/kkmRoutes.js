const express = require('express');
const router = express.Router();
const kkmController = require('../controllers/kkmController');
const { verifyToken, isAdminOrGuru } = require('../middlewares/authMiddleware');

// Apply auth middleware to all KKM routes
router.use(verifyToken);
router.use(isAdminOrGuru);

// Save/Update KKM Settings
router.post('/save', kkmController.saveKkmSettings);

// Get KKM Settings
router.get('/:id_guru/:id_mapel/:id_kelas/:id_ta_semester', kkmController.getKkmSettings);

// Delete KKM Settings
router.delete('/:id_guru/:id_mapel/:id_kelas/:id_ta_semester', kkmController.deleteKkmSettings);

module.exports = router;
