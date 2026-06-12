const express = require('express');
const { getAllWorkers, getWorker, updateProfile } = require('../controllers/userController');
const { protect } = require('../controllers/authController');
const router = express.Router();
router.get('/workers', getAllWorkers);
router.get('/:id', getWorker);
router.patch('/updateMe', protect, updateProfile);
module.exports = router;
