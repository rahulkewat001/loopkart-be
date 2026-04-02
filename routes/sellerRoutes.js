const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  isSeller, becomeSeller, getSellerDashboard,
  createListing, getMyListings, updateListing,
  deleteListing, markAsSold, updateSellerProfile,
} = require('../controllers/sellerController');

// Become a seller (any logged-in user)
router.post('/become', protect, becomeSeller);

// Seller-only routes
router.get('/dashboard',          protect, isSeller, getSellerDashboard);
router.get('/listings',           protect, isSeller, getMyListings);
router.post('/listings',          protect, isSeller, createListing);
router.put('/listings/:id',       protect, isSeller, updateListing);
router.delete('/listings/:id',    protect, isSeller, deleteListing);
router.put('/listings/:id/sold',  protect, isSeller, markAsSold);
router.put('/profile',            protect, isSeller, updateSellerProfile);

module.exports = router;
