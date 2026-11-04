const { prisma } = require('../config/db');

/**
 * Find or auto-create a teacher's Course for a given (subject, class, stream)
 * so teachers can upload Notes, Videos, Assignments, and Quizzes directly by
 * selecting their Subject and Class/Stream without needing an Admin to
 * pre-create a Course first.
 *
 * Also syncs matching students in that class/stream into the course.
 */
const ensureTeacherCourse = async (teacher, { courseId, subject, className, stream } = {}) => {
  let course = null;

  if (courseId) {
    course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { students: { select: { id: true } } }
    });
    if (course) return course;
  }

  const resolvedSubject =
    subject ||
    (Array.isArray(teacher.subjects) && teacher.subjects[0]) ||
    'General';

  let cls = className || null;
  let str = stream || null;

  if (!cls && Array.isArray(teacher.classesTaught) && teacher.classesTaught.length > 0) {
    const first = teacher.classesTaught[0];
    if (typeof first === 'string') {
      cls = first;
      str = (Array.isArray(teacher.streamsTaught) && teacher.streamsTaught[0]) || null;
    } else if (first && typeof first === 'object') {
      cls = first.class || null;
      str = first.stream || null;
    }
  }

  course = await prisma.course.findFirst({
    where: {
      teacherId: teacher.id,
      subject: resolvedSubject,
      ...(cls ? { class: cls } : {}),
      ...(str ? { stream: str } : {})
    },
    include: { students: { select: { id: true } } }
  });

  // Find students belonging to this class/stream so they are enrolled & notified
  const studentWhere = {
    role: 'student',
    isActive: true,
    ...(cls ? { class: cls } : {}),
    ...(str ? { stream: str } : {})
  };
  const matchingStudents = await prisma.user.findMany({
    where: studentWhere,
    select: { id: true }
  });

  if (!course) {
    const classLabel = [cls, str].filter(Boolean).join(' ');
    const title = classLabel ? `${resolvedSubject} (${classLabel})` : resolvedSubject;

    course = await prisma.course.create({
      data: {
        title,
        description: `${resolvedSubject} course${classLabel ? ` for ${classLabel}` : ''}`,
        subject: resolvedSubject,
        teacherId: teacher.id,
        class: cls,
        stream: str,
        students: matchingStudents.length
          ? { connect: matchingStudents.map((s) => ({ id: s.id })) }
          : undefined
      },
      include: { students: { select: { id: true } } }
    });
  } else if (matchingStudents.length > 0) {
    const existingIds = new Set(course.students.map((s) => s.id));
    const toConnect = matchingStudents.filter((s) => !existingIds.has(s.id));
    if (toConnect.length > 0) {
      course = await prisma.course.update({
        where: { id: course.id },
        data: {
          students: { connect: toConnect.map((s) => ({ id: s.id })) }
        },
        include: { students: { select: { id: true } } }
      });
    }
  }

  return course;
};

module.exports = { ensureTeacherCourse };

