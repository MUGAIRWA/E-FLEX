const { prisma } = require('../config/db');
const { userPublic, userWithEmail } = require('../utils/selects');
const { asyncHandler, getPagination, paginated } = require('../utils/helpers');
const { createUser, normalizeEmail, emailTaken, ROLES } = require('../services/userService');

// @desc    Create student
// @route   POST /api/users/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, studentId, admissionNumber, class: userClass, stream, linkedParents } =
    req.body;

  if (await emailTaken(email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const student = await createUser({
    email,
    password,
    firstName,
    lastName,
    role: 'student',
    phoneNumber,
    studentId: studentId || null,
    admissionNumber,
    class: userClass,
    stream,
    linkedParents
  });

  res.status(201).json({
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    role: student.role,
    studentId: student.studentId,
    admissionNumber: student.admissionNumber,
    class: student.class,
    stream: student.stream
  });
});

// @desc    Create teacher
// @route   POST /api/users/teachers
// @access  Private/Admin
const createTeacher = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, teacherId, subjects, classesTaught, streamsTaught } = req.body;

  if (await emailTaken(email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const teacher = await createUser({
    email,
    password,
    firstName,
    lastName,
    role: 'teacher',
    phoneNumber,
    teacherId: teacherId || null,
    subjects: Array.isArray(subjects) ? subjects : [],
    classesTaught: Array.isArray(classesTaught) ? classesTaught : [],
    streamsTaught: Array.isArray(streamsTaught) ? streamsTaught : []
  });

  res.status(201).json({
    id: teacher.id,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
    role: teacher.role,
    teacherId: teacher.teacherId,
    subjects: teacher.subjects,
    classesTaught: teacher.classesTaught
  });
});

// @desc    Create parent
// @route   POST /api/users/parents
// @access  Private/Admin
const createParent = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, childEmail } = req.body;

  if (await emailTaken(email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const child = await prisma.user.findFirst({ where: { email: normalizeEmail(childEmail), role: 'student' } });
  if (!child) {
    return res.status(404).json({ message: 'Child student not found' });
  }

  // Create the parent and link the child atomically
  const parent = await prisma.$transaction(async (tx) => {
    const created = await createUser({
      email,
      password,
      firstName,
      lastName,
      role: 'parent',
      phoneNumber,
      childEmail: child.email
    }, tx);
    await tx.user.update({ where: { id: child.id }, data: { linkedParents: { connect: { id: created.id } } } });
    return created;
  });

  res.status(201).json({
    id: parent.id,
    firstName: parent.firstName,
    lastName: parent.lastName,
    email: parent.email,
    role: parent.role,
    childEmail: parent.childEmail
  });
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const grouped = await prisma.user.groupBy({ by: ['role'], _count: { _all: true } });
  const counts = Object.fromEntries(grouped.map((g) => [g.role, g._count._all]));

  res.json({
    totalUsers: grouped.reduce((sum, g) => sum + g._count._all, 0),
    students: counts.student || 0,
    teachers: counts.teacher || 0,
    parents: counts.parent || 0,
    admins: counts.admin || 0
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { role, search } = req.query;

  const where = {
    ...(role && ROLES.includes(role) ? { role } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { ...userPublic, linkedParents: { select: userWithEmail } },
      orderBy: { createdAt: 'desc' },
      skip: pg.skip,
      take: pg.limit
    }),
    prisma.user.count({ where })
  ]);

  res.json(paginated('users', users, total, pg));
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    isActive,
    studentId,
    teacherId,
    subjects,
    classesTaught,
    streamsTaught,
    admissionNumber,
    class: userClass,
    stream
  } = req.body;

  if (email && normalizeEmail(email) !== user.email && (await emailTaken(email, user.id))) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const data = {
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(email ? { email: normalizeEmail(email) } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {})
  };

  if (user.role === 'student') {
    if (studentId !== undefined) data.studentId = studentId || null;
    if (admissionNumber !== undefined) data.admissionNumber = admissionNumber;
    if (userClass !== undefined) data.class = userClass;
    if (stream !== undefined) data.stream = stream;
  }

  if (user.role === 'teacher') {
    if (teacherId !== undefined) data.teacherId = teacherId || null;
    if (Array.isArray(subjects)) data.subjects = subjects;
    if (Array.isArray(classesTaught)) data.classesTaught = classesTaught;
    if (Array.isArray(streamsTaught)) data.streamsTaught = streamsTaught;
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data, select: userPublic });

  // Deactivating a user also revokes their sessions
  if (data.isActive === false) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  }

  res.json(updated);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.id === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }

  // Parent links, enrollments, submissions etc. are removed by FK cascades.
  // Teachers who still own courses/assignments/grades are protected (P2003 -> 409).
  if (user.role === 'teacher') {
    const owned = await prisma.course.count({ where: { teacherId: user.id } });
    if (owned > 0) {
      return res.status(409).json({
        message: `This teacher still owns ${owned} course(s). Reassign or delete them first, or deactivate the account instead.`
      });
    }
  }

  await prisma.user.delete({ where: { id: user.id } });
  res.json({ message: 'User deleted successfully' });
});

module.exports = {
  createStudent,
  createTeacher,
  createParent,
  getUsers,
  getUserStats,
  updateUser,
  deleteUser
};
