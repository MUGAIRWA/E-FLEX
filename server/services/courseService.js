const { prisma } = require('../config/db');

/**
 * Normalize class strings like "Form 3", "form 3", "form3" -> "form3"
 */
const normalizeClassKey = (cls) => {
  if (!cls || typeof cls !== 'string') return '';
  return cls.trim().toLowerCase().replace(/\s+/g, '');
};

/**
 * Return all equivalent class representations so "form3" and "Form 3" both match
 */
const getClassVariants = (cls) => {
  const key = normalizeClassKey(cls);
  if (!key) return [];
  const match = key.match(/^form(\d+)$/);
  if (match) {
    const num = match[1];
    return [`form${num}`, `Form ${num}`, `FORM ${num}`, `Form${num}`];
  }
  return [cls.trim(), key];
};

/**
 * Human-readable label e.g. ("form3", "Blue") -> "Form 3 Blue"
 */
const formatClassStream = (cls, stream) => {
  const key = normalizeClassKey(cls);
  const match = key.match(/^form(\d+)$/);
  const prettyClass = match ? `Form ${match[1]}` : cls || '';
  return [prettyClass, stream].filter(Boolean).join(' ').trim() || 'All Students';
};

/**
 * Build a Prisma filter on User (role='student') for a given class & stream
 */
const buildStudentClassStreamWhere = (cls, stream) => {
  const variants = getClassVariants(cls);
  return {
    role: 'student',
    isActive: true,
    ...(variants.length > 0
      ? {
          OR: variants.map((v) => ({
            class: { equals: v, mode: 'insensitive' }
          }))
        }
      : {}),
    ...(stream
      ? { stream: { equals: String(stream).trim(), mode: 'insensitive' } }
      : {})
  };
};

/**
 * Build a Prisma filter on Course for a student's (id, class, stream)
 */
const buildStudentCourseAccessWhere = (student) => {
  if (!student) return { id: '__none__' };
  const orConditions = [{ students: { some: { id: student.id } } }];

  if (student.class) {
    const variants = getClassVariants(student.class);
    orConditions.push({
      AND: [
        {
          OR: variants.map((v) => ({
            class: { equals: v, mode: 'insensitive' }
          }))
        },
        ...(student.stream
          ? [
              {
                OR: [
                  { stream: { equals: student.stream.trim(), mode: 'insensitive' } },
                  { stream: null },
                  { stream: '' }
                ]
              }
            ]
          : [])
      ]
    });
  }

  return { OR: orConditions };
};

/**
 * Find all children (students) linked to a parent account (by relation or childEmail)
 */
