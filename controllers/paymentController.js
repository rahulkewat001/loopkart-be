const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay Order ────────────────────────────────────
const createPaymentOrder = async (req, res) => {
  try {
    console.log('Creating Razorpay order...');
    console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing');
    console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing');
    
    const { amount } = req.body; // amount in rupees
    console.log('Order amount:', amount);
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing!');
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }
    
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    });
    
    console.log('Razorpay order created:', order.id);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ message: 'Payment order creation failed', error: err.message });
  }
};

// ─── Verify Payment ───────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    await Order.findByIdAndUpdate(orderId, {
      paymentId:     razorpay_payment_id,
      paymentStatus: 'paid',
    });

    res.json({ message: 'Payment verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Verification error', error: err.message });
  }
};

module.exports = { createPaymentOrder, verifyPayment };
