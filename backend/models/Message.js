const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.ObjectId, ref: 'Booking', required: true },
  sender: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
