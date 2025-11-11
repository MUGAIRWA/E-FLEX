const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Create student
// @route   POST /api/users/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      studentId,
      admissionNumber,
      class: userClass,
      stream,
      linkedParents
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create student
    const student = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'student',
      phoneNumber,
      studentId,
      admissionNumber,
      class: userClass,
      stream,
      linkedParents
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        role: student.role,
        studentId: student.studentId,
        admissionNumber: student.admissionNumber,
        class: student.class,
        stream: student.stream
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create teacher
// @route   POST /api/users/teachers
// @access  Private/Admin
const createTeacher = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      teacherId,
      subjects
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create teacher
    const teacher = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'teacher',
      phoneNumber,
      teacherId,
      subjects
    });

    if (teacher) {
      res.status(201).json({
        _id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        role: teacher.role,
        teacherId: teacher.teacherId,
        subjects: teacher.subjects
      });
    } else {
      res.status(400).json({ message: 'Invalid teacher data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create parent
// @route   POST /api/users/parents
// @access  Private/Admin
const createParent = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      childEmail
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find child by email
    const child = await User.findOne({ email: childEmail, role: 'student' });
    if (!child) {
      return res.status(404).json({ message: 'Child student not found' });
    }

    // Create parent
    const parent = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'parent',
      phoneNumber,
      childEmail
    });

    if (parent) {
      // Link parent to child
      child.linkedParents.push(parent._id);
      await child.save();

      res.status(201).json({
        _id: parent._id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        role: parent.role,
        childEmail: parent.childEmail
      });
    } else {
      res.status(400).json({ message: 'Invalid parent data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const query = role ? { role } : {};

    const users = await User.find(query)
      .select('-password')
      .populate('linkedParents', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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
      admissionNumber,
      class: userClass,
      stream
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    // Role-specific updates
    if (user.role === 'student') {
      if (studentId !== undefined) user.studentId = studentId;
      if (admissionNumber !== undefined) user.admissionNumber = admissionNumber;
      if (userClass !== undefined) user.class = userClass;
      if (stream !== undefined) user.stream = stream;
    }

    if (user.role === 'teacher') {
      if (teacherId !== undefined) user.teacherId = teacherId;
      if (subjects !== undefined) user.subjects = subjects;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If deleting a parent, remove from linked parents
    if (user.role === 'parent') {
      await User.updateMany(
        { linkedParents: user._id },
        { $pull: { linkedParents: user._id } }
      );
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createStudent,
  createTeacher,
  createParent,
  getUsers,
  updateUser,
  deleteUser
};
