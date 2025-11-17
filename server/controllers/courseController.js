const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      teacher,
      class: courseClass,
      stream,
      schedule,
      syllabus,
      materials
    } = req.body;

    // Verify teacher exists and is a teacher
    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }

    // Verify teacher teaches the subject
    if (!teacherUser.subjects.includes(subject)) {
      return res.status(400).json({ message: 'Teacher does not teach this subject' });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      teacher,
      class: courseClass,
      stream,
      schedule,
      syllabus,
      materials
    });

    if (course) {
      res.status(201).json(course);
    } else {
      res.status(400).json({ message: 'Invalid course data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { teacher, student, subject, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      query.students = req.user._id;
    }

    if (teacher) query.teacher = teacher;
    if (student) query.students = student;
    if (subject) query.subject = subject;

    const courses = await Course.find(query)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email admissionNumber class stream')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email admissionNumber class stream');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course
    if (req.user.role === 'student' && !course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    if (req.user.role === 'teacher' && course.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin/Teacher
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const {
      title,
      description,
      subject,
      teacher,
      class: courseClass,
      stream,
      schedule,
      syllabus,
      materials,
      isActive
    } = req.body;

    course.title = title || course.title;
    course.description = description || course.description;
    course.subject = subject || course.subject;
    course.class = courseClass || course.class;
    course.stream = stream || course.stream;
    course.schedule = schedule || course.schedule;
    course.syllabus = syllabus || course.syllabus;
    course.materials = materials || course.materials;
    course.isActive = isActive !== undefined ? isActive : course.isActive;

    if (teacher && req.user.role === 'admin') {
      course.teacher = teacher;
    }

    const updatedCourse = await course.save();

    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Admin/Teacher
const enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to enroll students' });
    }

    const { studentId } = req.body;

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    // Check if already enrolled
    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    course.students.push(studentId);
    await course.save();

    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove student from course
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Private/Admin/Teacher
const removeStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove students' });
    }

    const { studentId } = req.params;

    course.students = course.students.filter(id => id.toString() !== studentId);
    await course.save();

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.deleteOne();

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  enrollStudent,
  removeStudent,
  deleteCourse
};
