const express = require('express');
const { getStats } = require('../controllers/adminController');
const { protect, restrictTo } = require('../controllers/authController');
const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getStats);

module.exports = router;

