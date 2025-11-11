const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Get parent profile
// @route   GET /api/parent/profile
// @access  Private (Parent only)
const getParentProfile = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id)
      .select('-password')
      .populate('linkedParents', 'firstName lastName email');

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.json(parent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update parent profile
// @route   PUT /api/parent/profile
// @access  Private (Parent only)
const updateParentProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    const parent = await User.findById(req.user._id);

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== parent.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    parent.firstName = firstName || parent.firstName;
    parent.lastName = lastName || parent.lastName;
    parent.email = email || parent.email;
    parent.phoneNumber = phoneNumber || parent.phoneNumber;

    const updatedParent = await parent.save();

    res.json({
      _id: updatedParent._id,
      firstName: updatedParent.firstName,
      lastName: updatedParent.lastName,
      email: updatedParent.email,
      phoneNumber: updatedParent.phoneNumber,
      role: updatedParent.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change parent password
// @route   PUT /api/parent/change-password
// @access  Private (Parent only)
const changeParentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const parent = await User.findById(req.user._id);

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Check current password
    if (!(await parent.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    parent.password = newPassword;
    await parent.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get linked students
// @route   GET /api/parent/students
// @access  Private (Parent only)
const getLinkedStudents = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id);

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Find students linked to this parent
    const students = await User.find({
      role: 'student',
      linkedParents: parent._id
    }).select('firstName lastName email admissionNumber class stream profileImage');

    // For demo purposes, return mock progress data
    const studentsWithProgress = students.map(student => ({
      _id: student._id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      admissionNumber: student.admissionNumber,
      class: student.class,
      stream: student.stream,
      avatar: student.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`,
      progress: Math.floor(Math.random() * 40) + 60 // Mock progress between 60-100%
    }));

    res.json(studentsWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request student link removal
// @route   POST /api/parent/request-removal/:studentId
// @access  Private (Parent only)
const requestStudentRemoval = async (req, res) => {
  try {
    const { studentId } = req.params;

    const parent = await User.findById(req.user._id);
    const student = await User.findById(studentId);

    if (!parent || !student) {
      return res.status(404).json({ message: 'Parent or student not found' });
    }

    // Check if student is linked to this parent
    if (!student.linkedParents.includes(parent._id)) {
      return res.status(400).json({ message: 'Student is not linked to this parent' });
    }

    // In a real app, this would create a removal request for admin approval
    // For now, we'll just return success
    res.json({ message: 'Removal request submitted. School administration will review your request.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/parent/notifications
// @access  Private (Parent only)
const updateNotificationPreferences = async (req, res) => {
  try {
    const { assignmentCompletion, lowProgress, feePayments, schoolAnnouncements } = req.body;

    const parent = await User.findById(req.user._id);

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    parent.notifications = {
      ...parent.notifications,
      assignmentCompletion: assignmentCompletion !== undefined ? assignmentCompletion : parent.notifications.assignmentCompletion,
      lowProgress: lowProgress !== undefined ? lowProgress : parent.notifications.lowProgress,
      feePayments: feePayments !== undefined ? feePayments : parent.notifications.feePayments,
      schoolAnnouncements: schoolAnnouncements !== undefined ? schoolAnnouncements : parent.notifications.schoolAnnouncements
    };

    await parent.save();

    res.json({ message: 'Notification preferences updated successfully', notifications: parent.notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update accessibility settings
// @route   PUT /api/parent/accessibility
// @access  Private (Parent only)
const updateAccessibilitySettings = async (req, res) => {
  try {
    const { language, textSize } = req.body;

    const parent = await User.findById(req.user._id);

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Store accessibility preferences (you might want to add these fields to the User model)
    // For now, we'll just return success
    res.json({ message: 'Accessibility settings updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment information
// @route   GET /api/parent/payments
// @access  Private (Parent only)
const getPaymentInfo = async (req, res) => {
  try {
    // Mock payment data - in a real app, this would come from a payments table
    const paymentNumbers = [
      { id: 1, number: '+254 712 345 678', isDefault: true },
      { id: 2, number: '+254 723 456 789', isDefault: false }
    ];

    const paymentReminders = true; // This could be stored in user preferences

    res.json({
      paymentNumbers,
      paymentReminders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Download transaction receipts
// @route   GET /api/parent/receipts
// @access  Private (Parent only)
const downloadReceipts = async (req, res) => {
  try {
    // In a real app, this would generate and return a PDF or CSV file
    // For now, we'll just return a success message
    res.json({ message: 'Receipts download initiated. You will receive an email with the download link.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
