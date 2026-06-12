const Notification = require('../models/Notification');

/**
 * Creates a notification in the database and emits it in real-time via Socket.io.
 * If the notification is a message, it will consolidate unread messages from the same sender.
 * 
 * @param {object} io - Socket.io instance
 * @param {object} params - Notification parameters
 * @param {string} params.recipient - ID of the recipient user
 * @param {string} [params.sender] - ID of the user who triggered the notification
 * @param {string} params.type - 'message', 'booking', or 'other'
 * @param {string} params.title - Title of the notification
 * @param {string} params.message - Body text of the notification
 * @param {string} [params.link] - Destination link on the frontend
 * @returns {Promise<object>} The populated notification document
 */
exports.createNotification = async (io, { recipient, sender, type, title, message, link }) => {
  try {
    let notification;

    // Consolidate unread message notifications from the same sender to avoid spamming
    if (type === 'message' && sender) {
      notification = await Notification.findOne({
        recipient,
        sender,
        type: 'message',
        isRead: false
      });
    }

    if (notification) {
      // Update the existing unread message notification
      notification.message = message;
      notification.title = title;
      // Bump the updatedAt timestamp so it rises to the top of the feed
      notification.createdAt = new Date();
      await notification.save();
    } else {
      // Create a brand new notification
      notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        link
      });
    }

    // Populate sender info so frontend can display name and avatar
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name avatar role');

    // Emit the notification in real-time to the recipient's personal room
    if (io) {
      io.to(`user_${recipient}`).emit('new_notification', populated);
    }

    return populated;
  } catch (err) {
    console.error('Error in createNotification utility:', err);
    throw err;
  }
};
