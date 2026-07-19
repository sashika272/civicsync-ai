const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markSingleRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotifications)
  .put(protect, markAllRead);

router.put('/:id/read', protect, markSingleRead);

module.exports = router;
