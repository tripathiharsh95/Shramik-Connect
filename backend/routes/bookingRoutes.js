const express = require('express');
const { createBooking, getMyBookings, updateBookingStatus, getAllBookings } = require('../controllers/bookingController');
const { protect, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.use(protect);

router.route('/')
  .post(createBooking)
  .get(getMyBookings);

router.get('/all', restrictTo('admin'), getAllBookings);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;

