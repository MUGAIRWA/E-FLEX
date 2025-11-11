const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getCourseAttendance,
  getStudentAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('teacher'), markAttendance);
router.post('/bulk', authorize('teacher'), bulkMarkAttendance);
router.get('/course/:courseId', getCourseAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.put('/:id', authorize('teacher'), updateAttendance);
router.delete('/:id', authorize('teacher'), deleteAttendance);

module.exports = router;
