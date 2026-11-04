const { prisma } = require('../config/db');
const { userBrief } = require('../utils/selects');
const { asyncHandler, getPagination, paginated, round2 } = require('../utils/helpers');
const { canViewStudent, canTeacherAccessStudent, isEnrolled } = require('../utils/permissions');

const STATUSES = ['present', 'absent', 'late', 'excused'];

// Normalise to a calendar day (column is DATE) so the unique key works reliably
const toDay = (value) => {
  if (!value) return null;
  // 'YYYY-MM-DD' is parsed as UTC midnight by JS — keep it as-is to avoid a timezone day-shift
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

const canMarkForCourse = async (user, course, student) =>
  user.role === 'admin' || course.teacherId === user.id || canTeacherAccessStudent(user, student, course.id);

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private/Teacher
const markAttendance = asyncHandler(async (req, res) => {
  const { courseId, studentId, date, status, notes } = req.body;
  const day = toDay(date);

  if (!courseId || !studentId || !day || !STATUSES.includes(status)) {
    return res.status(400).json({ message: `courseId, studentId, a valid date and status (${STATUSES.join('/')}) are required` });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  if (!(await canMarkForCourse(req.user, course, student))) {
    return res.status(403).json({ message: 'Not authorized to mark attendance for this student' });
  }
  if (!(await isEnrolled(courseId, studentId))) {
    return res.status(400).json({ message: 'Student is not enrolled in this course' });
  }

  const key = { studentId_courseId_date: { studentId, courseId, date: day } };
  const existed = await prisma.attendance.findUnique({ where: key });

  // Upsert is atomic — no race between "check" and "insert"
  const attendance = await prisma.attendance.upsert({
    where: key,
    update: { status, markedById: req.user.id, ...(notes !== undefined ? { notes } : {}) },
    create: { studentId, courseId, date: day, status, notes, markedById: req.user.id }
  });

  if (existed) {
    res.json({ message: 'Attendance updated successfully', attendance });
  } else {
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  }
});

// @desc    Get attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private
const getCourseAttendance = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const pg = getPagination(req.query, 50, 500);

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (req.user.role === 'teacher' && course.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view this course attendance' });
  }
  if (req.user.role === 'parent') {
    return res.status(403).json({ message: 'Not authorized to view this course attendance' });
  }

  const where = { courseId };
  // Students only see their own records (previously saw the whole class)
  if (req.user.role === 'student') {
    if (!(await isEnrolled(courseId, req.user.id))) {
      return res.status(403).json({ message: 'Not authorized to view this course attendance' });
    }
    where.studentId = req.user.id;
  }
  if (req.query.date) {
    const day = toDay(req.query.date);
    if (day) where.date = day;
  }

  const [attendance, total] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      include: {
        student: { select: { ...userBrief, admissionNumber: true } },
        markedBy: { select: userBrief }
      },
      orderBy: { date: 'desc' },
      skip: pg.skip,
      take: pg.limit
    }),
    prisma.attendance.count({ where })
  ]);

  res.json(paginated('attendance', attendance, total, pg));
});

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.query;
  const pg = getPagination(req.query, 30, 500);

  if (!(await canViewStudent(req.user, studentId))) {
    return res.status(403).json({ message: 'Not authorized to view this attendance' });
  }

  const where = { studentId, ...(courseId ? { courseId } : {}) };

  const [attendance, total, statusCounts] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, subject: true } },
        markedBy: { select: userBrief }
      },
      orderBy: { date: 'desc' },
      skip: pg.skip,
      take: pg.limit
    }),
    prisma.attendance.count({ where }),
    prisma.attendance.groupBy({ by: ['status'], where, _count: { _all: true } })
  ]);

  // FIX: statistics are now computed over ALL records, not just the current page
  const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all]));
  const presentCount = counts.present || 0;

  res.json({
    attendance,
    statistics: {
      totalRecords: total,
      presentCount,
      absentCount: counts.absent || 0,
      lateCount: counts.late || 0,
      excusedCount: counts.excused || 0,
      attendancePercentage: round2(total > 0 ? (presentCount / total) * 100 : 0)
    },
    totalPages: Math.ceil(total / pg.limit),
    currentPage: pg.page,
    total
  });
});

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private/Teacher
const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { courseId, date, attendanceData } = req.body; // attendanceData: [{ studentId, status, notes }]
  const day = toDay(date);

  if (!courseId || !day || !Array.isArray(attendanceData) || attendanceData.length === 0) {
    return res.status(400).json({ message: 'courseId, a valid date and a non-empty attendanceData array are required' });
  }
  if (attendanceData.some((r) => !r.studentId || !STATUSES.includes(r.status))) {
    return res.status(400).json({ message: `Each record needs studentId and status (${STATUSES.join('/')})` });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { students: { select: { id: true, class: true, stream: true } } }
  });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const enrolled = new Map(course.students.map((s) => [s.id, s]));
  const notEnrolled = attendanceData.filter((r) => !enrolled.has(r.studentId)).map((r) => r.studentId);
  if (notEnrolled.length) {
    return res.status(400).json({ message: 'Some students are not enrolled in this course', studentIds: notEnrolled });
  }

  if (req.user.role !== 'admin' && course.teacherId !== req.user.id) {
    // Non-owner teachers may only mark students in their own classes
    for (const r of attendanceData) {
      if (!(await canTeacherAccessStudent(req.user, enrolled.get(r.studentId), courseId))) {
        return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
      }
    }
  }

  // All-or-nothing
  const records = await prisma.$transaction(
    attendanceData.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_courseId_date: { studentId: r.studentId, courseId, date: day } },
        update: { status: r.status, markedById: req.user.id, ...(r.notes !== undefined ? { notes: r.notes } : {}) },
        create: { studentId: r.studentId, courseId, date: day, status: r.status, notes: r.notes, markedById: req.user.id }
      })
    )
  );

  res.json({ message: 'Attendance marked successfully', records: records.length });
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private/Teacher
const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await prisma.attendance.findUnique({
    where: { id: req.params.id },
    include: { course: true, student: true }
  });

  if (!attendance) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }
  if (!(await canMarkForCourse(req.user, attendance.course, attendance.student))) {
    return res.status(403).json({ message: 'Not authorized to update this attendance' });
  }

  const { status, notes } = req.body;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${STATUSES.join(', ')}` });
  }

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      markedById: req.user.id
    }
  });

  res.json(updated);
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Teacher
const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await prisma.attendance.findUnique({
    where: { id: req.params.id },
    include: { course: true }
  });

  if (!attendance) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }
  if (req.user.role !== 'admin' && attendance.course.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this attendance' });
  }

  await prisma.attendance.delete({ where: { id: attendance.id } });
  res.json({ message: 'Attendance record deleted successfully' });
});

module.exports = {
  markAttendance,
  getCourseAttendance,
  getStudentAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance
};