const getParentLinkedStudents = async (parentUser) => {
  if (!parentUser) return [];

  const orFilters = [
    { linkedParents: { some: { id: parentUser.id } } },
    { children: { some: { id: parentUser.id } } }
  ];

  if (parentUser.childEmail && parentUser.childEmail.trim()) {
    const childKey = parentUser.childEmail.trim();
    orFilters.push({
      email: { equals: childKey, mode: 'insensitive' }
    });
    orFilters.push({
      admissionNumber: { equals: childKey, mode: 'insensitive' }
    });
  }

  if (parentUser.phoneNumber && parentUser.phoneNumber.trim()) {
    orFilters.push({
      phoneNumber: { equals: parentUser.phoneNumber.trim() }
    });
  }

  const students = await prisma.user.findMany({
    where: {
      role: 'student',
      isActive: true,
      OR: orFilters
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

  return students;
};

/**
 * Build a Prisma filter on Course for a parent's linked children
 */
const buildParentCourseAccessWhere = async (parentUser) => {
  const children = await getParentLinkedStudents(parentUser);
  if (children.length === 0) {
    return { students: { some: { linkedParents: { some: { id: parentUser.id } } } } };
  }

  const orConditions = children.map((child) => buildStudentCourseAccessWhere(child));
  return { OR: orConditions };
};

/**
 * Find all students in a course's class/stream AND all parents linked to those students
 */
const getRecipientsForCourse = async (course) => {
  if (!course) {
    return { studentIds: [], parentIds: [], students: [], classStreamLabel: '' };
  }

  const enrolledIds = Array.isArray(course.students)
    ? course.students.map((s) => s.id)
    : [];

  const classStreamStudents =
    course.class || course.stream
      ? await prisma.user.findMany({
          where: buildStudentClassStreamWhere(course.class, course.stream),
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            class: true,
            stream: true
          }
        })
      : [];

  const allStudentIds = [
    ...new Set([...enrolledIds, ...classStreamStudents.map((s) => s.id)])
  ];

  if (allStudentIds.length === 0) {
    return {
      studentIds: [],
      parentIds: [],
      students: [],
      classStreamLabel: formatClassStream(course.class, course.stream)
    };
  }

  const studentsWithEmails = await prisma.user.findMany({
    where: { id: { in: allStudentIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      admissionNumber: true,
      phoneNumber: true,
      class: true,
      stream: true
    }
  });

  const studentEmails = studentsWithEmails
    .map((s) => s.email)
    .filter(Boolean);
  const studentAdmissions = studentsWithEmails
    .map((s) => s.admissionNumber)
    .filter(Boolean);
  const studentPhones = studentsWithEmails
    .map((s) => s.phoneNumber)
    .filter(Boolean);

  // Find all parents linked to any of these students via relation, childEmail, admissionNumber, or phoneNumber
  const parents = await prisma.user.findMany({
    where: {
      role: 'parent',
      isActive: true,
      OR: [
        { children: { some: { id: { in: allStudentIds } } } },
        { linkedParents: { some: { id: { in: allStudentIds } } } },
        ...(studentEmails.length > 0
          ? studentEmails.map((em) => ({
              childEmail: { equals: em, mode: 'insensitive' }
            }))
          : []),
        ...(studentAdmissions.length > 0
          ? studentAdmissions.map((adm) => ({
              childEmail: { equals: adm, mode: 'insensitive' }
            }))
          : []),
        ...(studentPhones.length > 0
          ? studentPhones.map((ph) => ({
              phoneNumber: { equals: ph }
            }))
          : [])
      ]
    },
    select: { id: true, firstName: true, lastName: true, email: true, childEmail: true }
  });

  return {
    studentIds: allStudentIds,
    parentIds: [...new Set(parents.map((p) => p.id))],
    students: studentsWithEmails,
    parents,
    classStreamLabel: formatClassStream(course.class, course.stream)
  };
};

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
      include: { students: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });
    if (course) return course;
  }

  const resolvedSubject =
    subject ||
    (Array.isArray(teacher.subjects) && teacher.subjects[0]) ||
    'General';

  let cls = className ? normalizeClassKey(className) : null;
  let str = stream ? String(stream).trim() : null;

  if (!cls && Array.isArray(teacher.classesTaught) && teacher.classesTaught.length > 0) {
    const first = teacher.classesTaught[0];
    if (typeof first === 'string') {
      cls = normalizeClassKey(first);
      str = (Array.isArray(teacher.streamsTaught) && teacher.streamsTaught[0]) || null;
    } else if (first && typeof first === 'object') {
      cls = normalizeClassKey(first.class) || null;
      str = first.stream || null;
    }
  }

  const classVariants = cls ? getClassVariants(cls) : [];

  course = await prisma.course.findFirst({
    where: {
      teacherId: teacher.id,
      subject: { equals: resolvedSubject, mode: 'insensitive' },
      ...(classVariants.length > 0
        ? {
            OR: classVariants.map((v) => ({
              class: { equals: v, mode: 'insensitive' }
            }))
          }
        : {}),
      ...(str ? { stream: { equals: str, mode: 'insensitive' } } : {})
    },
    include: { students: { select: { id: true, firstName: true, lastName: true, email: true } } }
  });

  // Find students belonging to this class/stream so they are enrolled & notified
  const matchingStudents = await prisma.user.findMany({
    where: buildStudentClassStreamWhere(cls, str),
    select: { id: true }
  });

  if (!course) {
    const classLabel = formatClassStream(cls, str);
    const title =
      cls || str ? `${resolvedSubject} (${classLabel})` : resolvedSubject;

    course = await prisma.course.create({
      data: {
        title,
        description: `${resolvedSubject} course${cls || str ? ` for ${classLabel}` : ''}`,
        subject: resolvedSubject,
        teacherId: teacher.id,
        class: cls,
        stream: str,
        students: matchingStudents.length
          ? { connect: matchingStudents.map((s) => ({ id: s.id })) }
          : undefined
      },
      include: { students: { select: { id: true, firstName: true, lastName: true, email: true } } }
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
        include: { students: { select: { id: true, firstName: true, lastName: true, email: true } } }
      });
    }
  }

  return course;
};

module.exports = {
  normalizeClassKey,
  getClassVariants,
  formatClassStream,
  buildStudentClassStreamWhere,
  buildStudentCourseAccessWhere,
  buildParentCourseAccessWhere,
  getParentLinkedStudents,
  getRecipientsForCourse,
  ensureTeacherCourse
};

