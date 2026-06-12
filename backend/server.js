const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Message = require('./models/Message');
const DirectMessage = require('./models/DirectMessage');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);


// Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '5mb' }));

// Express 5 query getter compatibility workaround for express-mongo-sanitize
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true
  });
  next();
});
app.use(mongoSanitize());


const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, try again later.' });
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'success', message: 'API running' }));

// 404 Route Handler for undefined api paths
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'fail', message: `Can't find ${req.originalUrl} on this server!` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || 'Something went wrong on the server!'
  });
});

// Authenticate Socket.io Handshake via JWT
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: Token is required.'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new Error('Authentication error: User no longer exists.'));
    }
    socket.user = currentUser;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid or expired token.'));
  }
});

// Socket.io events
io.on('connection', (socket) => {
  // Join personal room for notification signals
  socket.join(`user_${socket.user._id}`);

  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { bookingId, text } = data;
      // Use securely verified socket.user.id from authentication instead of client-supplied parameter
      const message = await Message.create({ booking: bookingId, sender: socket.user._id, text });
      const populated = await Message.findById(message._id).populate('sender', 'name role');
      io.to(`booking_${bookingId}`).emit('receive_message', populated);
    } catch (err) {
      socket.emit('error_message', { message: err.message });
    }
  });

  // --- Direct Chat ---
  socket.on('join_direct_chat', (data) => {
    const { partnerId } = data;
    const roomKey = [socket.user._id.toString(), partnerId.toString()].sort().join('_');
    socket.join(`dm_${roomKey}`);
  });

  socket.on('leave_direct_chat', (data) => {
    const { partnerId } = data;
    const roomKey = [socket.user._id.toString(), partnerId.toString()].sort().join('_');
    socket.leave(`dm_${roomKey}`);
  });

  socket.on('send_direct_message', async (data) => {
    try {
      const { recipientId, text } = data;
      const directMsg = await DirectMessage.create({
        sender: socket.user._id,
        recipient: recipientId,
        text
      });
      const populated = await DirectMessage.findById(directMsg._id)
        .populate('sender', 'name role avatar')
        .populate('recipient', 'name role avatar');
      
      const roomKey = [socket.user._id.toString(), recipientId.toString()].sort().join('_');
      
      // Emit message to the direct chat room
      io.to(`dm_${roomKey}`).emit('receive_direct_message', populated);
      
      // Emit notification signal to both the recipient's and the sender's personal rooms
      io.to(`user_${recipientId}`).emit('new_direct_message_notification', populated);
      io.to(`user_${socket.user._id}`).emit('new_direct_message_notification', populated);

      // Create persistent database notification & emit new_notification
      const { createNotification } = require('./utils/notificationHelper');
      await createNotification(io, {
        recipient: recipientId,
        sender: socket.user._id,
        type: 'message',
        title: socket.user.name,
        message: text.trim(),
        link: '/messages'
      });
    } catch (err) {
      socket.emit('error_message', { message: err.message });
    }
  });
});

// DB & Start
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/labour_booking')
  .then(() => { console.log('MongoDB connected'); server.listen(PORT, () => console.log(`Server on port ${PORT}`)); })
  .catch(err => { console.error('DB Error:', err); process.exit(1); });

