const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const otpStore = {};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password, phone, role, department } = req.body;

  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userRole = role || 'citizen';
    if (!['citizen', 'officer', 'admin'].includes(userRole)) {
      return res.status(400).json({ success: false, message: 'Invalid user role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

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

    res.status(401).json({ success: false, message: 'Invalid email or password' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      return res.json({
        success: true,
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
    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
      console.log(\`📧 [Simulated Email to \${email}] Password Reset OTP: \${otp}\`);
      return res.json({ success: true, message: 'OTP sent to email (simulated in console)' });
    }
    return res.status(404).json({ success: false, message: 'No account found with this email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = otpStore[email];
    if (record && record.otp === otp && record.expiresAt > Date.now()) {
      return res.json({ success: true, message: 'OTP verified successfully' });
    }
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const record = otpStore[email];
    if (record && record.otp === otp && record.expiresAt > Date.now()) {
      const user = await User.findOne({ email });
      if (user) {
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        delete otpStore[email];
        return res.json({ success: true, message: 'Password reset successful. You can now login.' });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

module.exports = { registerUser, loginUser, getProfile, forgotPassword, verifyOTP, resetPassword };
