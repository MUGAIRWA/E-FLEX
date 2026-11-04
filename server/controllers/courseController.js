const crypto = require('crypto');
const { prisma } = require('../config/db');
const { userWithEmail, studentBrief } = require('../utils/selects');
const { asyncHandler, getPagination, paginated } = require('../utils/helpers');
const { notifyUsers } = require('../utils/notify');
const { materialUpload } = require('../middleware/upload');
const { ensureTeacherCourse } = require('../services/courseService');

const courseInclude = {
  teacher: { select: userWithEmail },
  students: { select: studentBrief }
};

const canManageCourse = (user, course) => user.role === 'admin' || course.teacherId === user.id;

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, subject, teacher, class: courseClass, stream, schedule, syllabus, materials } = req.body;

  if (!title || !subject || !teacher) {
    return res.status(400).json({ message: 'title, subject and teacher are required' });
  }

  const teacherUser = await prisma.user.findUnique({ where: { id: teacher } });
  if (!teacherUser || teacherUser.role !== 'teacher') {
    return res.status(400).json({ message: 'Invalid teacher' });
  }
  if (!teacherUser.subjects.includes(subject)) {
    return res.status(400).json({ message: 'Teacher does not teach this subject' });
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      subject,
      teacherId: teacher,
      class: courseClass,
      stream,
      schedule: schedule || undefined,
      syllabus,
      materials: Array.isArray(materials) ? materials : []
    },
    include: courseInclude
  });

  res.status(201).json(course);
});

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { teacher, student, subject } = req.query;

  const where = {};
  if (req.user.role === 'teacher') where.teacherId = req.user.id;
  else if (req.user.role === 'student') where.students = { some: { id: req.user.id } };
  else if (req.user.role === 'parent') where.students = { some: { linkedParents: { some: { id: req.user.id } } } };

  // Only admins may filter arbitrarily by teacher/student
  if (req.user.role === 'admin') {
    if (teacher) where.teacherId = teacher;
    if (student) where.students = { some: { id: student } };
  }
  if (subject) where.subject = subject;

  const [courses, total] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      include: courseInclude,
      orderBy: { createdAt: 'desc' },
      skip: pg.skip,
      take: pg.limit
    }),
    prisma.course.count({ where })
  ]);

  res.json(paginated('courses', courses, total, pg));
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourse = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id }, include: courseInclude });

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (req.user.role === 'student' && !course.students.some((s) => s.id === req.user.id)) {
    return res.status(403).json({ message: 'Not authorized to access this course' });
  }
  if (req.user.role === 'teacher' && course.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to access this course' });
  }

  res.json(course);
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin/Teacher
const updateCourse = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (!canManageCourse(req.user, course)) {
    return res.status(403).json({ message: 'Not authorized to update this course' });
  }

  const { title, description, subject, teacher, class: courseClass, stream, schedule, syllabus, materials, isActive } = req.body;

  const data = {
    ...(title ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(subject ? { subject } : {}),
    ...(courseClass !== undefined ? { class: courseClass } : {}),
    ...(stream !== undefined ? { stream } : {}),
    ...(schedule ? { schedule } : {}),
    ...(syllabus !== undefined ? { syllabus } : {}),
    ...(Array.isArray(materials) ? { materials } : {}),
    ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {})
  };

  if (teacher && req.user.role === 'admin') {
    const teacherUser = await prisma.user.findUnique({ where: { id: teacher } });
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }
    data.teacherId = teacher;
  }

  const updated = await prisma.course.update({ where: { id: course.id }, data, include: courseInclude });
  res.json(updated);
});

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Private/Admin/Teacher
const enrollStudent = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { students: { select: { id: true } } }
  });

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (!canManageCourse(req.user, course)) {
    return res.status(403).json({ message: 'Not authorized to enroll students' });
  }

  const { studentId } = req.body;
  const student = studentId ? await prisma.user.findUnique({ where: { id: studentId } }) : null;
  if (!student || student.role !== 'student') {
    return res.status(400).json({ message: 'Invalid student' });
  }

  if (course.students.some((s) => s.id === studentId)) {
    return res.status(400).json({ message: 'Student already enrolled' });
  }

  await prisma.course.update({ where: { id: course.id }, data: { students: { connect: { id: studentId } } } });
  res.json({ message: 'Student enrolled successfully' });
});

