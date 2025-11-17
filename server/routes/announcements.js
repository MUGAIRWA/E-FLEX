const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAnnouncements);
router.get('/:id', protect, getAnnouncement);
router.post('/', protect, authorize('teacher', 'admin'), createAnnouncement);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAnnouncement);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAnnouncement);

module.exports = router;
