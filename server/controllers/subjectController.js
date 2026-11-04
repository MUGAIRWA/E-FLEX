const { prisma } = require('../config/db');
const { userWithEmail } = require('../utils/selects');
const { asyncHandler } = require('../utils/helpers');

const subjectInclude = {
  createdBy: { select: userWithEmail },
  teachers: { select: userWithEmail }
};

const canModify = (user, subject) => user.role === 'admin' || subject.createdById === user.id;

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await prisma.subject.findMany({ include: subjectInclude, orderBy: { name: 'asc' } });
  res.json(subjects);
});

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
const getSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.findUnique({ where: { id: req.params.id }, include: subjectInclude });
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  res.json(subject);
});

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin/Teacher)
const createSubject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const trimmed = typeof name === 'string' ? name.trim() : '';

  if (!trimmed) return res.status(400).json({ message: 'Please provide a subject name' });
  if (trimmed.length > 50) return res.status(400).json({ message: 'Subject name cannot be more than 50 characters' });
  if (description && description.length > 500) {
    return res.status(400).json({ message: 'Description cannot be more than 500 characters' });
  }

  const existing = await prisma.subject.findFirst({ where: { name: { equals: trimmed, mode: 'insensitive' } } });
  if (existing) {
    return res.status(400).json({ message: 'Subject already exists' });
  }

  const isTeacher = req.user.role === 'teacher';
  const subject = await prisma.$transaction(async (tx) => {
    const created = await tx.subject.create({
      data: {
        name: trimmed,
        description,
        createdById: req.user.id,
        ...(isTeacher ? { teachers: { connect: { id: req.user.id } } } : {})
      },
      include: subjectInclude
    });
    // Keep the teacher's denormalised subjects list in sync
    if (isTeacher && !req.user.subjects.includes(trimmed)) {
      await tx.user.update({ where: { id: req.user.id }, data: { subjects: { push: trimmed } } });
    }
    return created;
  });

  res.status(201).json(subject);
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin/Subject Creator)
const updateSubject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const subject = await prisma.subject.findUnique({ where: { id: req.params.id }, include: { teachers: true } });

  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  if (!canModify(req.user, subject)) {
    return res.status(403).json({ message: 'Not authorized to update this subject' });
  }

  const newName = name ? name.trim() : subject.name;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.subject.update({
      where: { id: subject.id },
      data: { name: newName, ...(description !== undefined ? { description } : {}) },
      include: subjectInclude
    });
    // Rename the subject in teachers' subject lists too
    if (newName !== subject.name) {
      for (const t of subject.teachers) {
        await tx.user.update({
          where: { id: t.id },
          data: { subjects: t.subjects.map((s) => (s === subject.name ? newName : s)) }
        });
      }
    }
    return result;
  });

  res.json(updated);
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin/Subject Creator)
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.findUnique({ where: { id: req.params.id }, include: { teachers: true } });

  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  if (!canModify(req.user, subject)) {
    return res.status(403).json({ message: 'Not authorized to delete this subject' });
  }

  await prisma.$transaction(async (tx) => {
    for (const t of subject.teachers) {
      await tx.user.update({ where: { id: t.id }, data: { subjects: t.subjects.filter((s) => s !== subject.name) } });
    }
    await tx.subject.delete({ where: { id: subject.id } });
  });

  res.json({ message: 'Subject deleted successfully' });
});

// @desc    Remove teacher from subject
// @route   DELETE /api/subjects/:id/teachers/:teacherId
// @access  Private (Admin/Subject Creator)
const removeTeacherFromSubject = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const subject = await prisma.subject.findUnique({ where: { id: req.params.id }, include: { teachers: true } });

  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  if (!canModify(req.user, subject)) {
    return res.status(403).json({ message: 'Not authorized to modify this subject' });
  }

  const teacher = subject.teachers.find((t) => t.id === teacherId);
  if (!teacher) {
    return res.status(400).json({ message: 'Teacher not assigned to this subject' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: teacherId },
      data: { subjects: teacher.subjects.filter((s) => s !== subject.name) }
    });
    return tx.subject.update({
      where: { id: subject.id },
      data: { teachers: { disconnect: { id: teacherId } } },
      include: subjectInclude
    });
  });

  res.json(updated);
});

// @desc    Add teacher to subject
// @route   POST /api/subjects/:id/teachers
// @access  Private (Admin/Subject Creator)
const addTeacherToSubject = asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  const subject = await prisma.subject.findUnique({ where: { id: req.params.id }, include: { teachers: true } });

  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }
  if (!canModify(req.user, subject)) {
    return res.status(403).json({ message: 'Not authorized to modify this subject' });
  }
  if (subject.teachers.some((t) => t.id === teacherId)) {
    return res.status(400).json({ message: 'Teacher already assigned to this subject' });
  }

  const teacher = teacherId ? await prisma.user.findUnique({ where: { id: teacherId } }) : null;
  if (!teacher || teacher.role !== 'teacher') {
    return res.status(400).json({ message: 'Invalid teacher' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (!teacher.subjects.includes(subject.name)) {
      await tx.user.update({ where: { id: teacherId }, data: { subjects: { push: subject.name } } });
    }
    return tx.subject.update({
      where: { id: subject.id },
      data: { teachers: { connect: { id: teacherId } } },
      include: subjectInclude
    });
  });

  res.json(updated);
});

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTeacherToSubject,
  removeTeacherFromSubject
};
