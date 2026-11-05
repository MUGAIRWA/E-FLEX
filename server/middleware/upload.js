const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_ROOT = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.resolve(__dirname, '..', 'uploads');

/**
 * Build a multer instance for a sub-folder of /uploads.
 * FIX: folders are created up-front (multer's diskStorage with a function
 * destination does not create them, which crashed the first upload).
 */
const createUploader = (folder, { maxSizeMB, allowed, errorMessage }) => {
  const dir = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
      const mimeOk = allowed.test(file.mimetype);
      if (extOk && mimeOk) return cb(null, true);
      const err = new Error(errorMessage || 'Invalid file type');
      err.status = 400;
      cb(err);
    }
  });
};

const assignmentUpload = createUploader('assignments', {
  maxSizeMB: 10,
  allowed: /jpeg|jpg|png|gif|pdf|doc|docx|txt|msword|officedocument|text\/plain/
});

const materialUpload = createUploader('materials', {
  maxSizeMB: 50,
  allowed: /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|avi|mov|msword|officedocument|powerpoint|video/
});

const examUpload = createUploader('exams', {
  maxSizeMB: 10,
  allowed: /pdf|doc|docx|ppt|pptx|txt|rtf|msword|officedocument|powerpoint|text\/plain/,
  errorMessage: 'Invalid file type. Only documents and presentations are allowed.'
});

module.exports = { UPLOAD_ROOT, assignmentUpload, materialUpload, examUpload };
