const express = require('express');
const router = express.Router();
const {
  createStudent,
  createTeacher,
  createParent,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/userManagementController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.post('/students', createStudent);
router.post('/teachers', createTeacher);
router.post('/parents', createParent);
router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
