const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Teacher
const markAttendance = async (req, res) => {
  try {
    const { courseId, studentId, date, status, notes } = req.body;

    // Verify course exists and teacher owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
    }

    // Verify student is enrolled
    if (!course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      course: courseId,
      date: new Date(date)
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.notes = notes || existingAttendance.notes;
      existingAttendance.markedBy = req.user._id;
      await existingAttendance.save();

      res.json({ message: 'Attendance updated successfully', attendance: existingAttendance });
    } else {
      // Create new attendance record
      const attendance = await Attendance.create({
        student: studentId,
        course: courseId,
        date: new Date(date),
        status,
        notes,
        markedBy: req.user._id
      });

      res.status(201).json({ message: 'Attendance marked successfully', attendance });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private
const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, page = 1, limit = 50 } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this course attendance' });
    }

    if (req.user.role === 'student' && !course.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this course attendance' });
    }

    let query = { course: courseId };

    if (date) {
      query.date = new Date(date);
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'firstName lastName admissionNumber')
      .populate('markedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, page = 1, limit = 30 } = req.query;

    // Check permissions - students can only view their own attendance, parents can view their children's, teachers can view their students'
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized to view this attendance' });
    }

    if (req.user.role === 'parent') {
      const student = await User.findById(studentId);
      if (!student || !student.linkedParents.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to view this attendance' });
      }
    }

    if (req.user.role === 'teacher') {
      // Verify teacher teaches the student
      const courses = await Course.find({ teacher: req.user._id, students: studentId });
      if (courses.length === 0) {
        return res.status(403).json({ message: 'Not authorized to view this attendance' });
      }
    }

    let query = { student: studentId };

    if (courseId) {
      query.course = courseId;
    }

    const attendance = await Attendance.find(query)
      .populate('course', 'title subject')
      .populate('markedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    // Calculate attendance statistics
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    res.json({
      attendance,
      statistics: {
        totalRecords,
        presentCount,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      },
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private/Teacher
const bulkMarkAttendance = async (req, res) => {
  try {
    const { courseId, date, attendanceData } = req.body; // attendanceData: [{ studentId, status, notes }]

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
    }

    const attendanceRecords = [];

    for (const record of attendanceData) {
      // Check if attendance already exists
      let attendance = await Attendance.findOne({
        student: record.studentId,
        course: courseId,
        date: new Date(date)
      });

      if (attendance) {
        // Update existing
        attendance.status = record.status;
        attendance.notes = record.notes || attendance.notes;
        attendance.markedBy = req.user._id;
        await attendance.save();
      } else {
        // Create new
        attendance = await Attendance.create({
          student: record.studentId,
          course: courseId,
          date: new Date(date),
          status: record.status,
          notes: record.notes,
          markedBy: req.user._id
        });
      }

      attendanceRecords.push(attendance);
    }

    res.json({ message: 'Attendance marked successfully', records: attendanceRecords.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private/Teacher
const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if teacher owns the course
    const course = await Course.findById(attendance.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this attendance' });
    }

    const { status, notes } = req.body;

    attendance.status = status || attendance.status;
    attendance.notes = notes || attendance.notes;
    attendance.markedBy = req.user._id;

    const updatedAttendance = await attendance.save();

    res.json(updatedAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Teacher
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if teacher owns the course
    const course = await Course.findById(attendance.course);
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this attendance' });
    }

    await attendance.deleteOne();

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  markAttendance,
  getCourseAttendance,
  getStudentAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance
};
