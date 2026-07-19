const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  sendOtp,
  verifyOtp,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
