const express = require('express');
const { register, login, getMe, protect, verifyEmail, resendVerification } = require('../controllers/authController');
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
module.exports = router;
