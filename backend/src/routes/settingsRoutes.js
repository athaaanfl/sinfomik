// backend/src/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, isSuperAdmin } = require('../middlewares/authMiddleware');

// Public endpoint - no authentication required
router.get('/public', settingsController.getPublicSettings);

// Protected endpoints - superadmin only
router.use(verifyToken);
router.use(isSuperAdmin);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.uploadFiles, settingsController.updateSettings);
router.delete('/file', settingsController.deleteFile);

// Superadmin management
router.get('/superadmin', settingsController.getSuperadmins);
router.post('/superadmin', settingsController.createSuperadmin);
router.put('/superadmin/password', settingsController.changeSuperadminPassword);

module.exports = router;
