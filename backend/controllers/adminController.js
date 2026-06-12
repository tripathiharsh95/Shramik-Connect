const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getStats = async (req, res) => {
  try {
    const totalLabour = await User.countDocuments({ role: 'worker' });
    const openRequests = await Booking.countDocuments({ status: 'pending' });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'in_progress'] } });
    const completed = await Booking.countDocuments({ status: 'completed' });
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const recentBookings = await Booking.find().populate('worker customer', 'name profession city area').sort('-createdAt').limit(10);

    res.status(200).json({
      status: 'success',
      data: { totalLabour, openRequests, activeBookings, completed, revenue, recentBookings }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
