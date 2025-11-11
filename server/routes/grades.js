const express = require('express');
const router = express.Router();
const {
  getStudentGrades,
  getCourseGrades,
  addGrade,
  updateGrade,
  deleteGrade
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/student/:studentId', getStudentGrades);
router.get('/course/:courseId', authorize('teacher'), getCourseGrades);
router.post('/', authorize('teacher'), addGrade);
router.put('/:gradeId/item/:itemId', authorize('teacher'), updateGrade);
router.delete('/:gradeId/item/:itemId', authorize('teacher'), deleteGrade);

module.exports = router;
