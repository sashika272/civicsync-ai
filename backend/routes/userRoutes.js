const express = require('express');
const router = express.Router();
const { getOfficers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/officers', protect, authorize('admin'), getOfficers);

module.exports = router;
