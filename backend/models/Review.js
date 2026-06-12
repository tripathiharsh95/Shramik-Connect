const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  booking: { type: mongoose.Schema.ObjectId, ref: 'Booking', required: true },
  worker: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

reviewSchema.index({ booking: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
