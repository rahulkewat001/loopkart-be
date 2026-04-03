const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const { getMe, updateMe, changePassword, uploadAvatar } = require('../controllers/profileController');

router.use(protect);
router.get('/me',              getMe);
router.put('/me',              updateMe);
router.put('/change-password', changePassword);
router.post('/avatar',         upload.single('avatar'), uploadAvatar);

module.exports = router;
