/**
 * Small shared helpers used by controllers.
 */

// Wrap async route handlers so thrown errors reach the central error handler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Throwable HTTP error
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Parse ?page=&limit= safely
const getPagination = (query, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

const paginated = (key, items, total, { page, limit }) => ({
  [key]: items,
  totalPages: Math.ceil(total / limit),
  currentPage: page,
  total
});

const round2 = (n) => Math.round(n * 100) / 100;

const percentage = (marks, total) => (total > 0 ? (marks / total) * 100 : 0);

// Letter grade from a percentage
const letterGrade = (pct) => {
  if (pct >= 90) return 'A+';
  if (pct >= 85) return 'A';
  if (pct >= 80) return 'A-';
  if (pct >= 75) return 'B+';
  if (pct >= 70) return 'B';
  if (pct >= 65) return 'B-';
  if (pct >= 60) return 'C+';
  if (pct >= 55) return 'C';
  if (pct >= 50) return 'C-';
  if (pct >= 45) return 'D+';
  if (pct >= 40) return 'D';
  return 'F';
};

// Only copy keys that were actually provided (undefined = "not sent")
const pickDefined = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

// Build a stored attachment list from multer files
const filesToAttachments = (files, folder) =>
  (files || []).map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    url: `/uploads/${folder}/${file.filename}`,
    size: file.size,
    uploadedAt: new Date().toISOString()
  }));

module.exports = {
  asyncHandler,
  HttpError,
  getPagination,
  paginated,
  round2,
  percentage,
  letterGrade,
  pickDefined,
  filesToAttachments
};
