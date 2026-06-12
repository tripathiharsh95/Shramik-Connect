const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

const router = express.Router();

// All notification routes are protected (require user login)
router.use(protect);

router.route('/')
  .get(getNotifications)
  .delete(deleteAllNotifications);

router.patch('/read-all', markAllNotificationsRead);

router.route('/:id/read')
  .patch(markNotificationRead);

router.route('/:id')
  .delete(deleteNotification);

module.exports = router;
