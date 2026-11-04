const { prisma } = require('../config/db');
const { asyncHandler } = require('../utils/helpers');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id }
  });

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (notification.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true }
  });

  res.json(updated);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true }
  });

  res.json({ message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id }
  });

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (notification.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await prisma.notification.delete({ where: { id: notification.id } });

  res.json({ message: 'Notification deleted' });
});

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, link } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ message: 'userId, title and message are required' });
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type || 'info',
      link: link || ''
    }
  });

  // Emit socket event for real-time notification
  const io = req.app.get('io');
  if (io) {
    io.to(userId).emit('notification', notification);
  }

  res.status(201).json(notification);
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};
