const { prisma } = require('../config/db');
const { userBrief } = require('../utils/selects');
const { asyncHandler, round2, percentage, letterGrade } = require('../utils/helpers');
const { notifyUsers } = require('../utils/notify');
const { canViewStudent, canTeacherAccessStudent, isEnrolled } = require('../utils/permissions');

/**
 * Grades are now one row per graded item (flat table).
 * FIX: the old controllers read/wrote `grade.grades[]`, which did not exist on
 * the Grade model, so every grade endpoint was broken.
 */

const summarize = (grades) => {
  const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
  const totalPossible = grades.reduce((sum, g) => sum + g.totalMarks, 0);
  return {
    totalMarks,
    totalPossible,
    overallPercentage: round2(percentage(totalMarks, totalPossible)),
    gradeCount: grades.length
  };
};

const gradeInclude = {
  course: { select: { id: true, title: true, subject: true } },
  student: { select: { ...userBrief, admissionNumber: true } },
  gradedBy: { select: userBrief }
};

// @desc    Get grades for a student
// @route   GET /api/grades/student/:studentId
// @access  Private
const getStudentGrades = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.query;

  if (!(await canViewStudent(req.user, studentId))) {
    return res.status(403).json({ message: 'Not authorized to view these grades' });
  }

  const grades = await prisma.grade.findMany({
    where: { studentId, ...(courseId ? { courseId } : {}) },
    include: gradeInclude,
    orderBy: { gradedAt: 'desc' }
  });

  res.json({ grades, statistics: summarize(grades) });
});

// @desc    Get grades for a course
// @route   GET /api/grades/course/:courseId
// @access  Private/Teacher
const getCourseGrades = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (req.user.role !== 'admin' && course.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view course grades' });
  }

  const grades = await prisma.grade.findMany({
    where: { courseId },
    include: gradeInclude,
    orderBy: { gradedAt: 'desc' }
  });

  // Per-student statistics
  const byStudent = new Map();
  for (const g of grades) {
    if (!byStudent.has(g.studentId)) byStudent.set(g.studentId, { student: g.student, items: [] });
    byStudent.get(g.studentId).items.push(g);
  }

  const studentStats = [...byStudent.values()].map(({ student, items }) => {
    const s = summarize(items);
    return {
      student,
      totalMarks: s.totalMarks,
      totalPossible: s.totalPossible,
      percentage: s.overallPercentage,
      gradeCount: s.gradeCount
    };
  });

  const classAverage = studentStats.length
    ? studentStats.reduce((sum, s) => sum + s.percentage, 0) / studentStats.length
    : 0;

  res.json({
    grades,
    classStatistics: {
      studentCount: studentStats.length,
      classAverage: round2(classAverage),
      studentStats
    }
  });
});

// @desc    Add manual grade
// @route   POST /api/grades
// @access  Private/Teacher
const addGrade = asyncHandler(async (req, res) => {
  const { studentId, courseId, type = 'quiz', title, marks, totalMarks, feedback } = req.body;

  const numericMarks = Number(marks);
  const numericTotal = Number(totalMarks);
  if (!studentId || !courseId || Number.isNaN(numericMarks) || !(numericTotal > 0) || numericMarks < 0 || numericMarks > numericTotal) {
    return res.status(400).json({ message: 'studentId, courseId, marks and totalMarks (marks ≤ totalMarks) are required' });
  }
  if (!['assignment', 'exam', 'quiz'].includes(type)) {
    return res.status(400).json({ message: 'type must be assignment, exam or quiz' });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || student.role !== 'student') {
    return res.status(404).json({ message: 'Student not found' });
  }

  if (course.teacherId !== req.user.id && !(await canTeacherAccessStudent(req.user, student, courseId))) {
    return res.status(403).json({ message: 'Not authorized to add grades for this student' });
  }
  if (!(await isEnrolled(courseId, studentId))) {
    return res.status(400).json({ message: 'Student is not enrolled in this course' });
  }

  const pct = percentage(numericMarks, numericTotal);
  const grade = await prisma.grade.create({
    data: {
      studentId,
      courseId,
      type,
      title,
      marks: numericMarks,
      totalMarks: numericTotal,
      percentage: pct,
      grade: letterGrade(pct),
      feedback,
      gradedById: req.user.id
    },
    include: gradeInclude
  });

  await notifyUsers(req.app.get('io'), [studentId], {
    title: 'New Grade Available',
    message: `You have received a new grade for "${title || type}" in ${course.title}`,
    type: 'success',
    link: '/student/grades'
  });

  res.status(201).json({ message: 'Grade added successfully', grade });
});

const loadGradeForTeacher = async (req, res) => {
  const grade = await prisma.grade.findUnique({
    where: { id: req.params.gradeId },
    include: { course: true, student: true }
  });
  if (!grade) {
    res.status(404).json({ message: 'Grade record not found' });
    return null;
  }
  const allowed =
    req.user.role === 'admin' ||
    grade.course.teacherId === req.user.id ||
    (await canTeacherAccessStudent(req.user, grade.student, grade.courseId));
  if (!allowed) {
    res.status(403).json({ message: 'Not authorized to modify this grade' });
    return null;
  }
  return grade;
};

// @desc    Update grade
// @route   PUT /api/grades/:gradeId   (legacy: /api/grades/:gradeId/item/:itemId)
// @access  Private/Teacher
const updateGrade = asyncHandler(async (req, res) => {
  const grade = await loadGradeForTeacher(req, res);
  if (!grade) return;

  const { marks, totalMarks, feedback, title } = req.body;
  const newMarks = marks !== undefined ? Number(marks) : grade.marks;
  const newTotal = totalMarks !== undefined ? Number(totalMarks) : grade.totalMarks;

  if (Number.isNaN(newMarks) || !(newTotal > 0) || newMarks < 0 || newMarks > newTotal) {
    return res.status(400).json({ message: 'Invalid marks' });
  }

  const pct = percentage(newMarks, newTotal);
  const updated = await prisma.grade.update({
    where: { id: grade.id },
    data: {
      marks: newMarks,
      totalMarks: newTotal,
      percentage: pct,
      grade: letterGrade(pct),
      ...(feedback !== undefined ? { feedback } : {}),
      ...(title !== undefined ? { title } : {}),
      gradedById: req.user.id,
      gradedAt: new Date()
    },
    include: gradeInclude
  });

  res.json({ message: 'Grade updated successfully', grade: updated });
});

// @desc    Delete grade
// @route   DELETE /api/grades/:gradeId   (legacy: /api/grades/:gradeId/item/:itemId)
// @access  Private/Teacher
const deleteGrade = asyncHandler(async (req, res) => {
  const grade = await loadGradeForTeacher(req, res);
  if (!grade) return;

  await prisma.grade.delete({ where: { id: grade.id } });
  res.json({ message: 'Grade deleted successfully' });
});

module.exports = {
  getStudentGrades,
  getCourseGrades,
  addGrade,
  updateGrade,
  deleteGrade
};
