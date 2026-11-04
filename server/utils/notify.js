const { prisma } = require('../config/db');

/**
 * Persist notifications AND push them in real time.
 * (Previously most events were only emitted over the socket and lost if the
 * user was offline.)
 */
const notifyUsers = async (io, userIds, { title, message, type = 'info', link = '' }) => {
  const ids = [...new Set((userIds || []).filter(Boolean).map(String))];
  if (ids.length === 0) return;

  try {
    await prisma.notification.createMany({
      data: ids.map((userId) => ({ userId, title, message, type, link }))
    });
  } catch (error) {
    // Notifications are best-effort; never fail the main request because of them
    console.error('Failed to persist notifications:', error.message);
  }

  if (io) {
    const payload = { title, message, type, link, createdAt: new Date() };
    ids.forEach((id) => io.to(id).emit('notification', payload));
  }
};

module.exports = { notifyUsers };
