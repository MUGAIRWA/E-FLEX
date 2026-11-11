const { prisma } = require('../config/db');
const { userBrief, studentBrief } = require('../utils/selects');
const { asyncHandler, getPagination, paginated, filesToAttachments, percentage, letterGrade } = require('../utils/helpers');
const { notifyUsers } = require('../utils/notify');
const { isEnrolled } = require('../utils/permissions');
const { examUpload } = require('../middleware/upload');
const {
  ensureTeacherCourse,
  getRecipientsForCourse,
  buildStudentCourseAccessWhere,
  buildParentCourseAccessWhere,
  getParentLinkedStudents,
  normalizeClassKey
} = require('../services/courseService');

const getStudentParentIds = async (student) => {
  if (!student) return [];
  const parents = await prisma.user.findMany({
    where: {
      role: 'parent',
      isActive: true,
      OR: [
        { children: { some: { id: student.id } } },
        { linkedParents: { some: { id: student.id } } },
        ...(student.email
          ? [{ childEmail: { equals: student.email, mode: 'insensitive' } }]
          : [])
      ]
    },
    select: { id: true }
  });
  return [...new Set(parents.map((p) => p.id))];
};

const canStudentAccessCourse = async (student, courseId) => {
  if (await isEnrolled(courseId, student.id)) return true;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return false;
  if (
    course.class &&
    student.class &&
    normalizeClassKey(course.class) === normalizeClassKey(student.class)
  ) {
    if (
      !course.stream ||
      !student.stream ||
      course.stream.trim().toLowerCase() === student.stream.trim().toLowerCase()
    ) {
      await prisma.course.update({
        where: { id: course.id },
        data: { students: { connect: { id: student.id } } }
      });
      return true;
    }
  }
  return false;
};

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
  const {
    title,
    description,
    course,
    subject,
    class: className,
    stream,
    examDate,
    date,
    duration,
    totalMarks,
    questions,
    instructions,
    type
  } = req.body;
  const when = examDate || date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const dur = parseInt(duration, 10) || 30;

  if (!title) {
    return res.status(400).json({ message: 'title is required' });
  }

  const courseDoc = await ensureTeacherCourse(req.user, {
    courseId: course,
    subject,
    className,
    stream
  });
  if (!courseDoc) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (courseDoc.teacherId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to create exams for this course' });
  }

  const exam = await prisma.exam.create({
    data: {
      title,
      description,
      courseId: courseDoc.id,
      teacherId: req.user.id,
      ...(type ? { type } : {}),
      examDate: new Date(when),
      duration: dur,
      ...(totalMarks !== undefined ? { totalMarks: Number(totalMarks) } : {}),
      questions: parseQuestions(questions),
      instructions,
      attachments
    },
    include: {
      course: { select: { id: true, title: true, subject: true, class: true, stream: true } }
    }
  });

  const { studentIds, parentIds, classStreamLabel } = await getRecipientsForCourse(courseDoc);
  const io = req.app.get('io');

  await notifyUsers(io, studentIds, {
    title: `${notificationTitle} (${courseDoc.subject}): ${title}`,
    message: `${req.user.firstName} ${req.user.lastName} posted a ${verb} "${title}" for ${classStreamLabel}.`,
    type: 'warning',
    link: 'modules'
  });

  if (parentIds.length > 0) {
    await notifyUsers(io, parentIds, {
      title: `Quiz / Assessment Alert (${courseDoc.subject}): ${title}`,
      message: `Teacher ${req.user.firstName} ${req.user.lastName} posted a ${courseDoc.subject} ${verb} "${title}" for ${classStreamLabel}.`,
      type: 'info',
      link: 'dashboard'
    });
  }

  return res.status(201).json({
    ...exam,
    notifiedStudents: studentIds.length,
    notifiedParents: parentIds.length,
    classStreamLabel
  });
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
  const { course, subject } = req.query;

  const filters = [];
  let parentChildren = [];
  if (req.user.role === 'teacher') {
    filters.push({ teacherId: req.user.id });
  } else if (req.user.role === 'student') {
    filters.push({ course: buildStudentCourseAccessWhere(req.user) });
  } else if (req.user.role === 'parent') {
    parentChildren = await getParentLinkedStudents(req.user);
    filters.push({ course: await buildParentCourseAccessWhere(req.user) });
  }
  if (course) filters.push({ courseId: course });
  if (subject) {
    filters.push({ course: { subject: { equals: String(subject), mode: 'insensitive' } } });
  }

  const where = filters.length ? { AND: filters } : {};

  let resultsWhere = undefined;
  if (req.user.role === 'student') {
    resultsWhere = { studentId: req.user.id };
  } else if (req.user.role === 'parent') {
    resultsWhere = { studentId: { in: parentChildren.map((c) => c.id) } };
  }

  const [exams, total] = await prisma.$transaction([
    prisma.exam.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, subject: true, class: true, stream: true } },
        teacher: { select: userBrief },
        results: { where: resultsWhere, include: { student: { select: studentBrief } } }
      },
      orderBy: { createdAt: 'desc' },
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
      course: { select: { id: true, title: true, subject: true, class: true, stream: true, teacherId: true } },
      teacher: { select: userBrief },
      results: { include: { student: { select: studentBrief } } }
    }
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  if (req.user.role === 'student') {
    if (!(await canStudentAccessCourse(req.user, exam.courseId))) {
      return res.status(403).json({ message: 'Not authorized to access this exam' });
    }
    return res.json(stripAnswers({ ...exam, results: exam.results.filter((r) => r.studentId === req.user.id) }));
  }
  if (req.user.role === 'teacher' && exam.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to access this exam' });
  }
  if (req.user.role === 'parent') {
    const children = await getParentLinkedStudents(req.user);
    const childIds = new Set(children.map((c) => c.id));
    return res.json(stripAnswers({ ...exam, results: exam.results.filter((r) => childIds.has(r.studentId)) }));
  }

  res.json(exam);
});

