const express = require('express');
const router = express.Router();
const {
  createExam,
  getExams,
  getExam,
  submitExamResult,
  updateExam,
  deleteExam
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('teacher'), createExam);
router.get('/', getExams);
router.get('/:id', getExam);
router.post('/:id/submit', authorize('teacher'), submitExamResult);
router.put('/:id', authorize('teacher'), updateExam);
router.delete('/:id', authorize('teacher'), deleteExam);

module.exports = router;
