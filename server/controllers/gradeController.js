const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get grades for a student
// @route   GET /api/grades/student/:studentId
// @access  Private
const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;

    // Check permissions - students can only view their own grades, parents can view their children's, teachers can view their students'
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized to view these grades' });
    }

    if (req.user.role === 'parent') {
      const student = await User.findById(studentId);
      if (!student || !student.linkedParents.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view these grades' });
      }
    }

    if (req.user.role === 'teacher') {
      // Verify teacher teaches the student
      const courses = await Course.find({ teacher: req.user._id, students: studentId });
      if (courses.length === 0) {
        return res.status(403).json({ message: 'Not authorized to view these grades' });
      }
    }

    let query = { student: studentId };

    if (courseId) {
      query.course = courseId;
    }

    const grades = await Grade.find(query)
      .populate('course', 'title subject')
      .populate('student', 'firstName lastName admissionNumber')
      .populate('grades.gradedBy', 'firstName lastName');

    // Calculate overall statistics
    const allGrades = grades.flatMap(grade => grade.grades);
    const totalMarks = allGrades.reduce((sum, grade) => sum + grade.marks, 0);
    const totalPossible = allGrades.reduce((sum, grade) => sum + grade.totalMarks, 0);
    const overallPercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;

    res.json({
      grades,
      statistics: {
        totalMarks,
        totalPossible,
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        gradeCount: allGrades.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get grades for a course
// @route   GET /api/grades/course/:courseId
// @access  Private/Teacher
const getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view course grades' });
    }

    const grades = await Grade.find({ course: courseId })
      .populate('student', 'firstName lastName admissionNumber')
      .populate('grades.gradedBy', 'firstName lastName');

    // Calculate class statistics
    const studentStats = grades.map(grade => {
      const studentGrades = grade.grades;
      const totalMarks = studentGrades.reduce((sum, g) => sum + g.marks, 0);
      const totalPossible = studentGrades.reduce((sum, g) => sum + g.totalMarks, 0);
      const percentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;

      return {
        student: grade.student,
        totalMarks,
        totalPossible,
        percentage: Math.round(percentage * 100) / 100,
        gradeCount: studentGrades.length
      };
    });

    const classAverage = studentStats.length > 0
      ? studentStats.reduce((sum, stat) => sum + stat.percentage, 0) / studentStats.length
      : 0;

    res.json({
      grades,
      classStatistics: {
        studentCount: studentStats.length,
        classAverage: Math.round(classAverage * 100) / 100,
        studentStats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add manual grade
// @route   POST /api/grades
// @access  Private/Teacher
const addGrade = async (req, res) => {
  try {
    const { studentId, courseId, type, title, marks, totalMarks, feedback } = req.body;

    // Verify course exists and teacher owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add grades for this course' });
    }

    // Verify student is enrolled
    if (!course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }

    // Find or create grade record
    let grade = await Grade.findOne({ student: studentId, course: courseId });
    if (!grade) {
      grade = await Grade.create({
        student: studentId,
        course: courseId,
        grades: []
      });
    }

    // Add new grade
    const newGrade = {
      type,
      title,
      marks,
      totalMarks,
      percentage: (marks / totalMarks) * 100,
      feedback,
      gradedBy: req.user._id,
      date: new Date()
    };

    grade.grades.push(newGrade);
    await grade.save();

    // Emit notification to student
    const io = req.app.get('io');
    io.to(studentId).emit('notification', {
      title: 'New Grade Available',
      message: `You have received a new grade for "${title}" in ${course.title}`,
      type: 'success',
      link: `/student/grades`
    });

    res.status(201).json({ message: 'Grade added successfully', grade: newGrade });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:gradeId/item/:itemId
// @access  Private/Teacher
const updateGrade = async (req, res) => {
  try {
    const { gradeId, itemId } = req.params;
    const { marks, totalMarks, feedback } = req.body;

    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findById(grade.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this grade' });
    }

    const gradeItem = grade.grades.id(itemId);
    if (!gradeItem) {
      return res.status(404).json({ message: 'Grade item not found' });
    }

    gradeItem.marks = marks !== undefined ? marks : gradeItem.marks;
    gradeItem.totalMarks = totalMarks !== undefined ? totalMarks : gradeItem.totalMarks;
    gradeItem.percentage = (gradeItem.marks / gradeItem.totalMarks) * 100;
    gradeItem.feedback = feedback !== undefined ? feedback : gradeItem.feedback;

    await grade.save();

    res.json({ message: 'Grade updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:gradeId/item/:itemId
// @access  Private/Teacher
const deleteGrade = async (req, res) => {
  try {
    const { gradeId, itemId } = req.params;

    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }

    // Verify teacher owns the course
    const course = await Course.findById(grade.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this grade' });
    }

    grade.grades.pull(itemId);
    await grade.save();

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStudentGrades,
  getCourseGrades,
  addGrade,
  updateGrade,
  deleteGrade
};
