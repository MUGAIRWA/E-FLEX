const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @desc    Get all announcements for user
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, targetAudience } = req.params;

    // Build query based on user role
    let query = { isActive: true };

    if (req.user.role === 'student') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' }
      ];
    } else if (req.user.role === 'parent') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'parents' }
      ];
    } else if (req.user.role === 'teacher') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'teachers' },
        { targetAudience: 'students' },
        { targetAudience: 'parents' }
      ];
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (targetAudience && targetAudience !== 'all') {
      query.targetAudience = targetAudience;
    }

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('postedBy', 'firstName lastName role');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can view this announcement
    if (!canViewAnnouncement(req.user, announcement)) {
      return res.status(403).json({ message: 'Not authorized to view this announcement' });
    }

    res.json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private/Teacher+Admin
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, targetAudience, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      type: type || 'general',
      targetAudience: targetAudience || 'all',
      priority: priority || 'medium',
      postedBy: req.user._id
    });

    // Populate postedBy for response
    await announcement.populate('postedBy', 'firstName lastName role');

    // Emit socket event for real-time announcement
    const io = req.app.get('io');
    io.emit('announcement', {
      ...announcement.toObject(),
      postedBy: announcement.postedBy
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Teacher+Admin (own announcements only)
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can update this announcement
    if (announcement.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    const { title, message, type, targetAudience, priority, isActive } = req.body;

    announcement.title = title || announcement.title;
    announcement.message = message || announcement.message;
    announcement.type = type || announcement.type;
    announcement.targetAudience = targetAudience || announcement.targetAudience;
    announcement.priority = priority || announcement.priority;
    announcement.isActive = isActive !== undefined ? isActive : announcement.isActive;
    announcement.updatedAt = new Date();

    await announcement.save();
    await announcement.populate('postedBy', 'firstName lastName role');

    res.json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Teacher+Admin (own announcements only)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can delete this announcement
    if (announcement.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await announcement.deleteOne();

    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to check if user can view announcement
const canViewAnnouncement = (user, announcement) => {
  if (user.role === 'admin') return true;

  if (announcement.targetAudience === 'all') return true;

  if (user.role === 'student' && announcement.targetAudience === 'students') return true;
  if (user.role === 'parent' && announcement.targetAudience === 'parents') return true;
  if (user.role === 'teacher' && (announcement.targetAudience === 'teachers' || announcement.targetAudience === 'students' || announcement.targetAudience === 'parents')) return true;

  return false;
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
