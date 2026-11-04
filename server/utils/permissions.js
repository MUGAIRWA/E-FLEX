const { prisma } = require('../config/db');

/**
 * Does this teacher teach this student's class/stream?
 *
 * FIX: the old code did `teacher.classesTaught.includes(student.class)`, but
 * classesTaught holds objects ({ class, stream }), so it was always false and
 * teachers were locked out of grades/attendance.
 */
const teachesClassOf = (teacher, student) => {
  if (!teacher || !student || !student.class) return false;
  const classes = Array.isArray(teacher.classesTaught) ? teacher.classesTaught : [];
  const streams = teacher.streamsTaught || [];

  return classes.some((entry) => {
    // Support both { class, stream } objects and legacy plain strings
    const cls = typeof entry === 'string' ? entry : entry && entry.class;
    if (!cls || cls !== student.class) return false;
    const entryStream = typeof entry === 'string' ? null : entry.stream;
    if (entryStream) return entryStream === student.stream;
    if (streams.length > 0) return streams.includes(student.stream);
    return true;
  });
};

/** Is the student enrolled in a course taught by this teacher? */
const teachesStudentInCourse = async (teacherId, studentId, courseId) => {
  const count = await prisma.course.count({
    where: {
      teacherId,
      ...(courseId ? { id: courseId } : {}),
      students: { some: { id: studentId } }
    }
  });
  return count > 0;
};

/**
 * A teacher may act on a student if they teach the student's class/stream
 * OR teach a course the student is enrolled in.
 */
const canTeacherAccessStudent = async (teacher, student, courseId) => {
  if (!teacher || !student) return false;
  if (teachesClassOf(teacher, student)) return true;
  return teachesStudentInCourse(teacher.id, student.id, courseId);
};

/** Is this parent linked to this student? */
const isParentOf = async (parentId, studentId) => {
  const count = await prisma.user.count({
    where: { id: studentId, linkedParents: { some: { id: parentId } } }
  });
  return count > 0;
};

const isEnrolled = async (courseId, studentId) => {
  const count = await prisma.course.count({
    where: { id: courseId, students: { some: { id: studentId } } }
  });
  return count > 0;
};

/** Prisma `where` fragment: students in any of the teacher's class/stream pairs */
const teacherClassFilter = (teacher) => {
  const classes = Array.isArray(teacher.classesTaught) ? teacher.classesTaught : [];
  const streams = teacher.streamsTaught || [];
  return classes
    .map((entry) => {
      const cls = typeof entry === 'string' ? entry : entry && entry.class;
      if (!cls) return null;
      const stream = typeof entry === 'string' ? null : entry.stream;
      if (stream) return { class: cls, stream };
      if (streams.length) return { class: cls, stream: { in: streams } };
      return { class: cls };
    })
    .filter(Boolean);
};

/**
 * Who can a user see: students -> self, parents -> linked children,
 * teachers -> students they teach, admin -> everyone.
 */
const canViewStudent = async (user, studentId) => {
  if (user.role === 'admin') return true;
  if (user.role === 'student') return user.id === studentId;
  if (user.role === 'parent') return isParentOf(user.id, studentId);
  if (user.role === 'teacher') {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    return canTeacherAccessStudent(user, student);
  }
  return false;
};

module.exports = {
  teachesClassOf,
  teachesStudentInCourse,
  canTeacherAccessStudent,
  isParentOf,
  isEnrolled,
  teacherClassFilter,
  canViewStudent
};
