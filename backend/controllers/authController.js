const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, getVerificationEmailTemplate } = require('../utils/email');

if (!process.env.JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not defined in the environment variables!');
  process.exit(1);
}

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '30d' 
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, pwd, role, phone, profession, skills, hourlyRate, rateType, city, state, area, bio, about, avatar, gender } = req.body;
    // Use pwd if password not provided
    const rawPassword = password || pwd;
    if (!name || !email || !rawPassword) {
      return res.status(400).json({ status: 'fail', message: 'Name, email and password are required.' });
    }
    if (phone && !/^\+91\d{10}$/.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({ status: 'fail', message: 'Phone number must start with +91 and contain exactly 10 digits.' });
    }
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email already in use. Please login or use a different email.' });
    }
    // Enforce role restriction
    const secureRole = (role === 'worker' || role === 'customer') ? role : 'customer';
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = await User.create({
      name,
      email,
      password: rawPassword,
      role: secureRole,
      phone,
      profession,
      skills,
      hourlyRate,
      rateType: rateType || 'day',
      city,
      state,
      area,
      bio: bio || about,
      about: about || bio,
      avatar,
      gender,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(newUser.email)}`;
    const html = getVerificationEmailTemplate(newUser.name, verifyUrl);

    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Verify your email - Shramik Connect',
        html
      });
      res.status(201).json({
        status: 'success',
        message: 'Verification link sent to email! Please check your inbox.'
      });
    } catch (mailErr) {
      console.error('Mail sending failed, removing created user:', mailErr);
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        status: 'fail',
        message: 'There was an error sending the verification email. Please try registering again.'
      });
    }
  } catch (err) {
    // Handle duplicate email (MongoDB unique index error)
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ status: 'fail', message: 'Email already in use. Please login or use a different email.' });
    }
    // If Mongoose validation error, send detailed messages
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join('. ');
      return res.status(400).json({ status: 'fail', message: messages });
    }
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: 'fail', message: 'Please provide email/phone and password' });
    
    // Check if user is logging in with email or phone number (+91XXXXXXXXXX)
    const cleanedEmailOrPhone = email.trim();
    const user = await User.findOne({
      $or: [
        { email: cleanedEmailOrPhone.toLowerCase() },
        { phone: cleanedEmailOrPhone.replace(/\s+/g, '') }
      ]
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email/phone or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        status: 'fail',
        isEmailVerified: false,
        email: user.email,
        message: 'Your email address is not verified. Please check your email for the verification link.'
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ status: 'fail', message: 'Please log in to get access.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return res.status(401).json({ status: 'fail', message: 'User no longer exists.' });
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: 'Invalid token.' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token) {
      return res.status(400).json({ status: 'fail', message: 'Token is missing.' });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Fallback: If token not found, check if this email is already verified.
      // This handles link double-clicks and security pre-scans from email providers.
      if (email) {
        const verifiedUser = await User.findOne({ email });
        if (verifiedUser && verifiedUser.isEmailVerified) {
          return createSendToken(verifiedUser, 200, res);
        }
      }
      return res.status(400).json({ status: 'fail', message: 'Verification link is invalid or has expired.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email address.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'No account found with this email.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ status: 'fail', message: 'This email is already verified.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
    const html = getVerificationEmailTemplate(user.name, verifyUrl);

    await sendEmail({
      email: user.email,
      subject: 'Verify your email - Shramik Connect',
      html
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification link resent to email!'
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

