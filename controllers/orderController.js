const Order = require('../models/Order');
const { createNotification } = require('./notificationController');

const COUPONS = {
  'LOOP40':  { discount: 40, type: 'percent' },
  'SAVE100': { discount: 100, type: 'flat' },
  'FIRST50': { discount: 50, type: 'percent' },
};

const validateCoupon = (req, res) => {
  const { code, amount } = req.body;
  const coupon = COUPONS[code?.toUpperCase()];
  if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });

  const discount = coupon.type === 'percent'
    ? Math.round((amount * coupon.discount) / 100)
    : coupon.discount;

  res.json({ valid: true, discount, message: `Coupon applied! You save ₹${discount}` });
};

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, couponCode, discountAmount } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No items in order' });

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      address,
      couponCode:     couponCode || null,
      discountAmount: discountAmount || 0,
      timeline: [{ status: 'confirmed', message: 'Order placed successfully' }],
    });

    // Send notification
    await createNotification({
      userId:  req.user._id,
      type:    'order',
      title:   'Order Placed! 🎉',
      message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been confirmed.`,
      link:    '/orders',
      icon:    '📦',
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['delivered', 'cancelled'].includes(order.status))
      return res.status(400).json({ message: `Cannot cancel a ${order.status} order` });

    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', message: 'Order cancelled by user' });
    await order.save();

    await createNotification({
      userId:  req.user._id,
      type:    'order',
      title:   'Order Cancelled',
      message: `Order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled.`,
      link:    '/orders',
      icon:    '❌',
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder, validateCoupon };
