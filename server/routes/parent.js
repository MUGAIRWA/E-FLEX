const express = require('express');
const router = express.Router();
const {
  getParentProfile,
  updateParentProfile,
  changeParentPassword,
  getLinkedStudents,
  requestStudentRemoval,
  updateNotificationPreferences,
  updateAccessibilitySettings,
  getPaymentInfo,
  downloadReceipts
} = require('../controllers/parentController');

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and parent role
router.use(protect);
router.use(authorize('parent'));

router.get('/profile', getParentProfile);
router.put('/profile', updateParentProfile);
router.put('/change-password', changeParentPassword);
router.get('/students', getLinkedStudents);
router.post('/request-removal/:studentId', requestStudentRemoval);
router.put('/notifications', updateNotificationPreferences);
router.put('/accessibility', updateAccessibilitySettings);
router.get('/payments', getPaymentInfo);
router.get('/receipts', downloadReceipts);

module.exports = router;
