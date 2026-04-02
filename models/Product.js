const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  emoji:         { type: String, default: '📦' },
  image:         { type: String, default: '' },
  images:        [{ type: String }],
  price:         { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  rating:        { type: Number, default: 0 },
  reviews:       { type: Number, default: 0 },
  badge:         { type: String, default: null },
  category:      { type: String, required: true },
  description:   { type: String, default: '' },
  stock:         { type: Number, default: 1 },
  seller:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sellerName:    { type: String, default: 'LoopKart' },
  condition:     { type: String, enum: ['new', 'like_new', 'good', 'fair'], default: 'new' },
  isSellerListing: { type: Boolean, default: false },
  status:        { type: String, enum: ['active', 'sold', 'inactive'], default: 'active' },
  views:         { type: Number, default: 0 },
  favorites:     { type: Number, default: 0 },
  
  // Price history for tracking
  priceHistory: [{
    price: { type: Number },
    date:  { type: Date, default: Date.now },
  }],

  // Location for local pickup
  location: {
    city:      { type: String, default: '' },
    state:     { type: String, default: '' },
    pincode:   { type: String, default: '' },
    latitude:  { type: Number },
    longitude: { type: Number },
  },

  // Delivery options
  delivery: {
    available:     { type: Boolean, default: false },
    freeShipping:  { type: Boolean, default: false },
    shippingCost:  { type: Number, default: 0 },
    estimatedDays: { type: Number, default: 3 },
  },

  // Negotiation
  negotiable: { type: Boolean, default: true },
  minPrice:   { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
