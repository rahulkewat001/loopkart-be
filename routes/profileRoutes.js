const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { getMe, updateMe, changePassword, updateAvatar } = require('../controllers/profileController');

router.use(protect);
router.get('/me',              getMe);
router.put('/me',              updateMe);
router.put('/change-password', changePassword);
router.put('/avatar',          updateAvatar);

module.exports = router;
