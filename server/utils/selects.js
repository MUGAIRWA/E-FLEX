/**
 * Reusable Prisma `select` shapes (replace Mongoose `.populate(path, fields)`).
 */

const userBrief = { id: true, firstName: true, lastName: true };
const userWithEmail = { ...userBrief, email: true };
const userWithRole = { ...userBrief, email: true, role: true };
const studentBrief = { ...userBrief, email: true, admissionNumber: true, class: true, stream: true };

// Every User column except password
const userPublic = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  phoneNumber: true,
  profileImage: true,
  isActive: true,
  lastLogin: true,
  studentId: true,
  admissionNumber: true,
  class: true,
  stream: true,
  address: true,
  dateOfBirth: true,
  childEmail: true,
  teacherId: true,
  subjects: true,
  classesTaught: true,
  streamsTaught: true,
  notifications: true,
  theme: true,
  textSize: true,
  language: true,
  sessions: true,
  createdAt: true,
  updatedAt: true
};

module.exports = { userBrief, userWithEmail, userWithRole, studentBrief, userPublic };
