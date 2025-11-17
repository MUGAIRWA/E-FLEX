const express = require('express');
const router = express.Router();
const { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, addTeacherToSubject, removeTeacherFromSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getSubjects);
router.get('/:id', getSubject);

// Protected routes (require authentication)
router.post('/', protect, createSubject);
router.put('/:id', protect, updateSubject);
router.delete('/:id', protect, deleteSubject);
router.post('/:id/teachers', protect, addTeacherToSubject);
router.delete('/:id/teachers/:teacherId', protect, removeTeacherFromSubject);

module.exports = router;
