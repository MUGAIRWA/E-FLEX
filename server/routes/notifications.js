const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createHelpRequest,
  getHelpRequests,
  replyToHelpRequest
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.get('/help-requests', protect, getHelpRequests);
router.post('/help-request', protect, authorize('student'), createHelpRequest);
router.post('/help-requests/:id/reply', protect, authorize('teacher', 'admin'), replyToHelpRequest);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.post('/', protect, authorize('admin'), createNotification);

module.exports = router;
