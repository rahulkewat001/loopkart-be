const Review  = require('../models/Review');
const Product = require('../models/Product');

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    const review = await Review.create({
      product: productId,
      user:    req.user._id,
      name:    req.user.name,
      rating,
      comment,
    });

    // Update product rating
    const reviews   = await Review.find({ product: productId });
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { rating: Math.round(avgRating * 10) / 10, reviews: reviews.length });

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addReview, getReviews };
