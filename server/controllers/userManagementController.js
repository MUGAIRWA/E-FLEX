const { prisma } = require('../config/db');
const { userPublic, userWithEmail } = require('../utils/selects');
const { asyncHandler, getPagination, paginated } = require('../utils/helpers');
const { createUser, normalizeEmail, emailTaken, ROLES } = require('../services/userService');

// @desc    Create any user role (Admin)
// @route   POST /api/users
// @access  Private/Admin
const createAnyUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role = 'student',
    phoneNumber,
    studentId,
    admissionNumber,
    class: userClass,
    stream,
    childEmail,
    teacherId,
    subjects,
    classesTaught,
    streamsTaught
  } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'firstName, lastName, email, and password are required' });
  }

  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (await emailTaken(email)) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const data = {
    email,
    password,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    role,
    ...(phoneNumber ? { phoneNumber: String(phoneNumber).trim() } : {})
  };

  if (role === 'student') {
    data.studentId =
      studentId && String(studentId).trim()
        ? String(studentId).trim()
        : `STU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    if (admissionNumber) data.admissionNumber = String(admissionNumber).trim();
    if (userClass) data.class = userClass;
    if (stream) data.stream = stream;
  } else if (role === 'teacher') {
    data.teacherId =
      teacherId && String(teacherId).trim()
        ? String(teacherId).trim()
        : `TCH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    data.subjects = Array.isArray(subjects) ? subjects : [];
    data.classesTaught = Array.isArray(classesTaught) ? classesTaught : [];
    data.streamsTaught = Array.isArray(streamsTaught) ? streamsTaught : [];
  } else if (role === 'parent' && childEmail) {
    data.childEmail = String(childEmail).trim().toLowerCase();
  }

  const created = await createUser(data);

  if (role === 'parent' && data.childEmail) {
    const child = await prisma.user.findFirst({
      where: {
        role: 'student',
        OR: [
          { email: { equals: data.childEmail, mode: 'insensitive' } },
          { admissionNumber: { equals: data.childEmail, mode: 'insensitive' } }
        ]
      }
    });
    if (child) {
      await prisma.user.update({
        where: { id: child.id },
        data: { linkedParents: { connect: { id: created.id } } }
      });
    }
  }

  res.status(201).json({ ...created, _id: created.id });
});
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

// @desc    Get user stats and platform overview counts
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const [grouped, activeCourses, totalAssignments, totalExams, recentAnnouncements] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.assignment.count({ where: { isActive: true } }),
    prisma.exam.count({ where: { isActive: true } }),
    prisma.announcement.count({ where: { isActive: true } })
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.role, g._count._all]));
  const students = counts.student || 0;
  const teachers = counts.teacher || 0;
  const parents = counts.parent || 0;
  const admins = counts.admin || 0;

  res.json({
    totalUsers: grouped.reduce((sum, g) => sum + g._count._all, 0),
    students,
    teachers,
    parents,
    admins,
    totalStudents: students,
    totalTeachers: teachers,
    totalParents: parents,
    totalAdmins: admins,
    activeCourses,
    totalAssignments,
    totalExams,
    activeAnnouncements: recentAnnouncements
  });
});

const enrichUsersWithLinks = async (rawUsers) => {
  const [allParents, allStudents] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'parent' },
      select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, childEmail: true }
    }),
    prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        admissionNumber: true,
        class: true,
        stream: true
      }
    })
  ]);

  const parentsMatchesStudent = (parent, student) => {
    if (!parent || !student) return false;
    const ck = (parent.childEmail || '').trim().toLowerCase();
    if (ck) {
      if (student.email && student.email.trim().toLowerCase() === ck) return true;
      if (student.admissionNumber && student.admissionNumber.trim().toLowerCase() === ck) return true;
    }
    if (
      parent.phoneNumber &&
      student.phoneNumber &&
      parent.phoneNumber.trim() === student.phoneNumber.trim()
    ) {
      return true;
    }
    return false;
  };

  return rawUsers.map((u) => {
    const existingParents = Array.isArray(u.linkedParents) ? [...u.linkedParents] : [];
    const existingChildren = Array.isArray(u.children) ? [...u.children] : [];

    if (u.role === 'student') {
      for (const p of allParents) {
        if (!existingParents.some((ep) => ep.id === p.id) && parentsMatchesStudent(p, u)) {
          existingParents.push(p);
        }
      }
    } else if (u.role === 'parent') {
      for (const s of allStudents) {
        if (!existingChildren.some((ec) => ec.id === s.id) && parentsMatchesStudent(u, s)) {
          existingChildren.push(s);
        }
      }
    }

    return {
      ...u,
      _id: u.id,
      linkedParents: existingParents,
      children: existingChildren
    };
  });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { role, search, status, class: classFilter, stream: streamFilter } = req.query;

  const where = {
    ...(role && ROLES.includes(role) ? { role } : {}),
    ...(status === 'active' ? { isActive: true } : status === 'inactive' ? { isActive: false } : {}),
    ...(classFilter ? { class: { equals: String(classFilter), mode: 'insensitive' } } : {}),
    ...(streamFilter ? { stream: { equals: String(streamFilter), mode: 'insensitive' } } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { admissionNumber: { contains: search, mode: 'insensitive' } },
            { teacherId: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [rawUsers, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        ...userPublic,
        linkedParents: { select: userWithEmail },
        children: { select: userWithEmail },
        coursesTaught: {
          where: { isActive: true },
          select: { id: true, title: true, subject: true, class: true, stream: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: pg.skip,
      take: pg.limit
    }),
    prisma.user.count({ where })
  ]);

  const users = await enrichUsersWithLinks(rawUsers);

  res.json(paginated('users', users, total, pg));
});

// @desc    Get users by specific role (returns array for dropdowns/tables)
// @route   GET /api/users/students | /api/users/teachers | /api/users/parents
// @access  Private/Admin
const getUsersByRole = (targetRole) =>
  asyncHandler(async (req, res) => {
    const rawUsers = await prisma.user.findMany({
      where: { role: targetRole },
      select: {
        ...userPublic,
        linkedParents: { select: userWithEmail },
        children: { select: userWithEmail },
        coursesTaught: {
          where: { isActive: true },
          select: { id: true, title: true, subject: true, class: true, stream: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = await enrichUsersWithLinks(rawUsers);
    res.json(enriched);
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

  await prisma.$transaction(async (tx) => {
    if (user.role === 'teacher') {
      await tx.grade.deleteMany({ where: { gradedById: user.id } });
      await tx.attendance.deleteMany({ where: { markedById: user.id } });
      await tx.assignment.deleteMany({ where: { teacherId: user.id } });
      await tx.exam.deleteMany({ where: { teacherId: user.id } });
      await tx.course.deleteMany({ where: { teacherId: user.id } });
    }
    await tx.subject.deleteMany({ where: { createdById: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  res.json({ message: 'User deleted successfully' });
});

module.exports = {
  createAnyUser,
  createStudent,
  createTeacher,
  createParent,
  getUsers,
  getUsersByRole,
  getUserStats,
  updateUser,
  deleteUser
};
