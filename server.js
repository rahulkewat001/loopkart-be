require('dotenv').config();
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const jwt          = require('jsonwebtoken');
const connectDB    = require('./config/db');
const Chat         = require('./models/Chat');
const User         = require('./models/User');

const authRoutes           = require('./routes/authRoutes');
const profileRoutes        = require('./routes/profileRoutes');
const productRoutes        = require('./routes/productRoutes');
const orderRoutes          = require('./routes/orderRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const paymentRoutes        = require('./routes/paymentRoutes');
const reviewRoutes         = require('./routes/reviewRoutes');
const adminRoutes          = require('./routes/adminRoutes');
const sellerRoutes         = require('./routes/sellerRoutes');
const chatRoutes           = require('./routes/chatRoutes');
const notificationRoutes   = require('./routes/notificationRoutes');
const uploadRoutes         = require('./routes/uploadRoutes');
const savedSearchRoutes    = require('./routes/savedSearchRoutes');

connectDB();

const app    = express();
const server = http.createServer(app);

// ─── Socket.IO Setup ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://loopkarts.in',
  'https://www.loopkarts.in',
  'https://loopkart-be.onrender.com'
];

const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    credentials: true 
  },
});

// Online users map: userId -> socketId
const onlineUsers = new Map();

// Socket.IO auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user    = await User.findById(decoded.id).select('name role');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Auth failed'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);

  console.log(`✅ User connected: ${socket.user.name} (${userId})`);
  console.log(`👥 Total online users: ${onlineUsers.size}`);

  // Notify others this user is online
  socket.broadcast.emit('user_online', userId);

  // Send current online users to this socket
  socket.emit('online_users', Array.from(onlineUsers.keys()));

  // ─── Join a chat room ──────────────────────────────────────
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`💬 User ${socket.user.name} joined chat: ${chatId}`);
  });

  // ─── Send message ──────────────────────────────────────────
  socket.on('send_message', async ({ chatId, text }) => {
    try {
      if (!text?.trim()) return;

      console.log(`📨 Message from ${socket.user.name}: ${text.trim()}`);

      const chat = await Chat.findOne({ _id: chatId, participants: socket.user._id });
      if (!chat) {
        console.log('❌ Chat not found or user not participant');
        return;
      }

      const message = { sender: socket.user._id, text: text.trim(), read: false, createdAt: new Date() };
      chat.messages.push(message);
      chat.lastMessage   = text.trim();
      chat.lastMessageAt = new Date();
      await chat.save();

      const savedMsg = chat.messages[chat.messages.length - 1];

      console.log(`✅ Message saved, emitting to room: ${chatId}`);

      // Emit to everyone in the chat room
      io.to(chatId).emit('new_message', {
        chatId,
        message: {
          _id:       savedMsg._id,
          sender:    socket.user._id,
          senderName: socket.user.name,
          text:      savedMsg.text,
          read:      false,
          createdAt: savedMsg.createdAt,
        },
      });

      // Notify other participant if not in room
      const otherParticipant = chat.participants.find((p) => p.toString() !== userId);
      if (otherParticipant) {
        const otherSocketId = onlineUsers.get(otherParticipant.toString());
        if (otherSocketId) {
          io.to(otherSocketId).emit('chat_notification', {
            chatId,
            senderName: socket.user.name,
            text:       text.trim(),
          });
        }
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ─── Typing indicator ──────────────────────────────────────
  socket.on('typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('typing', { userId, isTyping });
  });

  // ─── Mark messages as read ─────────────────────────────────
  socket.on('mark_read', async ({ chatId }) => {
    try {
      await Chat.updateOne(
        { _id: chatId },
        { $set: { 'messages.$[msg].read': true } },
        { arrayFilters: [{ 'msg.sender': { $ne: socket.user._id }, 'msg.read': false }] }
      );
      socket.to(chatId).emit('messages_read', { chatId, readBy: userId });
    } catch {}
  });

  // ─── Disconnect ────────────────────────────────────────────
  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    socket.broadcast.emit('user_offline', userId);
    console.log(`❌ User disconnected: ${socket.user.name} (${userId})`);
    console.log(`👥 Total online users: ${onlineUsers.size}`);
  });
});

// ─── Express Middleware ───────────────────────────────────────
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/auth',     forgotPasswordRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products', reviewRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payment',  paymentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/seller',        sellerRoutes);
app.use('/api/chats',         chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/saved-searches', savedSearchRoutes);

app.get('/', (req, res) => res.send('Hey , I am healthy!'));

const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
