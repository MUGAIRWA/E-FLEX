const path = require('path');
const dotenv = require('dotenv');

// Load env vars before importing modules that read process.env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const setupSocketIO = require('./utils/socketManager');
const { legacyIdSerializer, notFound, errorHandler } = require('./middleware/http');
const { UPLOAD_ROOT } = require('./middleware/upload');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const normalized = origin.replace(/\/+$/, '');
  if (
    allowedOrigins.includes('*') ||
    allowedOrigins.includes(normalized) ||
    normalized.endsWith('.vercel.app')
  ) {
    return callback(null, true);
  }
  return callback(new Error(`Origin ${origin} not allowed by CORS`));
};

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup Socket.IO
setupSocketIO(io);

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(legacyIdSerializer);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/subjects', require('./routes/subjects'));

// Serve static files from uploads directory
app.use('/uploads', express.static(UPLOAD_ROOT));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready for connections`);
});