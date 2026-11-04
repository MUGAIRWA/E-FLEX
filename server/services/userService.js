const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

/**
 * Password handling lives here explicitly instead of in a model hook.
 * FIX: the old Mongoose pre('save') hook called next() without `return`
 * and re-hashed the already-hashed password on every save (e.g. updating
 * lastLogin), locking users out. Now we only hash when a new password is set.
 */
const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

const matchPassword = (plain, hash) => bcrypt.compare(plain || '', hash || '');

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : email);

const validatePassword = (password) => typeof password === 'string' && password.length >= 6;

const ROLES = ['student', 'teacher', 'parent', 'admin'];

/** Create a user, hashing the password and wiring up relations. Pass `client` to run inside a transaction. */
const createUser = async (data, client = prisma) => {
  const { password, linkedParents, email, ...rest } = data;

  if (!validatePassword(password)) {
    const err = new Error('Password must be at least 6 characters');
    err.status = 400;
    throw err;
  }
  if (!ROLES.includes(rest.role)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }

  return client.user.create({
    data: {
      ...rest,
      email: normalizeEmail(email),
      password: await hashPassword(password),
      ...(Array.isArray(linkedParents) && linkedParents.length
        ? { linkedParents: { connect: linkedParents.map((id) => ({ id })) } }
        : {})
    }
  });
};

const emailTaken = async (email, exceptUserId) => {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  return Boolean(user && user.id !== exceptUserId);
};

module.exports = {
  hashPassword,
  matchPassword,
  normalizeEmail,
  validatePassword,
  createUser,
  emailTaken,
  ROLES
};
