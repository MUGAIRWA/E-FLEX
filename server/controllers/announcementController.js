const { prisma } = require('../config/db');
const { userWithRole } = require('../utils/selects');
const { asyncHandler, getPagination, paginated, pickDefined } = require('../utils/helpers');

const announcementInclude = {
  postedBy: { select: userWithRole }
};

// Helper function to check if user can view announcement
const canViewAnnouncement = (user, announcement) => {
  if (user.role === 'admin') return true;
  if (announcement.targetAudience === 'all') return true;
  if (user.role === 'student' && announcement.targetAudience === 'students') return true;
  if (user.role === 'parent' && announcement.targetAudience === 'parents') return true;
  if (
    user.role === 'teacher' &&
    ['teachers', 'students', 'parents'].includes(announcement.targetAudience)
  ) {
    return true;
  }
  return false;
};

// @desc    Get all announcements for user
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const { type, targetAudience } = req.query;
  const pageInfo = getPagination(req.query, 20);

  const where = { isActive: true };

  if (req.user.role === 'student') {
    where.targetAudience = { in: ['all', 'students'] };
  } else if (req.user.role === 'parent') {
    where.targetAudience = { in: ['all', 'parents'] };
  } else if (req.user.role === 'teacher') {
    where.targetAudience = { in: ['all', 'teachers', 'students', 'parents'] };
  }

  if (type && type !== 'all') {
    where.type = type;
  }

  if (targetAudience && targetAudience !== 'all') {
    where.targetAudience = targetAudience;
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: announcementInclude,
      orderBy: { createdAt: 'desc' },
      skip: pageInfo.skip,
      take: pageInfo.limit
    }),
    prisma.announcement.count({ where })
  ]);

  res.json(paginated('announcements', announcements, total, pageInfo));
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id: req.params.id },
    include: announcementInclude
  });

  if (!announcement) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  if (!canViewAnnouncement(req.user, announcement)) {
    return res.status(403).json({ message: 'Not authorized to view this announcement' });
  }

  res.json(announcement);
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private/Teacher+Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, type, targetAudience, priority, attachments } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'title and message are required' });
  }

  const audience = targetAudience || 'all';
  const announcement = await prisma.announcement.create({
    data: {
      title,
      message,
      type: type || 'general',
      targetAudience: audience,
      priority: priority || 'medium',
      attachments: Array.isArray(attachments) ? attachments : [],
      postedById: req.user.id
    },
    include: announcementInclude
  });

  // Emit socket event for real-time announcement
  const io = req.app.get('io');
  if (io) {
    const roomMap = {
      students: 'student',
      parents: 'parent',
      teachers: 'teacher'
    };
    if (audience === 'all') {
      io.emit('announcement', announcement);
    } else if (roomMap[audience]) {
      io.to(roomMap[audience]).emit('announcement', announcement);
    }
  }

  res.status(201).json(announcement);
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Teacher+Admin (own announcements only)
const updateAnnouncement = asyncHandler(async (req, res) => {
  const existing = await prisma.announcement.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  if (existing.postedById !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this announcement' });
  }

  const data = pickDefined(req.body, [
    'title',
    'message',
    'type',
    'targetAudience',
    'priority',
    'isActive',
    'attachments'
  ]);

  const announcement = await prisma.announcement.update({
    where: { id: existing.id },
    data,
    include: announcementInclude
  });

  res.json(announcement);
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Teacher+Admin (own announcements only)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const existing = await prisma.announcement.findUnique({ where: { id: req.params.id } });

  if (!existing) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  if (existing.postedById !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this announcement' });
  }

  await prisma.announcement.delete({ where: { id: existing.id } });

  res.json({ message: 'Announcement deleted' });
});

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