// @desc    Remove student from course
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Private/Admin/Teacher
const removeStudent = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (!canManageCourse(req.user, course)) {
    return res.status(403).json({ message: 'Not authorized to remove students' });
  }

  await prisma.course.update({
    where: { id: course.id },
    data: { students: { disconnect: { id: req.params.studentId } } }
  });

  res.json({ message: 'Student removed successfully' });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  // Assignments, exams, grades and attendance cascade via FKs
  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ message: 'Course deleted successfully' });
});

// @desc    Upload material to course
// @route   POST /api/courses/:id/materials
// @access  Private/Teacher
const uploadMaterial = asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { students: { select: { id: true } } }
  });

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (course.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to upload materials to this course' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const material = {
    title: req.body.title || req.file.originalname,
    url: `/uploads/materials/${req.file.filename}`,
    uploadedAt: new Date().toISOString()
  };

  const materials = Array.isArray(course.materials) ? course.materials : [];
  await prisma.course.update({ where: { id: course.id }, data: { materials: [...materials, material] } });

  await notifyUsers(
    req.app.get('io'),
    course.students.map((s) => s.id),
    {
      title: 'New Material Uploaded',
      message: `New material "${material.title}" has been uploaded to ${course.title}`,
      type: 'info',
      link: `/student/courses/${course.id}`
    }
  );

  res.status(201).json(material);
});

// @desc    Upload content (notes / video) directly by subject & class/stream
// @route   POST /api/courses/materials
// @access  Private/Teacher
const uploadTeacherContent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type = 'notes',
    subject,
    class: className,
    stream,
    courseId,
    contentUrl
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const course = await ensureTeacherCourse(req.user, {
    courseId,
    subject,
    className,
    stream
  });

  const material = {
    id: crypto.randomUUID(),
    title,
    description: description || '',
    type,
    subject: course.subject,
    class: course.class || className || '',
    stream: course.stream || stream || '',
    courseId: course.id,
    courseTitle: course.title,
    url: req.file ? `/uploads/materials/${req.file.filename}` : contentUrl || '',
    fileName: req.file ? req.file.originalname : null,
    uploadedBy: `${req.user.firstName} ${req.user.lastName}`,
    uploadedAt: new Date().toISOString()
  };

  const materials = Array.isArray(course.materials) ? course.materials : [];
  await prisma.course.update({
    where: { id: course.id },
    data: { materials: [material, ...materials] }
  });

  await notifyUsers(
    req.app.get('io'),
    course.students.map((s) => s.id),
    {
      title: `New ${type === 'video' ? 'Video' : 'Notes'}: ${title}`,
      message: `${req.user.firstName} ${req.user.lastName} uploaded "${title}" in ${course.title}`,
      type: 'info',
      link: 'modules'
    }
  );

  res.status(201).json(material);
});

// @desc    Get uploaded materials (for teacher or student)
// @route   GET /api/courses/materials
// @access  Private
const getCourseMaterials = asyncHandler(async (req, res) => {
  const where = {};
  if (req.user.role === 'teacher') {
    where.teacherId = req.user.id;
  } else if (req.user.role === 'student') {
    where.OR = [
      { students: { some: { id: req.user.id } } },
      ...(req.user.class
        ? [{ class: req.user.class, ...(req.user.stream ? { stream: req.user.stream } : {}) }]
        : [])
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    include: { teacher: { select: userWithEmail } },
    orderBy: { updatedAt: 'desc' }
  });

  const items = [];
  for (const c of courses) {
    const mats = Array.isArray(c.materials) ? c.materials : [];
    for (const m of mats) {
      items.push({
        id: m.id || `${c.id}-${m.title}`,
        ...m,
        courseId: c.id,
        courseTitle: c.title,
        subject: m.subject || c.subject,
        class: m.class || c.class || '',
        stream: m.stream || c.stream || '',
        teacherName: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : ''
      });
    }
  }

  items.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
  res.json({ materials: items });
});

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  enrollStudent,
  removeStudent,
  deleteCourse,
  uploadMaterial,
  uploadTeacherContent,
  getCourseMaterials,
  materialUpload
};
