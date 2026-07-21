const express = require('express');
const router = express.Router();
const { getOfficers, updateProfile, updatePassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/officers', protect, authorize('admin'), getOfficers);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
