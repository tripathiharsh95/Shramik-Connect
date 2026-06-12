const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.ObjectId, ref: 'User' },
  category: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, default: '' }, // e.g. "02:30 PM"
  city: { type: String, required: true },
  area: { type: String, required: true },
  description: { type: String },
  // Customer profile snapshot for this booking
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  customerState: { type: String, default: '' },
  customerCity: { type: String, default: '' },
  customerPinCode: { type: String, default: '' },
  customerFullAddress: { type: String, default: '' },
  note: { type: String, default: '' },
  paymentMode: { type: String, enum: ['cash', 'online', 'upi', 'bank'], default: 'cash' },
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  price: { type: Number, default: 0 },
  upiTransactionId: { type: String, trim: true },
  workerType: { type: String, enum: ['individual', 'team'], default: 'individual' },
  teamRange: { type: String, enum: ['', '1-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30+'], default: '' },
  latitude: { type: Number },
  longitude: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
