const Exam = require('../models/Exam');
const Course = require('../models/Course');
const Grade = require('../models/Grade');

// @desc    Create exam
// @route   POST /api/exams
// @access  Private/Teacher
const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      examDate,
      duration,
      totalMarks,
      questions,
      instructions
    } = req.body;

    // Verify course exists and teacher owns it
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseDoc.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create exams for this course' });
    }

    const exam = await Exam.create({
      title,
      description,
      course,
      teacher: req.user._id,
      examDate: new Date(examDate),
      duration,
      totalMarks,
      questions,
      instructions
    });

    if (exam) {
      // Emit notification to students
      const io = req.app.get('io');
      courseDoc.students.forEach(studentId => {
        io.to(studentId.toString()).emit('notification', {
          title: 'New Exam Scheduled',
          message: `New exam "${title}" has been scheduled in ${courseDoc.title}`,
          type: 'warning',
          link: `/student/exams/${exam._id}`
        });
      });

      res.status(201).json(exam);
    } else {
      res.status(400).json({ message: 'Invalid exam data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get exams
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
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

    const exams = await Exam.find(query)
      .populate('course', 'title subject')
      .populate('teacher', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ examDate: -1 });

    const total = await Exam.countDocuments(query);

    res.json({
      exams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course', 'title subject teacher')
      .populate('teacher', 'firstName lastName')
      .populate('results.student', 'firstName lastName admissionNumber');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check permissions
    if (req.user.role === 'student') {
      const course = await Course.findById(exam.course);
      if (!course.students.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to access this exam' });
      }
    } else if (req.user.role === 'teacher' && exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this exam' });
    }

    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit exam result
// @route   POST /api/exams/:id/submit
// @access  Private/Teacher
const submitExamResult = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit results for this exam' });
    }

    const { studentId, marks, answers, feedback } = req.body;

    // Check if student is enrolled in the course
    const course = await Course.findById(exam.course);
    if (!course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }

    // Check if result already exists
    const existingResult = exam.results.find(
      result => result.student.toString() === studentId
    );

    if (existingResult) {
      return res.status(400).json({ message: 'Result already submitted for this student' });
    }

    const result = {
      student: studentId,
      marks,
      answers,
      feedback,
      submittedAt: new Date()
    };

    exam.results.push(result);
    await exam.save();

    // Create or update grade record
    let grade = await Grade.findOne({ student: studentId, course: exam.course });
    if (!grade) {
      grade = await Grade.create({
        student: studentId,
        course: exam.course,
        grades: []
      });
    }

    // Add exam grade to grades array
    grade.grades.push({
      type: 'exam',
      exam: exam._id,
      marks: marks,
      totalMarks: exam.totalMarks,
      percentage: (marks / exam.totalMarks) * 100,
      date: new Date()
    });

    await grade.save();

    // Emit notification to student
    const io = req.app.get('io');
    io.to(studentId).emit('notification', {
      title: 'Exam Result Available',
      message: `Your result for "${exam.title}" is now available`,
      type: 'success',
      link: `/student/exams/${exam._id}`
    });

    res.json({ message: 'Exam result submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Teacher
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }

    const {
      title,
      description,
      examDate,
      duration,
      totalMarks,
      questions,
      instructions,
      isActive
    } = req.body;

    exam.title = title || exam.title;
    exam.description = description || exam.description;
    exam.examDate = examDate ? new Date(examDate) : exam.examDate;
    exam.duration = duration || exam.duration;
    exam.totalMarks = totalMarks || exam.totalMarks;
    exam.questions = questions || exam.questions;
    exam.instructions = instructions || exam.instructions;
    exam.isActive = isActive !== undefined ? isActive : exam.isActive;

    const updatedExam = await exam.save();

    res.json(updatedExam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Teacher
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    await exam.deleteOne();

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createExam,
  getExams,
  getExam,
  submitExamResult,
  updateExam,
  deleteExam
};
