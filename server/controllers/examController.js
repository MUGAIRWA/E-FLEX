const { prisma } = require('../config/db');
const { userBrief, studentBrief } = require('../utils/selects');
const { asyncHandler, getPagination, paginated, filesToAttachments, percentage, letterGrade } = require('../utils/helpers');
const { notifyUsers } = require('../utils/notify');
const { isEnrolled } = require('../utils/permissions');
const { examUpload } = require('../middleware/upload');

const parseQuestions = (questions) => {
  if (!questions) return [];
  if (typeof questions === 'string') {
    try {
      return JSON.parse(questions);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(questions) ? questions : [];
};

// Hide answer keys from students
const stripAnswers = (exam) => ({
  ...exam,
  questions: (Array.isArray(exam.questions) ? exam.questions : []).map(({ correctAnswer, ...q }) => q)
});

/**
 * Shared create logic for JSON and multipart exam creation.
 * FIX: the old controller sent `examDate`/`instructions`, but the schema
 * required `date` and had no `instructions`, so every create failed validation.
 */
const createExamRecord = async (req, res, { attachments = [], notificationTitle, verb }) => {
  const { title, description, course, examDate, date, duration, totalMarks, questions, instructions, type } = req.body;
  const when = examDate || date;

  if (!title || !course || !when || !duration) {
    return res.status(400).json({ message: 'title, course, examDate and duration are required' });
  }

  const courseDoc = await prisma.course.findUnique({
    where: { id: course },
    include: { students: { select: { id: true } } }
  });
  if (!courseDoc) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (courseDoc.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to create exams for this course' });
  }

  const exam = await prisma.exam.create({
    data: {
      title,
      description,
      courseId: course,
      teacherId: req.user.id,
      ...(type ? { type } : {}),
      examDate: new Date(when),
      duration: parseInt(duration, 10),
      ...(totalMarks !== undefined ? { totalMarks: Number(totalMarks) } : {}),
      questions: parseQuestions(questions),
      instructions,
      attachments
    }
  });

  await notifyUsers(
    req.app.get('io'),
    courseDoc.students.map((s) => s.id),
    {
      title: notificationTitle,
      message: `New ${verb} "${title}" has been ${verb === 'quiz' ? 'uploaded' : 'scheduled'} in ${courseDoc.title}`,
      type: 'warning',
      link: `/student/exams/${exam.id}`
    }
  );

  return res.status(201).json(exam);
};

// @desc    Create exam
// @route   POST /api/exams
// @access  Private/Teacher
const createExam = asyncHandler((req, res) =>
  createExamRecord(req, res, { notificationTitle: 'New Exam Scheduled', verb: 'exam' })
);

// @desc    Create exam with file upload
// @route   POST /api/exams/upload
// @access  Private/Teacher
const createExamWithFile = asyncHandler((req, res) =>
  createExamRecord(req, res, {
    attachments: filesToAttachments(req.files, 'exams'),
    notificationTitle: 'New Quiz Uploaded',
    verb: 'quiz'
  })
);

// @desc    Get exams
// @route   GET /api/exams
// @access  Private
const getExams = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { course } = req.query;

  const where = {};
  if (req.user.role === 'teacher') where.teacherId = req.user.id;
  else if (req.user.role === 'student') where.course = { students: { some: { id: req.user.id } } };
  else if (req.user.role === 'parent') {
    where.course = { students: { some: { linkedParents: { some: { id: req.user.id } } } } };
  }
  if (course) where.courseId = course;

  const [exams, total] = await prisma.$transaction([
    prisma.exam.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, subject: true } },
        teacher: { select: userBrief }
      },
      orderBy: { examDate: 'desc' },
      skip: pg.skip,
      take: pg.limit
    }),
    prisma.exam.count({ where })
  ]);

  const shaped = req.user.role === 'teacher' || req.user.role === 'admin' ? exams : exams.map(stripAnswers);
  res.json(paginated('exams', shaped, total, pg));
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExam = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({
    where: { id: req.params.id },
    include: {
      course: { select: { id: true, title: true, subject: true, teacherId: true } },
      teacher: { select: userBrief },
      results: { include: { student: { select: studentBrief } } }
    }
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (req.user.role === 'student') {
    if (!(await isEnrolled(exam.courseId, req.user.id))) {
      return res.status(403).json({ message: 'Not authorized to access this exam' });
    }
    // Students only see their own result and no answer key
    return res.json(stripAnswers({ ...exam, results: exam.results.filter((r) => r.studentId === req.user.id) }));
  }
  if (req.user.role === 'teacher' && exam.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to access this exam' });
  }
  if (req.user.role === 'parent') {
    return res.status(403).json({ message: 'Not authorized to access this exam' });
  }

  res.json(exam);
});

