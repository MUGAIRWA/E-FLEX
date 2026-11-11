const express = require('express');
const router = express.Router();
const {
  createAnyUser,
  createStudent,
  createTeacher,
  createParent,
  getUsers,
  getUsersByRole,
  getUserStats,
  updateUser,
  deleteUser
} = require('../controllers/userManagementController');

const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers).post(createAnyUser);
router.route('/stats').get(getUserStats);

// Role-specific list & creation routes
router.route('/students').get(getUsersByRole('student')).post(createStudent);
router.route('/teachers').get(getUsersByRole('teacher')).post(createTeacher);
router.route('/parents').get(getUsersByRole('parent')).post(createParent);

router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
