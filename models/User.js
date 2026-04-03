const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true, minlength: 6 },
  role:           { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  avatar:         { type: String, default: null },
  googleId:       { type: String, default: null },
  resetOtp:       { type: String, default: null },
  resetOtpExpiry: { type: Date,   default: null },
  refreshTokens:  [{ type: String }],

  // Seller profile
  sellerProfile: {
    shopName:    { type: String, default: '' },
    shopDesc:    { type: String, default: '' },
    phone:       { type: String, default: '' },
    city:        { type: String, default: '' },
    state:       { type: String, default: '' },
    approved:    { type: Boolean, default: true },
    totalSales:  { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    joinedAt:    { type: Date, default: Date.now },
  },

  // Verification status
  verification: {
    email:       { type: Boolean, default: false },
    phone:       { type: Boolean, default: false },
    identity:    { type: Boolean, default: false },
    address:     { type: Boolean, default: false },
  },

  // Trust score (0-100)
  trustScore: { type: Number, default: 0 },

  // Saved searches
  savedSearches: [{
    query:      { type: String },
    category:   { type: String },
    minPrice:   { type: Number },
    maxPrice:   { type: Number },
    location:   { type: String },
    alertEnabled: { type: Boolean, default: true },
    createdAt:  { type: Date, default: Date.now },
  }],

  // Wishlist
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.resetOtp;
  delete obj.resetOtpExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
