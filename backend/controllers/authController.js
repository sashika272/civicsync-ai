const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { mockUsers } = require('../models/mockDb');

// Temporary in-memory storage for OTP codes (in-production could use Redis or MongoDB VerificationSchema)
const otpStore = {};

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, role, department } = req.body;

  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Role check
    const userRole = role || 'citizen';
    if (!['citizen', 'officer', 'admin'].includes(userRole)) {
      return res.status(400).json({ success: false, message: 'Invalid user role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Database Mode
    if (process.env.MONGODB_URI) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRole,
        department: userRole === 'officer' ? department : null
      });

      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          department: user.department
        }
      });
    } 
    
    // Demo Mode fallback
    const userExists = mockUsers.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email (Demo Mode)' });
    }

    const newMockUser = {
      _id: `user_mock_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      phone,
      role: userRole,
      department: userRole === 'officer' ? department : null,
      createdAt: new Date()
    };

    mockUsers.push(newMockUser);

    return res.status(201).json({
      success: true,
      token: generateToken(newMockUser._id),
      user: {
        id: newMockUser._id,
        name: newMockUser.name,
        email: newMockUser.email,
        phone: newMockUser.phone,
        role: newMockUser.role,
        department: newMockUser.department
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Database Mode
    if (process.env.MONGODB_URI) {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          success: true,
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            department: user.department
          }
        });
      }
    } else {
      // Demo Mode fallback
      const user = mockUsers.find(u => u.email === email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          success: true,
          token: generateToken(user._id),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            department: user.department
          }
        });
      }
    }

    res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get user profile details
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc    Send OTP to email/mobile
// @route   POST /api/auth/otp/send
// @access  Public
const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  // Check if user exists (mock or DB)
  let userExists = false;
  if (process.env.MONGODB_URI) {
    userExists = await User.findOne({ email });
  } else {
    userExists = mockUsers.find(u => u.email === email);
  }

  if (!userExists) {
    return res.status(404).json({ success: false, message: 'No registered account found with this email' });
  }

  // Generate a mock 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  };

  console.log(`✉️ [OTP Sent] To: ${email} | Code: ${otp}`);

  // Return success. In demo mode, we return the OTP back in the response for easy user testing.
  res.json({
    success: true,
    message: 'OTP sent successfully. Check your email (or server log).',
    // We send this for demo convenience, but in real production this is ONLY emailed/SMSed
    demoOtp: otp 
  });
};

// @desc    Verify OTP code
// @route   POST /api/auth/otp/verify
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ success: false, message: 'OTP request not found or expired' });
  }

  if (record.expiresAt < Date.now()) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: 'OTP code has expired' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code' });
  }

  // OTP verified, mark it as verified
  record.verified = true;

  res.json({
    success: true,
    message: 'OTP verified successfully'
  });
};

// @desc    Reset password using verified OTP token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and new password are required' });
  }

  const record = otpStore[email];
  if (!record || !record.verified) {
    return res.status(400).json({ success: false, message: 'OTP verification is incomplete' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (process.env.MONGODB_URI) {
      await User.findOneAndUpdate({ email }, { password: hashedPassword });
    } else {
      const idx = mockUsers.findIndex(u => u.email === email);
      if (idx !== -1) {
        mockUsers[idx].password = hashedPassword;
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    // Clean up OTP record
    delete otpStore[email];

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new credentials.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  sendOtp,
  verifyOtp,
  resetPassword
};
