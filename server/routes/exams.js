const express = require('express');
const router = express.Router();
const {
  createExam,
  getExams,
  getExam,
  submitExamResult,
  updateExam,
  deleteExam,
  createExamWithFile,
  examUpload
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('teacher'), createExam);
router.post('/upload', authorize('teacher'), examUpload.array('files', 5), createExamWithFile);
router.get('/', getExams);
router.get('/:id', getExam);
router.post('/:id/submit', authorize('teacher', 'student', 'admin'), submitExamResult);
router.put('/:id', authorize('teacher'), updateExam);
router.delete('/:id', authorize('teacher'), deleteExam);

module.exports = router;
