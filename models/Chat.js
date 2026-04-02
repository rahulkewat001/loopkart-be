const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:     { type: String, required: true, trim: true },
  read:     { type: Boolean, default: false },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  productName:  { type: String, default: '' },
  productEmoji: { type: String, default: '📦' },
  messages:     [messageSchema],
  lastMessage:  { type: String, default: '' },
  lastMessageAt:{ type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
