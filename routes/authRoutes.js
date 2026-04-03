const router = require('express').Router();
const { register, login, googleAuth, logout, refreshToken } = require('../controllers/authController');

router.post('/register',      register);
router.post('/login',         login);
router.post('/google',        googleAuth);
router.post('/logout',        logout);
router.post('/refresh-token', refreshToken);

module.exports = router;
