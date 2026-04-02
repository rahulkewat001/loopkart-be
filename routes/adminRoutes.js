const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { isAdmin, getDashboard, getAllUsers, getAllOrders, updateOrderStatus, createProduct, updateProduct, deleteProduct } = require('../controllers/adminController');

router.use(protect, isAdmin);

router.get('/dashboard',           getDashboard);
router.get('/users',               getAllUsers);
router.get('/orders',              getAllOrders);
router.put('/orders/:id/status',   updateOrderStatus);
router.post('/products',           createProduct);
router.put('/products/:id',        updateProduct);
router.delete('/products/:id',     deleteProduct);

module.exports = router;
