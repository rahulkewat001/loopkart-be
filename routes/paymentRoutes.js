const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');

router.use(protect);
router.post('/create-order', createPaymentOrder);
router.post('/verify',       verifyPayment);

module.exports = router;
