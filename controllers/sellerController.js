const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');

// ─── Middleware: seller only ───────────────────────────────────
const isSeller = (req, res, next) => {
  if (!['seller', 'admin'].includes(req.user?.role))
    return res.status(403).json({ message: 'Seller access required' });
  next();
};

// ─── Become a Seller ──────────────────────────────────────────
const becomeSeller = async (req, res) => {
  try {
    const { shopName, shopDesc, phone, city, state } = req.body;
    if (!shopName || !phone || !city || !state)
      return res.status(400).json({ message: 'All fields are required' });

    if (req.user.role === 'seller')
      return res.status(400).json({ message: 'You are already a seller' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        role: 'seller',
        sellerProfile: { shopName, shopDesc, phone, city, state, approved: true, joinedAt: new Date() },
      },
      { new: true }
    ).select('-password -refreshTokens');

    res.json({ message: 'Seller account created!', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Get Seller Dashboard Stats ───────────────────────────────
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const [listings, orders] = await Promise.all([
      Product.find({ seller: sellerId }),
      Order.find({ 'items.product': { $in: await Product.find({ seller: sellerId }).distinct('_id') } }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.items.filter((item) =>
        listings.some((p) => p._id.toString() === item.product?.toString())
      );
      return sum + sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
    }, 0);

    const activeListings = listings.filter((p) => p.status === 'active').length;
    const soldListings   = listings.filter((p) => p.status === 'sold').length;
    const totalViews     = listings.reduce((s, p) => s + (p.views || 0), 0);

    res.json({
      totalListings: listings.length,
      activeListings,
      soldListings,
      totalOrders:  orders.length,
      totalRevenue,
      totalViews,
      recentListings: listings.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── List a Product ───────────────────────────────────────────
const createListing = async (req, res) => {
  try {
    const { name, emoji, price, originalPrice, category, description, stock, condition, badge } = req.body;

    if (!name || !price || !category)
      return res.status(400).json({ message: 'Name, price and category are required' });

    const product = await Product.create({
      name, emoji: emoji || '📦', price, originalPrice: originalPrice || price,
      category, description, stock: stock || 1,
      condition: condition || 'good', badge: badge || null,
      seller: req.user._id,
      sellerName: req.user.sellerProfile?.shopName || req.user.name,
      isSellerListing: true,
      status: 'active',
    });

    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Get My Listings ──────────────────────────────────────────
const getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Update Listing ───────────────────────────────────────────
const updateListing = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: 'Listing not found' });

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Delete Listing ───────────────────────────────────────────
const deleteListing = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
    if (!product) return res.status(404).json({ message: 'Listing not found' });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Mark as Sold ─────────────────────────────────────────────
const markAsSold = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { status: 'sold' },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Listing not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Update Seller Profile ────────────────────────────────────
const updateSellerProfile = async (req, res) => {
  try {
    const { shopName, shopDesc, phone, city, state } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'sellerProfile.shopName': shopName, 'sellerProfile.shopDesc': shopDesc, 'sellerProfile.phone': phone, 'sellerProfile.city': city, 'sellerProfile.state': state } },
      { new: true }
    ).select('-password -refreshTokens');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { isSeller, becomeSeller, getSellerDashboard, createListing, getMyListings, updateListing, deleteListing, markAsSold, updateSellerProfile };
