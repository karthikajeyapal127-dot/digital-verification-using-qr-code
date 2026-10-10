import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';

// @desc    Get user notifications from MongoDB
// @route   GET /api/notifications
// @access  Public / Authenticated
export const getNotifications = async (req, res) => {
  try {
    let targetUserId = req.query.userId || req.user?._id;

    if (!targetUserId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'veriglass_cryptographic_jwt_secret_key_2026_production');
        targetUserId = decoded.id;
      } catch (e) {}
    }

    const query = {};
    if (targetUserId) {
      query.userId = targetUserId;
    }

    if (req.query.unreadOnly === 'true' || req.query.isRead === 'false') {
      query.isRead = false;
    } else if (req.query.isRead === 'true') {
      query.isRead = true;
    }

    if (req.query.type && req.query.type !== 'all') {
      query.type = new RegExp(req.query.type, 'i');
    }

    const list = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Notification.countDocuments({
      ...(targetUserId ? { userId: targetUserId } : {}),
      isRead: false
    });

    res.json({
      success: true,
      count: list.length,
      unreadCount,
      data: list,
      notifications: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Public / Authenticated
export const markAsRead = async (req, res) => {
  try {
    const searchId = req.params.id;
    let notif = null;

    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      notif = await Notification.findById(searchId);
    }
    if (!notif) {
      notif = await Notification.findOne({ notificationId: searchId });
    }

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notif.isRead = true;
    await notif.save();

    res.json({ success: true, message: 'Notification marked as read', data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Public / Authenticated
export const markAllAsRead = async (req, res) => {
  try {
    let targetUserId = req.body.userId || req.user?._id;

    if (!targetUserId && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'veriglass_cryptographic_jwt_secret_key_2026_production');
        targetUserId = decoded.id;
      } catch (e) {}
    }

    const query = {};
    if (targetUserId) query.userId = targetUserId;

    await Notification.updateMany(query, { isRead: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete single notification
// @route   DELETE /api/notifications/:id
// @access  Public / Authenticated
export const deleteNotification = async (req, res) => {
  try {
    const searchId = req.params.id;
    let deleted = null;
    if (searchId.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await Notification.findByIdAndDelete(searchId);
    }
    if (!deleted) {
      deleted = await Notification.findOneAndDelete({ notificationId: searchId });
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear notifications
// @route   DELETE /api/notifications
// @access  Public / Authenticated
export const clearNotifications = async (req, res) => {
  try {
    const { userId } = req.body;
    const query = {};
    if (userId) query.userId = userId;

    await Notification.deleteMany(query);

    res.json({ success: true, message: 'Notifications cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmails = (req, res) => {
  res.json({ success: true, data: [] });
};

export const sendInstitutionalEmail = (req, res) => {
  res.json({ success: true, message: 'Notification logged' });
};

export const sendEmailNotification = sendInstitutionalEmail;

