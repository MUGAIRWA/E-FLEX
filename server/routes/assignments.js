const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  getAssignment,
  submitAssignment,
  gradeAssignment,
  updateAssignment,
  deleteAssignment,
  upload
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('teacher'), upload.array('attachments', 5), createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.post('/:id/submit', authorize('student'), upload.array('attachments', 5), submitAssignment);
router.put('/:id/grade/:studentId', authorize('teacher'), gradeAssignment);
router.put('/:id', authorize('teacher'), updateAssignment);
router.delete('/:id', authorize('teacher'), deleteAssignment);

module.exports = router;
