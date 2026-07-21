const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all officers
// @route   GET /api/users/officers
// @access  Private/Admin
const getOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-password');
    res.status(200).json({ success: true, count: officers.length, data: officers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching officers' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.department && user.role === 'officer') {
      user.department = req.body.department;
    }
    const updatedUser = await user.save();
    res.json({ success: true, user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role, department: updatedUser.department } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { currentPassword, newPassword } = req.body;
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
};

module.exports = { getOfficers, updateProfile, updatePassword };
