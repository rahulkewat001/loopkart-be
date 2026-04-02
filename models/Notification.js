const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['order', 'message', 'review', 'seller', 'system'], default: 'system' },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: '' },
  read:    { type: Boolean, default: false },
  icon:    { type: String, default: '🔔' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
