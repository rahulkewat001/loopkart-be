const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const { createNotification } = require('./notificationController');

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    ]);
    const revenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    res.json({ totalUsers, totalProducts, totalOrders, revenue: revenue[0]?.total || 0, recentOrders: orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshTokens').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status }, $push: { timeline: { status, message: `Order ${status}`, timestamp: new Date() } } },
      { new: true }
    );
    const icons = { shipped: '🚚', delivered: '📦', cancelled: '❌', confirmed: '✅' };
    await createNotification({
      userId:  order.user,
      type:    'order',
      title:   `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order #${order._id.toString().slice(-8).toUpperCase()} is now ${status}.`,
      link:    '/orders',
      icon:    icons[status] || '📦',
    });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { isAdmin, getDashboard, getAllUsers, getAllOrders, updateOrderStatus, createProduct, updateProduct, deleteProduct };
