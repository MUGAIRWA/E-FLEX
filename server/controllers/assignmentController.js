const { prisma } = require('../config/db');
const { userBrief, studentBrief } = require('../utils/selects');
const { asyncHandler, getPagination, paginated, filesToAttachments, percentage, letterGrade } = require('../utils/helpers');
const { notifyUsers } = require('../utils/notify');
const { teacherClassFilter, isEnrolled, canTeacherAccessStudent } = require('../utils/permissions');
const { assignmentUpload: upload } = require('../middleware/upload');

/**
 * Prisma `where` for assignments a teacher may see: their own courses, or
 * courses with students in the teacher's classes/streams.
 * (Replaces an N+1 loop over every course in the database.)
 */
const teacherAssignmentScope = (teacher) => {
  const classFilters = teacherClassFilter(teacher);
  return {
    OR: [
      { teacherId: teacher.id },
      { course: { teacherId: teacher.id } },
      ...(classFilters.length
        ? [{ course: { students: { some: { role: 'student', OR: classFilters } } } }]
        : [])
    ]
  };
};

const teacherCanAccessAssignment = async (teacher, assignmentId) => {
  const count = await prisma.assignment.count({
    where: { id: assignmentId, ...teacherAssignmentScope(teacher) }
  });
  return count > 0;
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/Teacher
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, course, dueDate, totalMarks, instructions } = req.body;

  if (!title || !course || !dueDate) {
    return res.status(400).json({ message: 'title, course and dueDate are required' });
  }

  const courseDoc = await prisma.course.findUnique({
    where: { id: course },
    include: { students: { select: { id: true } } }
  });
  if (!courseDoc) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (courseDoc.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
  }

  const assignment = await prisma.assignment.create({
    data: {
      title,
      description,
      courseId: course,
      teacherId: req.user.id,
      dueDate: new Date(dueDate),
      ...(totalMarks !== undefined ? { totalMarks: Number(totalMarks) } : {}),
      instructions,
      attachments: filesToAttachments(req.files, 'assignments')
    }
  });

  await notifyUsers(
    req.app.get('io'),
    courseDoc.students.map((s) => s.id),
    {
      title: 'New Assignment',
      message: `New assignment "${title}" has been posted in ${courseDoc.title}`,
      type: 'info',
      link: `/student/assignments/${assignment.id}`
    }
  );

  res.status(201).json(assignment);
});

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { course } = req.query;

  const filters = [];
  if (req.user.role === 'teacher') filters.push(teacherAssignmentScope(req.user));
  else if (req.user.role === 'student') filters.push({ course: { students: { some: { id: req.user.id } } } });
  else if (req.user.role === 'parent') {
    filters.push({ course: { students: { some: { linkedParents: { some: { id: req.user.id } } } } } });
  }
  if (course) filters.push({ courseId: course });

  const where = filters.length ? { AND: filters } : {};

  // Students only see their own submission; staff see all
  const submissionsWhere = req.user.role === 'student' ? { studentId: req.user.id } : undefined;

  const [assignments, total] = await prisma.$transaction([
    prisma.assignment.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, subject: true } },
        teacher: { select: userBrief },
        submissions: { where: submissionsWhere, include: { student: { select: userBrief } } }
      },
      orderBy: { createdAt: 'desc' },
      skip: pg.skip,
      take: pg.limit
    }),
    prisma.assignment.count({ where })
  ]);

  res.json(paginated('assignments', assignments, total, pg));
});

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: req.params.id },
    include: {
      course: { select: { id: true, title: true, subject: true, teacherId: true } },
      teacher: { select: userBrief },
      submissions: {
        include: { student: { select: studentBrief }, gradedBy: { select: userBrief } },
        orderBy: { submittedAt: 'asc' }
      }
    }
  });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  if (req.user.role === 'student') {
    if (!(await isEnrolled(assignment.courseId, req.user.id))) {
      return res.status(403).json({ message: 'Not authorized to access this assignment' });
    }
    // Students must not see classmates' submissions
    assignment.submissions = assignment.submissions.filter((s) => s.studentId === req.user.id);
  } else if (req.user.role === 'teacher') {
    if (!(await teacherCanAccessAssignment(req.user, assignment.id))) {
      return res.status(403).json({ message: 'Not authorized to access this assignment' });
    }
  } else if (req.user.role === 'parent') {
    return res.status(403).json({ message: 'Not authorized to access this assignment' });
  }

  res.json(assignment);
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }
  if (!assignment.isActive) {
    return res.status(400).json({ message: 'This assignment is closed' });
  }
  if (!(await isEnrolled(assignment.courseId, req.user.id))) {
    return res.status(403).json({ message: 'Not authorized to submit this assignment' });
  }

  const existing = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: req.user.id } }
  });
  if (existing) {
    return res.status(400).json({ message: 'Assignment already submitted' });
  }

  const now = new Date();
  await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      studentId: req.user.id,
      content: req.body.content,
      attachments: filesToAttachments(req.files, 'assignments'),
      submittedAt: now,
      // FIX: 'late' status existed in the schema but was never set
      status: now > assignment.dueDate ? 'late' : 'submitted'
    }
  });

  res.json({ message: 'Assignment submitted successfully' });
});