// @desc    Submit exam result
// @route   POST /api/exams/:id/submit
// @access  Private/Teacher
const submitExamResult = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  if (exam.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to submit results for this exam' });
  }

  const { studentId, marks, answers, feedback } = req.body;
  const numericMarks = Number(marks);

  if (!studentId || Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > exam.totalMarks) {
    return res.status(400).json({ message: `studentId and marks (0-${exam.totalMarks}) are required` });
  }
  if (!(await isEnrolled(exam.courseId, studentId))) {
    return res.status(400).json({ message: 'Student is not enrolled in this course' });
  }

  const existing = await prisma.examResult.findUnique({
    where: { examId_studentId: { examId: exam.id, studentId } }
  });
  if (existing) {
    return res.status(400).json({ message: 'Result already submitted for this student' });
  }

  const pct = percentage(numericMarks, exam.totalMarks);
  const letter = letterGrade(pct);
  const now = new Date();

  // FIX: previously pushed into a non-existent `grade.grades` array. Now the
  // result and the gradebook entry are written together in one transaction.
  await prisma.$transaction([
    prisma.examResult.create({
      data: {
        examId: exam.id,
        studentId,
        answers: Array.isArray(answers) ? answers : [],
        marks: numericMarks,
        percentage: pct,
        grade: letter,
        feedback,
        submittedAt: now,
        gradedAt: now,
        gradedById: req.user.id
      }
    }),
    prisma.grade.create({
      data: {
        studentId,
        courseId: exam.courseId,
        examId: exam.id,
        type: exam.type === 'quiz' ? 'quiz' : 'exam',
        title: exam.title,
        marks: numericMarks,
        totalMarks: exam.totalMarks,
        percentage: pct,
        grade: letter,
        feedback,
        gradedById: req.user.id
      }
    })
  ]);

  await notifyUsers(req.app.get('io'), [studentId], {
    title: 'Exam Result Available',
    message: `Your result for "${exam.title}" is now available`,
    type: 'success',
    link: `/student/exams/${exam.id}`
  });

  res.json({ message: 'Exam result submitted successfully' });
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Teacher
const updateExam = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  if (exam.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this exam' });
  }

  const { title, description, examDate, date, duration, totalMarks, questions, instructions, isActive, type } = req.body;
  const when = examDate || date;

  const updated = await prisma.exam.update({
    where: { id: exam.id },
    data: {
      ...(title ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(type ? { type } : {}),
      ...(when ? { examDate: new Date(when) } : {}),
      ...(duration ? { duration: parseInt(duration, 10) } : {}),
      ...(totalMarks ? { totalMarks: Number(totalMarks) } : {}),
      ...(questions ? { questions: parseQuestions(questions) } : {}),
      ...(instructions !== undefined ? { instructions } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {})
    }
  });

  res.json(updated);
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Teacher
const deleteExam = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }
  if (exam.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this exam' });
  }

  await prisma.exam.delete({ where: { id: exam.id } });
  res.json({ message: 'Exam deleted successfully' });
});

module.exports = {
  createExam,
  getExams,
  getExam,
  submitExamResult,
  updateExam,
  deleteExam,
  createExamWithFile,
  examUpload
};
