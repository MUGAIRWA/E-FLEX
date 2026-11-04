const { Prisma } = require('@prisma/client');
const multer = require('multer');

/**
 * Backward compatibility with the Mongo-era API: every object that has an `id`
 * also gets `_id`, so the React client (which reads `_id`) keeps working.
 * Password hashes are always stripped as a safety net.
 */
const addLegacyIds = (value) => {
  if (Array.isArray(value)) return value.map(addLegacyIds);
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value;

  const out = {};
  for (const [key, v] of Object.entries(value)) {
    if (key === 'password' || key === 'tokenHash') continue;
    out[key] = addLegacyIds(v);
  }
  if (out.id !== undefined && out._id === undefined) out._id = out.id;
  return out;
};

const legacyIdSerializer = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => originalJson(addLegacyIds(body));
  next();
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Central error handler: maps Prisma / multer errors to sensible HTTP codes
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        status = 409;
        const fields = (err.meta && err.meta.target) || [];
        message = `A record with this ${[].concat(fields).join(', ') || 'value'} already exists`;
        break;
      }
      case 'P2003':
        status = 409;
        message = 'This record is referenced by other data and cannot be changed or deleted';
        break;
      case 'P2025':
        status = 404;
        message = 'Record not found';
        break;
      default:
        status = 400;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    status = 400;
    message = 'Invalid request data';
  } else if (err instanceof multer.MulterError) {
    status = 400;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status >= 500) console.error(err);

  const body = { message };
  if (process.env.NODE_ENV === 'development' && status >= 500) body.error = err.message;
  res.status(status).json(body);
};

module.exports = { legacyIdSerializer, notFound, errorHandler, addLegacyIds };
