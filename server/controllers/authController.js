const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { userPublic, userWithEmail } = require('../utils/selects');
const { asyncHandler, pickDefined } = require('../utils/helpers');
const {
  createUser,
  matchPassword,
  normalizeEmail,
  emailTaken,
  ROLES
} = require('../services/userService');
const {
  buildStudentCourseAccessWhere,
  ensureTeacherCourse
} = require('../services/courseService');

const ACCESS_TTL = process.env.JWT_EXPIRE || '7d';
const REFRESH_TTL = process.env.JWT_EXPIRES_IN || '30d';
const MAX_SESSIONS_KEPT = 10;

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Refresh tokens are now persisted (hashed) in PostgreSQL instead of an
 * in-memory array, so they survive restarts and work across instances.
 */
const issueRefreshToken = async (userId) => {
  const token = jwt.sign({ id: userId, jti: crypto.randomUUID() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TTL
  });
  const { exp } = jwt.decode(token);
  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(token), userId, expiresAt: new Date(exp * 1000) }
  });
  return token;
};

const authPayload = async (user) => {
  const accessToken = generateToken(user.id);
  return {
    _id: user.id,
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    ...(user.role === 'student'
      ? {
          class: user.class,
          stream: user.stream,
          admissionNumber: user.admissionNumber,
          studentId: user.studentId
        }
      : {}),
    ...(user.role === 'parent' ? { childEmail: user.childEmail } : {}),
    ...(user.role === 'teacher'
      ? {
          subjects: user.subjects,
          classesTaught: user.classesTaught,
          streamsTaught: user.streamsTaught
        }
      : {}),
    token: accessToken,
    accessToken,
    refreshToken: await issueRefreshToken(user.id)
  };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    phoneNumber,
    parentEmail,
    studentId,
    childEmail,
    childAdmissionNumber,
    teacherId,
    subjects,
    classesTaught,
    streamsTaught,
    admissionNumber,
    class: userClass,
    stream,
    linkedParents
  } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ message: 'email, password, firstName, lastName and role are required' });
  }

  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (await emailTaken(email)) {
    return res.status(400).json({ message: 'User already exists with this email' });
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
    const resolvedStudentId =
      studentId && String(studentId).trim()
        ? String(studentId).trim()
        : `STU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    Object.assign(
      data,
      pickDefined(
        {
          studentId: resolvedStudentId,
          admissionNumber: admissionNumber ? String(admissionNumber).trim() : undefined,
          class: userClass,
          stream: stream ? String(stream).trim() : undefined
        },
        ['studentId', 'admissionNumber', 'class', 'stream']
      )
    );
    if (Array.isArray(linkedParents)) data.linkedParents = linkedParents;
  }

  if (role === 'parent') {
    const childKey = childEmail || childAdmissionNumber;
    if (childKey && String(childKey).trim()) {
      data.childEmail = String(childKey).trim().toLowerCase();
    }
  }

  if (role === 'teacher') {
    data.teacherId =
      teacherId && String(teacherId).trim()
        ? String(teacherId).trim()
        : `TCH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    if (Array.isArray(subjects)) data.subjects = subjects.filter(Boolean);
    if (Array.isArray(classesTaught)) data.classesTaught = classesTaught;

    const derivedStreams = Array.isArray(classesTaught)
      ? classesTaught
          .map((item) => (typeof item === 'object' && item !== null ? item.stream : null))
          .filter(Boolean)
      : [];
    const explicitStreams = Array.isArray(streamsTaught) ? streamsTaught.filter(Boolean) : [];
    data.streamsTaught = [...new Set([...explicitStreams, ...derivedStreams])];
  }

  const user = await createUser(data);

  // Auto-link a parent to their child(ren) if the student already exists
  if (role === 'parent') {
    const parentOrConditions = [];
    if (data.childEmail) {
      parentOrConditions.push({ email: { equals: data.childEmail, mode: 'insensitive' } });
      parentOrConditions.push({ admissionNumber: { equals: data.childEmail, mode: 'insensitive' } });
    }
    if (data.phoneNumber) {
      parentOrConditions.push({ phoneNumber: { equals: data.phoneNumber } });
    }

    if (parentOrConditions.length > 0) {
      const matchingChildren = await prisma.user.findMany({
        where: {
          role: 'student',
          OR: parentOrConditions
        },
        select: { id: true }
      });

      if (matchingChildren.length > 0) {
        await Promise.all(
          matchingChildren.map((child) =>
            prisma.user.update({
              where: { id: child.id },
              data: { linkedParents: { connect: { id: user.id } } }
            })
          )
        );
      }
    }
  }

  // If a student registers, auto-link any matching parent and auto-enroll in matching class/stream courses
  if (role === 'student') {
    const studentParentOr = [
      { childEmail: { equals: user.email, mode: 'insensitive' } }
    ];
    if (user.admissionNumber) {
      studentParentOr.push({ childEmail: { equals: user.admissionNumber, mode: 'insensitive' } });
    }
    if (parentEmail && String(parentEmail).trim()) {
      studentParentOr.push({ email: { equals: normalizeEmail(parentEmail), mode: 'insensitive' } });
    }
    if (user.phoneNumber) {
      studentParentOr.push({ phoneNumber: { equals: user.phoneNumber } });
    }

    const matchingParents = await prisma.user.findMany({
      where: {
        role: 'parent',
        OR: studentParentOr
      },
      select: { id: true }
    });

    if (matchingParents.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          linkedParents: { connect: matchingParents.map((p) => ({ id: p.id })) }
        }
      });
    }

    // Auto-enroll student into existing courses for their class & stream
    if (user.class) {
      const matchingCourses = await prisma.course.findMany({
        where: {
          isActive: true,
          ...buildStudentCourseAccessWhere(user)
        },
        select: { id: true }
      });

      if (matchingCourses.length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            enrolledCourses: {
              connect: matchingCourses.map((c) => ({ id: c.id }))
            }
          }
        });
      }
    }
  }

  // If a teacher registers, initialize their courses for their selected subjects and class/stream pairs
  if (role === 'teacher' && Array.isArray(data.subjects) && Array.isArray(data.classesTaught)) {
    for (const subj of data.subjects) {
      for (const ct of data.classesTaught) {
        const cls = typeof ct === 'object' && ct !== null ? ct.class : ct;
        const strm = typeof ct === 'object' && ct !== null ? ct.stream : '';
        if (subj && cls) {
          try {
            await ensureTeacherCourse(user, { subject: subj, className: cls, stream: strm });
          } catch (e) {
            // Non-blocking course initialization
          }
        }
      }
    }
  }

  res.status(201).json(await authPayload(user));
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = email ? await prisma.user.findUnique({ where: { email: normalizeEmail(email) } }) : null;

  if (!user || !(await matchPassword(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'Account is deactivated' });
  }

  // Record login. Only these columns are touched, so the password hash is never re-hashed.
  const sessions = Array.isArray(user.sessions) ? user.sessions : [];
  sessions.unshift({
    device: req.get('user-agent') || 'unknown',
    loginTime: new Date().toISOString(),
    ipAddress: req.ip
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), sessions: sessions.slice(0, MAX_SESSIONS_KEPT) }
    }),
    // Housekeeping: clear this user's expired refresh tokens
    prisma.refreshToken.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
  ]);

  res.json(await authPayload(user));
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const rawToken = req.body?.refreshToken;
  const token = typeof rawToken === 'object' && rawToken !== null ? rawToken.refreshToken : rawToken;

  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!stored || stored.userId !== decoded.id || stored.expiresAt < new Date()) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: userPublic });
  if (!user || !user.isActive) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const newAccessToken = generateToken(user.id);
  res.json({ token: newAccessToken, accessToken: newAccessToken, user });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const rawToken = req.body?.refreshToken;
  const token = typeof rawToken === 'object' && rawToken !== null ? rawToken.refreshToken : rawToken;
  const allDevices = req.body?.allDevices;

  if (allDevices) {
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });
  } else if (token && typeof token === 'string') {
    await prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(token), userId: req.user.id } });
  }

  res.json({ message: 'Logged out successfully' });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { ...userPublic, linkedParents: { select: userWithEmail } }
  });

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const { firstName, lastName, email, phoneNumber, address, dateOfBirth, admissionNumber, notifications, theme, textSize } =
    req.body;

  if (email && normalizeEmail(email) !== user.email && (await emailTaken(email, user.id))) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const data = {
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(email ? { email: normalizeEmail(email) } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(theme && ['light', 'dark'].includes(theme) ? { theme } : {}),
    ...(textSize !== undefined ? { textSize: Math.min(Math.max(parseInt(textSize, 10) || 100, 50), 200) } : {})
  };

  if (notifications && typeof notifications === 'object') {
    data.notifications = { ...(user.notifications || {}), ...notifications };
  }

  // FIX: address / dateOfBirth previously didn't exist on the model and were silently dropped
  if (user.role === 'student') {
    if (address !== undefined) data.address = address;
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (admissionNumber !== undefined) data.admissionNumber = admissionNumber;
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data, select: userPublic });
  res.json(updated);
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe
};
