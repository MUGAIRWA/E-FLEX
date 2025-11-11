const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getConversationMessages,
  markAsRead,
  getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:conversationId', getConversationMessages);
router.put('/:conversationId/read', markAsRead);

module.exports = router;
