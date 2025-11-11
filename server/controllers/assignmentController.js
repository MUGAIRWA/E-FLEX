const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/Teacher
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      dueDate,
      totalMarks,
      instructions
    } = req.body;

    // Verify course exists and teacher owns it
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseDoc.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course,
      teacher: req.user._id,
      dueDate,
      totalMarks,
      instructions,
      attachments: req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/assignments/${file.filename}`
      })) : []
    });

    if (assignment) {
      // Emit notification to students
      const io = req.app.get('io');
      courseDoc.students.forEach(studentId => {
        io.to(studentId.toString()).emit('notification', {
          title: 'New Assignment',
          message: `New assignment "${title}" has been posted in ${courseDoc.title}`,
          type: 'info',
          link: `/student/assignments/${assignment._id}`
        });
      });

      res.status(201).json(assignment);
    } else {
      res.status(400).json({ message: 'Invalid assignment data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res) => {
  try {
    const { course, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      // Find courses student is enrolled in
      const studentCourses = await Course.find({ students: req.user._id }).select('_id');
      const courseIds = studentCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    if (course) query.course = course;

    const assignments = await Assignment.find(query)
      .populate('course', 'title subject')
      .populate('teacher', 'firstName lastName')
      .populate('submissions.student', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Assignment.countDocuments(query);

    res.json({
      assignments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title subject teacher')
      .populate('teacher', 'firstName lastName')
      .populate('submissions.student', 'firstName lastName admissionNumber')
      .populate('submissions.gradedBy', 'firstName lastName');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permissions
    if (req.user.role === 'student') {
      const course = await Course.findById(assignment.course);
      if (!course.students.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to access this assignment' });
      }
    } else if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this assignment' });
    }

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.course);
    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to submit this assignment' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    const { content } = req.body;

    const submission = {
      student: req.user._id,
      content,
      attachments: req.files ? req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/assignments/${file.filename}`
      })) : []
    };

    assignment.submissions.push(submission);
    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Grade assignment
// @route   PUT /api/assignments/:id/grade/:studentId
// @access  Private/Teacher
const gradeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to grade this assignment' });
    }

    const { studentId } = req.params;
    const { marks, feedback } = req.body;

    const submission = assignment.submissions.find(
      sub => sub.student.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user._id;
    submission.status = 'graded';

    await assignment.save();

    // Emit notification to student
    const io = req.app.get('io');
    io.to(studentId).emit('notification', {
      title: 'Assignment Graded',
      message: `Your assignment "${assignment.title}" has been graded`,
      type: 'success',
      link: `/student/assignments/${assignment._id}`
    });

    res.json({ message: 'Assignment graded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    const {
      title,
      description,
      dueDate,
      totalMarks,
      instructions,
      isActive
    } = req.body;

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.totalMarks = totalMarks || assignment.totalMarks;
    assignment.instructions = instructions || assignment.instructions;
    assignment.isActive = isActive !== undefined ? isActive : assignment.isActive;

    const updatedAssignment = await assignment.save();

    res.json(updatedAssignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await assignment.deleteOne();

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  submitAssignment,
  gradeAssignment,
  updateAssignment,
  deleteAssignment,
  upload
};
