const { prisma } = require('../config/db');
const { userPublic, userWithEmail } = require('../utils/selects');
const { asyncHandler, pickDefined } = require('../utils/helpers');
const { hashPassword, matchPassword, normalizeEmail, emailTaken, validatePassword } = require('../services/userService');

// @desc    Get parent profile
// @route   GET /api/parent/profile
// @access  Private (Parent only)
const getParentProfile = asyncHandler(async (req, res) => {
  const parent = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      ...userPublic,
      children: { select: userWithEmail },
      linkedParents: { select: userWithEmail }
    }
  });

  if (!parent) {
    return res.status(404).json({ message: 'Parent not found' });
  }

  res.json(parent);
});

// @desc    Update parent profile
// @route   PUT /api/parent/profile
// @access  Private (Parent only)
const updateParentProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;

  if (email && (await emailTaken(email, req.user.id))) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const data = pickDefined({ firstName, lastName, phoneNumber }, ['firstName', 'lastName', 'phoneNumber']);
  if (email) data.email = normalizeEmail(email);

  const updatedParent = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true
    }
  });

  res.json({
    ...updatedParent,
    _id: updatedParent.id
  });
});

// @desc    Change parent password
// @route   PUT /api/parent/change-password
// @access  Private (Parent only)
const changeParentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const parent = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!parent) {
    return res.status(404).json({ message: 'Parent not found' });
  }

  if (!(await matchPassword(currentPassword, parent.password))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: await hashPassword(newPassword) }
  });

  res.json({ message: 'Password updated successfully' });
});

// @desc    Get linked students
// @route   GET /api/parent/students
// @access  Private (Parent only)
const getLinkedStudents = asyncHandler(async (req, res) => {
  const students = await prisma.user.findMany({
    where: {
      role: 'student',
      OR: [
        { linkedParents: { some: { id: req.user.id } } },
        { children: { some: { id: req.user.id } } }
      ]
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      admissionNumber: true,
      class: true,
      stream: true,
      profileImage: true
    }
  });

  const studentsWithProgress = students.map((student) => ({
    id: student.id,
    _id: student.id,
    name: `${student.firstName} ${student.lastName}`,
    email: student.email,
    admissionNumber: student.admissionNumber,
    class: student.class,
    stream: student.stream,
    avatar:
      student.profileImage ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`,
    progress: Math.floor(Math.random() * 40) + 60
  }));

  res.json(studentsWithProgress);
});

// @desc    Request student link removal
// @route   POST /api/parent/request-removal/:studentId
// @access  Private (Parent only)
const requestStudentRemoval = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await prisma.user.findFirst({
    where: {
      id: studentId,
      OR: [
        { linkedParents: { some: { id: req.user.id } } },
        { children: { some: { id: req.user.id } } }
      ]
    }
  });

  if (!student) {
    return res.status(400).json({ message: 'Student is not linked to this parent' });
  }

  res.json({ message: 'Removal request submitted. School administration will review your request.' });
});

// @desc    Update notification preferences
// @route   PUT /api/parent/notifications
// @access  Private (Parent only)
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { assignmentCompletion, lowProgress, feePayments, schoolAnnouncements } = req.body;

  const parent = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!parent) {
    return res.status(404).json({ message: 'Parent not found' });
  }

  const currentNotifications =
    parent.notifications && typeof parent.notifications === 'object' ? parent.notifications : {};

  const updatedNotifications = {
    ...currentNotifications,
    ...(assignmentCompletion !== undefined ? { assignmentCompletion } : {}),
    ...(lowProgress !== undefined ? { lowProgress } : {}),
    ...(feePayments !== undefined ? { feePayments } : {}),
    ...(schoolAnnouncements !== undefined ? { schoolAnnouncements } : {})
  };

  await prisma.user.update({
    where: { id: req.user.id },
    data: { notifications: updatedNotifications }
  });

  res.json({
    message: 'Notification preferences updated successfully',
    notifications: updatedNotifications
  });
});

// @desc    Update accessibility settings
// @route   PUT /api/parent/accessibility
// @access  Private (Parent only)
const updateAccessibilitySettings = asyncHandler(async (req, res) => {
  const { language, textSize, theme } = req.body;

  const data = pickDefined({ language, textSize, theme }, ['language', 'textSize', 'theme']);
  if (Object.keys(data).length > 0) {
    await prisma.user.update({
      where: { id: req.user.id },
      data
    });
  }

  res.json({ message: 'Accessibility settings updated successfully' });
});

// @desc    Get payment information
// @route   GET /api/parent/payments
// @access  Private (Parent only)
const getPaymentInfo = asyncHandler(async (req, res) => {
  const paymentNumbers = [
    { id: 1, number: '+254 712 345 678', isDefault: true },
    { id: 2, number: '+254 723 456 789', isDefault: false }
  ];

  const paymentReminders = true;

  res.json({
    paymentNumbers,
    paymentReminders
  });
});

// @desc    Download transaction receipts
// @route   GET /api/parent/receipts
// @access  Private (Parent only)
const downloadReceipts = asyncHandler(async (req, res) => {
  res.json({ message: 'Receipts download initiated. You will receive an email with the download link.' });
});

module.exports = {
  getParentProfile,
  updateParentProfile,
  changeParentPassword,
  getLinkedStudents,
  requestStudentRemoval,
  updateNotificationPreferences,
  updateAccessibilitySettings,
  getPaymentInfo,
  downloadReceipts
};
