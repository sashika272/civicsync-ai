const User = require('../models/User');
const { mockUsers } = require('../models/mockDb');

// @desc    Get all officers
// @route   GET /api/users/officers
// @access  Private (Admin)
const getOfficers = async (req, res) => {
  try {
    if (process.env.MONGODB_URI) {
      const officers = await User.find({ role: 'officer' }).select('name email phone department');
      return res.json({ success: true, count: officers.length, data: officers });
    } else {
      const officers = mockUsers
        .filter(u => u.role === 'officer')
        .map(u => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          department: u.department
        }));
      return res.json({ success: true, count: officers.length, data: officers });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve officers list' });
  }
};

module.exports = {
  getOfficers
};
