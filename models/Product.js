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
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
