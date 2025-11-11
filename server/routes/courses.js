const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  enrollStudent,
  removeStudent,
  deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('admin'), createCourse);
router.get('/', getCourses);
router.get('/:id', getCourse);
router.put('/:id', authorize('admin', 'teacher'), updateCourse);
router.post('/:id/enroll', authorize('admin', 'teacher'), enrollStudent);
router.delete('/:id/students/:studentId', authorize('admin', 'teacher'), removeStudent);
router.delete('/:id', authorize('admin'), deleteCourse);

module.exports = router;
