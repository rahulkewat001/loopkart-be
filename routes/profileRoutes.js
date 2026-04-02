const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { getMe, updateMe, changePassword } = require('../controllers/profileController');

router.use(protect);
router.get('/me',              getMe);
router.put('/me',              updateMe);
router.put('/change-password', changePassword);

module.exports = router;
