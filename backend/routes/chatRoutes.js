const express = require('express');
const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const { protect } = require('../controllers/authController');
const router = express.Router();

router.use(protect);

// Get all unique conversation partners and their latest messages for the logged-in user
router.get('/direct/conversations', async (req, res) => {
  try {
    const userId = req.user._id;

    // Retrieve unique conversations using aggregation
    const conversations = await DirectMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: [{ $toString: '$sender' }, { $toString: '$recipient' }] },
              { p1: '$sender', p2: '$recipient' },
              { p1: '$recipient', p2: '$sender' }
            ]
          },
          latestMessage: { $first: '$$ROOT' }
        }
      },
      {
        $sort: { 'latestMessage.createdAt': -1 }
      }
    ]);

    // Now populate partner info
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const partnerId = conv.latestMessage.sender.toString() === userId.toString()
          ? conv.latestMessage.recipient
          : conv.latestMessage.sender;
        
        const partner = await User.findById(partnerId).select('name role avatar profession');
        return {
          partner,
          latestMessage: conv.latestMessage
        };
      })
    );

    // Filter out if partner is not found (deleted)
    const activeConversations = populatedConversations.filter(c => c.partner);

    res.status(200).json({
      status: 'success',
      data: { conversations: activeConversations }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
});

// Send a direct message via REST (primary method - reliable, saves to DB)
router.post('/direct/send', async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ status: 'fail', message: 'recipientId and text are required.' });
    }

    const directMsg = await DirectMessage.create({
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim()
    });

    const populated = await DirectMessage.findById(directMsg._id)
      .populate('sender', 'name role avatar')
      .populate('recipient', 'name role avatar');

    // Trigger Socket.io real-time update
    const io = req.app.get('io');
    if (io) {
      const roomKey = [req.user._id.toString(), recipientId.toString()].sort().join('_');
      // Emit message to the direct chat room
      io.to(`dm_${roomKey}`).emit('receive_direct_message', populated);
      
      // Emit notification signal to both the recipient's and the sender's personal rooms
      io.to(`user_${recipientId}`).emit('new_direct_message_notification', populated);
      io.to(`user_${req.user._id}`).emit('new_direct_message_notification', populated);

      // Create persistent database notification & emit new_notification
      const { createNotification } = require('../utils/notificationHelper');
      await createNotification(io, {
        recipient: recipientId,
        sender: req.user._id,
        type: 'message',
        title: req.user.name,
        message: text.trim(),
        link: '/messages'
      });
    }

    res.status(201).json({
      status: 'success',
      data: { message: populated }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
});

// Get direct messages history between logged-in user and partnerId
router.get('/direct/:partnerId', async (req, res) => {
  try {
    const userId = req.user._id;
    const partnerId = req.params.partnerId;

    // Mark any unread message notifications from this partner as read
    const Notification = require('../models/Notification');
    await Notification.updateMany({
      recipient: userId,
      sender: partnerId,
      type: 'message',
      isRead: false
    }, { isRead: true });

    // Emit a socket signal so the client knows notifications have updated
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notifications_updated');
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: userId, recipient: partnerId },
        { sender: partnerId, recipient: userId }
      ]
    })
    .populate('sender', 'name role avatar')
    .populate('recipient', 'name role avatar')
    .sort('createdAt');

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
});

// Get messages for a booking
router.get('/:bookingId', async (req, res) => {
  try {
    const messages = await Message.find({ booking: req.params.bookingId })
      .populate('sender', 'name role')
      .sort('createdAt');
    res.status(200).json({ status: 'success', data: { messages } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
});

module.exports = router;
