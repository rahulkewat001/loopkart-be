const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { startChat, getMyChats, getChat, sendMessage, getUnreadCount } = require('../controllers/chatController');

router.use(protect);
router.post('/',              startChat);
router.get('/',               getMyChats);
router.get('/unread',         getUnreadCount);
router.get('/:id',            getChat);
router.post('/:id/messages',  sendMessage);

module.exports = router;
