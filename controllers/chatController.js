const Chat = require('../models/Chat');
const User = require('../models/User');

// ─── Start or get existing chat ───────────────────────────────
const startChat = async (req, res) => {
  try {
    const { sellerId, productId, productName, productEmoji } = req.body;
    const buyerId = req.user._id;

    if (buyerId.toString() === sellerId)
      return res.status(400).json({ message: 'You cannot chat with yourself' });

    // Verify the other user exists
    const otherUser = await User.findById(sellerId);
    if (!otherUser) return res.status(404).json({ message: 'User not found' });

    // Check if chat already exists for this buyer-seller-product combo
    let chat = await Chat.findOne({
      participants: { $all: [buyerId, sellerId] },
      product: productId || null,
    }).populate('participants', 'name role sellerProfile');

    if (!chat) {
      chat = await Chat.create({
        participants:  [buyerId, sellerId],
        product:       productId || null,
        productName:   productName || '',
        productEmoji:  productEmoji || '📦',
        messages:      [],
      });
      chat = await chat.populate('participants', 'name role sellerProfile');
    }

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Get all chats for current user ───────────────────────────
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name role sellerProfile')
      .sort({ lastMessageAt: -1 });

    // Add unread count for each chat
    const chatsWithUnread = chats.map((chat) => {
      const unread = chat.messages.filter(
        (m) => !m.read && m.sender.toString() !== req.user._id.toString()
      ).length;
      return { ...chat.toObject(), unreadCount: unread };
    });

    res.json({ chats: chatsWithUnread });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Get single chat with messages ────────────────────────────
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id,
    }).populate('participants', 'name role sellerProfile');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Mark all messages as read
    await Chat.updateOne(
      { _id: req.params.id },
      { $set: { 'messages.$[msg].read': true } },
      { arrayFilters: [{ 'msg.sender': { $ne: req.user._id }, 'msg.read': false }] }
    );

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Send a message (REST fallback) ───────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const chat = await Chat.findOne({ _id: req.params.id, participants: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = { sender: req.user._id, text: text.trim(), read: false };
    chat.messages.push(message);
    chat.lastMessage   = text.trim();
    chat.lastMessageAt = new Date();
    await chat.save();

    const newMsg = chat.messages[chat.messages.length - 1];
    res.json({ message: newMsg });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Get unread count ──────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id });
    const total = chats.reduce((sum, chat) =>
      sum + chat.messages.filter((m) => !m.read && m.sender.toString() !== req.user._id.toString()).length, 0
    );
    res.json({ unreadCount: total });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { startChat, getMyChats, getChat, sendMessage, getUnreadCount };
