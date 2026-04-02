const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    emoji:    String,
    price:    Number,
    quantity: Number,
  }],
  totalAmount:     { type: Number, required: true },
  paymentId:       { type: String, default: null },
  paymentStatus:   { type: String, enum: ['pending','paid'], default: 'pending' },
  couponCode:      { type: String, default: null },
  discountAmount:  { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed',
  },
  timeline: [{
    status:    String,
    message:   String,
    timestamp: { type: Date, default: Date.now },
  }],
  address: {
    fullName: String,
    phone:    String,
    street:   String,
    city:     String,
    state:    String,
    pincode:  String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
