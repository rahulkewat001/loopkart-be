const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getOrder, cancelOrder, validateCoupon } = require('../controllers/orderController');

router.use(protect);
router.post('/',                createOrder);
router.get('/',                 getMyOrders);
router.post('/validate-coupon', validateCoupon);
router.get('/:id',              getOrder);
router.put('/:id/cancel',       cancelOrder);

module.exports = router;
