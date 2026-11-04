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

const ACCESS_TTL = process.env.JWT_EXPIRE || '15m';
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

const authPayload = async (user) => ({
  _id: user.id,
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  ...(user.role === 'teacher' ? { subjects: user.subjects, classesTaught: user.classesTaught } : {}),
  token: generateToken(user.id),
  refreshToken: await issueRefreshToken(user.id)
});

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
    studentId,
    childEmail,
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

  // Never allow self-registration as admin
  if (!ROLES.includes(role) || role === 'admin') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (await emailTaken(email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const data = { email, password, firstName, lastName, role, phoneNumber };

  if (role === 'student') {
    Object.assign(data, pickDefined({ studentId, admissionNumber, class: userClass, stream }, [
      'studentId',
      'admissionNumber',
      'class',
      'stream'
    ]));
    if (Array.isArray(linkedParents)) data.linkedParents = linkedParents;
  }
  if (role === 'parent' && childEmail) data.childEmail = normalizeEmail(childEmail);
  if (role === 'teacher') {
    if (teacherId) data.teacherId = teacherId;
    if (Array.isArray(subjects)) data.subjects = subjects;
    if (Array.isArray(classesTaught)) data.classesTaught = classesTaught;
    if (Array.isArray(streamsTaught)) data.streamsTaught = streamsTaught;
  }

  const user = await createUser(data);

  // Auto-link a parent to their child if the child already exists
  if (role === 'parent' && data.childEmail) {
    const child = await prisma.user.findFirst({ where: { email: data.childEmail, role: 'student' } });
    if (child) {
      await prisma.user.update({
        where: { id: child.id },
        data: { linkedParents: { connect: { id: user.id } } }
      });
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
  const { refreshToken: token } = req.body;

  if (!token) {
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

  res.json({ token: generateToken(user.id), user });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token, allDevices } = req.body || {};

  if (allDevices) {
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });
  } else if (token) {
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
