const express = require('express');
const router = express.Router();
const {
  createStudent,
  createTeacher,
  createParent,
  getUsers,
  getUserStats,
  updateUser,
  deleteUser
} = require('../controllers/userManagementController');

const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers);
router.route('/stats').get(getUserStats);
router.route('/:id').put(updateUser).delete(deleteUser);

// Role-specific creation routes
router.post('/students', createStudent);
router.post('/teachers', createTeacher);
router.post('/parents', createParent);

module.exports = router;
