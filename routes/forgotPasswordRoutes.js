const router = require('express').Router();
const { forgotPassword, resetPassword } = require('../controllers/forgotPasswordController');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

module.exports = router;
