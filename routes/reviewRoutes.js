const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { addReview, getReviews } = require('../controllers/reviewController');

router.get('/:id/reviews',  getReviews);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
