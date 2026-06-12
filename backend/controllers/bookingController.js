const Booking = require('../models/Booking');
const { createNotification } = require('../utils/notificationHelper');

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({
      customer: req.user.id,
      worker: req.body.worker,
      category: req.body.category,
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime || '',
      city: req.body.city,
      area: req.body.area,
      description: req.body.description,
      customerName: req.body.customerName || '',
      customerPhone: req.body.customerPhone || '',
      customerState: req.body.customerState || '',
      customerCity: req.body.customerCity || '',
      customerPinCode: req.body.customerPinCode || '',
      customerFullAddress: req.body.customerFullAddress || '',
      note: req.body.note || '',
      paymentMode: req.body.paymentMode || 'cash',
      price: req.body.price || 0,
      upiTransactionId: req.body.upiTransactionId || undefined,
      workerType: req.body.workerType || 'individual',
      teamRange: req.body.teamRange || undefined,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });

    // Notify the worker
    const io = req.app.get('io');
    if (booking.worker) {
      await createNotification(io, {
        recipient: booking.worker,
        sender: req.user._id,
        type: 'booking',
        title: 'New Booking Request',
        message: `You have been booked by ${req.user.name} for ${booking.category}.`,
        link: '/bookings'
      });
    }

    res.status(201).json({ status: 'success', data: { booking } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const filter = { $or: [{ customer: req.user.id }, { worker: req.user.id }] };
    if (req.query.status) filter.status = req.query.status;

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const count = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('worker customer', 'name phone email profession city area rating avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      status: 'success', 
      results: bookings.length, 
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalResults: count
      },
      data: { bookings } 
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ status: 'fail', message: 'No booking found' });

    // Auth check: Is the current user the customer, worker, or an admin?
    const isCustomer = booking.customer.toString() === req.user.id;
    const isWorker = booking.worker && booking.worker.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this booking status.' });
    }

    const oldStatus = booking.status;
    booking.status = req.body.status;
    await booking.save();

    // Trigger notification on status change
    const io = req.app.get('io');
    if (isWorker && booking.customer) {
      // Worker updated the status, notify the customer
      await createNotification(io, {
        recipient: booking.customer,
        sender: req.user._id,
        type: 'booking',
        title: 'Booking Update',
        message: `Your booking for ${booking.category} has been marked as ${booking.status} by ${req.user.name}.`,
        link: '/bookings'
      });
    } else if (isCustomer && booking.worker) {
      // Customer updated the status (e.g. cancelled), notify the worker
      await createNotification(io, {
        recipient: booking.worker,
        sender: req.user._id,
        type: 'booking',
        title: 'Booking Update',
        message: `Your booking for ${booking.category} has been marked as ${booking.status} by ${req.user.name}.`,
        link: '/bookings'
      });
    }

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const count = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate('worker customer', 'name phone profession city area')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      status: 'success', 
      results: bookings.length, 
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalResults: count
      },
      data: { bookings } 
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

