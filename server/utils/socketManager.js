const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocketIO = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user to their own room
    socket.join(socket.userId);

    // Join role-based rooms
    socket.join(socket.userRole);

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Handle custom events
    socket.on('send_notification', async (data) => {
      // Emit to specific user
      if (data.targetUserId) {
        io.to(data.targetUserId).emit('notification', data.notification);
      }
    });

    socket.on('broadcast_announcement', (data) => {
      // Admin can broadcast to all users or specific role
      if (socket.userRole === 'admin') {
        if (data.targetRole) {
          io.to(data.targetRole).emit('announcement', data.message);
        } else {
          io.emit('announcement', data.message);
        }
      }
    });
  });

  return io;
};

module.exports = setupSocketIO;