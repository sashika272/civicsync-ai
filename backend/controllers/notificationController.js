const Notification = require('../models/Notification');
const { mockNotifications } = require('../models/mockDb');

const isMongo = () => !!process.env.MONGODB_URI;

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isMongo()) {
      const list = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: list.length, data: list });
    } else {
      // Demo Mode
      const list = mockNotifications.filter(n => n.recipient === userId.toString());
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, count: list.length, data: list });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications feed' });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markAllRead = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    if (isMongo()) {
      await Notification.updateMany({ recipient: userId }, { $set: { isRead: true } });
      return res.json({ success: true, message: 'All notifications marked as read' });
    } else {
      // Demo Mode
      mockNotifications.forEach(n => {
        if (n.recipient === userId.toString()) {
          n.isRead = true;
        }
      });
      return res.json({ success: true, message: 'All notifications marked as read (Demo Mode)' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markSingleRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  try {
    if (isMongo()) {
      const notif = await Notification.findById(id);
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
      
      if (notif.recipient.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this record' });
      }

      notif.isRead = true;
      await notif.save();
      return res.json({ success: true, data: notif });
    } else {
      // Demo Mode
      const notif = mockNotifications.find(n => n._id === id);
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });

      if (notif.recipient !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this record' });
      }

      notif.isRead = true;
      return res.json({ success: true, data: notif });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update notification state' });
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  markSingleRead
};
