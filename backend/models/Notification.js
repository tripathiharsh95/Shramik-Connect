const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['message', 'booking', 'other'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
