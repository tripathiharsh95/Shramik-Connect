const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Mark a single notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    ).populate('sender', 'name avatar role');

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Notification not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Mark all notifications of the user as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Delete a single notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Notification not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Delete all notifications for the user
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });

    res.status(200).json({
      status: 'success',
      message: 'All notifications cleared successfully'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
