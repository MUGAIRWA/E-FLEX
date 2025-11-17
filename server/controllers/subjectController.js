const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('createdBy', 'firstName lastName email').populate('teachers', 'firstName lastName email');
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('createdBy', 'firstName lastName email').populate('teachers', 'firstName lastName email');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin/Teacher)
const createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ name });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = await Subject.create({
      name,
      description,
      createdBy: req.user._id,
      teachers: [req.user._id]
    });

    const populatedSubject = await subject.populate('createdBy', 'firstName lastName email').populate('teachers', 'firstName lastName email');

    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin/Subject Creator)
const updateSubject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if user is creator or admin
    if (subject.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this subject' });
    }

    if (name) subject.name = name;
    if (description) subject.description = description;

    await subject.save();

    const updatedSubject = await subject.populate('createdBy', 'firstName lastName email').populate('teachers', 'firstName lastName email');

    res.json(updatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin/Subject Creator)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if user is creator or admin
    if (subject.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this subject' });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove teacher from subject
// @route   DELETE /api/subjects/:id/teachers/:teacherId
// @access  Private (Admin/Subject Creator)
const removeTeacherFromSubject = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if user is creator or admin
    if (subject.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this subject' });
    }

    // Check if teacher is assigned to this subject
    if (!subject.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher not assigned to this subject' });
    }

    // Remove teacher from subject
    subject.teachers = subject.teachers.filter(id => id.toString() !== teacherId);
    await subject.save();

    // Remove subject from teacher's subjects array
    const teacher = await User.findById(teacherId);
    if (teacher) {
      teacher.subjects = teacher.subjects.filter(sub => sub !== subject.name);
      await teacher.save();
    }

    const updatedSubject = await subject.populate('createdBy', 'firstName lastName email').populate('teachers', 'firstName lastName email');

    res.json(updatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add teacher to subject
// @route   POST /api/subjects/:id/teachers
// @access  Private (Admin/Subject Creator)
const addTeacherToSubject = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if user is creator or admin
    if (subject.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this subject' });
    }

    // Check if teacher already added
    if (subject.teachers.includes(teacherId)) {
      return res.status(400).json({ message: 'Teacher already assigned to this subject' });
    }

    // Verify teacher exists and is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }

    subject.teachers.push(teacherId);
    await subject.save();

    // Add subject to teacher's subjects array if not already present
    if (!teacher.subjects.includes(subject.name)) {
      teacher.subjects.push(subject.name);
      await teacher.save();
    }

    const updatedSubject = await subject.populate('createdBy', 'firstName lastName email').populate('teachers', 'firstName lastName email');

    res.json(updatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTeacherToSubject,
  removeTeacherFromSubject
};