// @desc    Grade assignment
// @route   PUT /api/assignments/:id/grade/:studentId
// @access  Private/Teacher
const gradeAssignment = asyncHandler(async (req, res) => {
  // FIX: studentId was used before it was declared (ReferenceError on every call)
  const { studentId } = req.params;
  const { marks, feedback } = req.body;

  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }

  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const isOwner = assignment.teacherId === req.user.id;
  if (!isOwner && !(await canTeacherAccessStudent(req.user, student, assignment.courseId))) {
    return res.status(403).json({ message: 'Not authorized to grade this student' });
  }

  const numericMarks = Number(marks);
  if (Number.isNaN(numericMarks) || numericMarks < 0 || numericMarks > assignment.totalMarks) {
    return res.status(400).json({ message: `marks must be between 0 and ${assignment.totalMarks}` });
  }

  const submission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId } }
  });
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  const pct = percentage(numericMarks, assignment.totalMarks);

  // Update the submission AND record it in the gradebook atomically
  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submission.id },
      data: { marks: numericMarks, feedback, gradedAt: new Date(), gradedById: req.user.id, status: 'graded' }
    });

    const existingGrade = await tx.grade.findFirst({ where: { assignmentId: assignment.id, studentId } });
    const gradeData = {
      marks: numericMarks,
      totalMarks: assignment.totalMarks,
      percentage: pct,
      grade: letterGrade(pct),
      feedback,
      gradedById: req.user.id,
      gradedAt: new Date()
    };

    if (existingGrade) {
      await tx.grade.update({ where: { id: existingGrade.id }, data: gradeData });
    } else {
      await tx.grade.create({
        data: {
          ...gradeData,
          studentId,
          courseId: assignment.courseId,
          assignmentId: assignment.id,
          type: 'assignment',
          title: assignment.title
        }
      });
    }
  });

  await notifyUsers(req.app.get('io'), [studentId], {
    title: 'Assignment Graded',
    message: `Your assignment "${assignment.title}" has been graded`,
    type: 'success',
    link: `/student/assignments/${assignment.id}`
  });

  res.json({ message: 'Assignment graded successfully' });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }
  if (!(await teacherCanAccessAssignment(req.user, assignment.id))) {
    return res.status(403).json({ message: 'Not authorized to update this assignment' });
  }

  const { title, description, dueDate, totalMarks, instructions, isActive } = req.body;

  const updated = await prisma.assignment.update({
    where: { id: assignment.id },
    data: {
      ...(title ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      ...(totalMarks ? { totalMarks: Number(totalMarks) } : {}),
      ...(instructions !== undefined ? { instructions } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {})
    }
  });

  res.json(updated);
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });

  if (!assignment) {
    return res.status(404).json({ message: 'Assignment not found' });
  }
  if (assignment.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this assignment' });
  }

  await prisma.assignment.delete({ where: { id: assignment.id } });
  res.json({ message: 'Assignment deleted successfully' });
});

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