// @desc    Submit exam/quiz result (by student taking quiz OR teacher recording marks)
// @route   POST /api/exams/:id/submit
// @access  Private (Student or Teacher)
const submitExamResult = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({
    where: { id: req.params.id },
    include: { course: { select: { id: true, title: true, subject: true } } }
  });

  if (!exam) {
    return res.status(404).json({ message: 'Exam not found' });
  }

  const isStudentSubmission = req.user.role === 'student';
  const targetStudentId = isStudentSubmission ? req.user.id : req.body.studentId;

  if (!isStudentSubmission && exam.teacherId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to submit results for this exam' });
  }

  if (isStudentSubmission) {
    if (!(await canStudentAccessCourse(req.user, exam.courseId))) {
      return res.status(403).json({ message: 'Not authorized to take this quiz' });
    }
  } else if (!targetStudentId || !(await isEnrolled(exam.courseId, targetStudentId))) {
    return res.status(400).json({ message: 'Student is not enrolled in this course' });
  }

  const existing = await prisma.examResult.findUnique({
    where: { examId_studentId: { examId: exam.id, studentId: targetStudentId } }
  });
  if (existing) {
    return res.status(400).json({ message: 'Quiz/Exam result already submitted' });
  }

  const { marks, answers, feedback } = req.body;
  const examQuestions = Array.isArray(exam.questions) ? exam.questions : [];
  let numericMarks = Number(marks);
  let gradedAnswers = Array.isArray(answers) ? answers : [];

  // Auto-grade student quiz answers if questions are defined on the exam
  if (isStudentSubmission && examQuestions.length > 0) {
    let earned = 0;
    gradedAnswers = examQuestions.map((q, idx) => {
      const submittedObj = Array.isArray(answers)
        ? answers.find((a) => a.questionIndex === idx) || answers[idx]
        : null;
      const studentAnswer =
        typeof submittedObj === 'string'
          ? submittedObj
          : submittedObj?.answer || '';
      const isCorrect =
        q.correctAnswer &&
        String(studentAnswer).trim().toLowerCase() ===
          String(q.correctAnswer).trim().toLowerCase();
      const qMarks = isCorrect ? Number(q.marks) || 5 : 0;
      earned += qMarks;
      return {
        questionIndex: idx,
        answer: studentAnswer,
        isCorrect: Boolean(isCorrect),
        marks: qMarks
      };
    });
    numericMarks = earned;
  } else if (Number.isNaN(numericMarks)) {
    numericMarks = exam.totalMarks;
  }

  if (numericMarks < 0 || numericMarks > exam.totalMarks) {
    return res.status(400).json({ message: `marks must be between 0 and ${exam.totalMarks}` });
  }

  const pct = percentage(numericMarks, exam.totalMarks);
  const letter = letterGrade(pct);
  const now = new Date();

  const [resultRecord] = await prisma.$transaction([
    prisma.examResult.create({
      data: {
        examId: exam.id,
        studentId: targetStudentId,
        answers: gradedAnswers,
        marks: numericMarks,
        percentage: pct,
        grade: letter,
        feedback: feedback || (isStudentSubmission ? 'Auto-graded quiz submission' : undefined),
        submittedAt: now,
        gradedAt: now,
        gradedById: exam.teacherId
      }
    }),
    prisma.grade.create({
      data: {
        studentId: targetStudentId,
        courseId: exam.courseId,
        examId: exam.id,
        type: exam.type === 'quiz' ? 'quiz' : 'exam',
        title: exam.title,
        marks: numericMarks,
        totalMarks: exam.totalMarks,
        percentage: pct,
        grade: letter,
        feedback: feedback || (isStudentSubmission ? 'Auto-graded quiz submission' : undefined),
        gradedById: exam.teacherId
      }
    })
  ]);

  const io = req.app.get('io');
  const studentUser = isStudentSubmission
    ? req.user
    : await prisma.user.findUnique({ where: { id: targetStudentId } });

  if (isStudentSubmission) {
    await notifyUsers(io, [exam.teacherId], {
      title: `Quiz Completed: ${exam.title}`,
      message: `${req.user.firstName} ${req.user.lastName} completed "${exam.title}" and scored ${numericMarks}/${exam.totalMarks} (${pct}%).`,
      type: 'info',
      link: 'progress'
    });
  } else {
    await notifyUsers(io, [targetStudentId], {
      title: 'Exam Result Available',
      message: `Your result for "${exam.title}" is now available: ${numericMarks}/${exam.totalMarks} (${letter}).`,
      type: 'success',
      link: 'modules'
    });
  }

  const parentIds = await getStudentParentIds(studentUser);
  if (parentIds.length > 0 && studentUser) {
    await notifyUsers(io, parentIds, {
      title: `Quiz Score Alert (${exam.course?.subject || 'Quiz'}): ${exam.title}`,
      message: `${studentUser.firstName} ${studentUser.lastName} scored ${numericMarks}/${exam.totalMarks} (${pct}% — ${letter}) on "${exam.title}".`,
      type: 'success',
      link: 'dashboard'
    });
  }

  res.json({
    message: 'Quiz/Exam result submitted successfully',
    result: resultRecord
  });
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
