const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model('DirectMessage', directMessageSchema);
