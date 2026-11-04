const { prisma } = require('../config/db');
const { asyncHandler } = require('../utils/helpers');
const { teachesClassOf } = require('../utils/permissions');
const { userWithRole } = require('../utils/selects');

const buildConversationId = (userA, userB) => [String(userA), String(userB)].sort().join('_');

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

  const io = req.app.get('io');
  if (io) {
    io.to(userId).emit('notification', notification);
  }

  res.status(201).json(notification);
});

// @desc    Student requests help in a particular subject / topic -> notifies matching teachers
// @route   POST /api/notifications/help-request
// @access  Private/Student
const createHelpRequest = asyncHandler(async (req, res) => {
  const { subject, topic, details, urgency = 'medium', teacherId } = req.body;

  if (!subject || !topic || !details) {
    return res.status(400).json({ message: 'subject, topic and details are required' });
  }

  let targetTeachers = [];

  if (teacherId) {
    const t = await prisma.user.findUnique({ where: { id: teacherId } });
    if (t && t.role === 'teacher') targetTeachers = [t];
  }

  if (targetTeachers.length === 0) {
    // Find active teachers teaching this subject
    const subjectTeachers = await prisma.user.findMany({
      where: {
        role: 'teacher',
        isActive: true,
        subjects: { has: subject }
      }
    });

    // Prefer teachers who also teach this student's class/stream
    const classMatched = subjectTeachers.filter((t) => teachesClassOf(t, req.user));
    if (classMatched.length > 0) {
      targetTeachers = classMatched;
    } else if (subjectTeachers.length > 0) {
      targetTeachers = subjectTeachers;
    } else {
      // Fallback: any active teacher so help requests are never lost
      targetTeachers = await prisma.user.findMany({
        where: { role: 'teacher', isActive: true },
        take: 5
      });
    }
  }

  const studentName = `${req.user.firstName} ${req.user.lastName}`;
  const classLabel = [req.user.class, req.user.stream].filter(Boolean).join(' ');
  const classTag = classLabel ? ` (${classLabel})` : '';
  const title = `Help Needed in ${subject}: ${topic}`;
  const messageText = `${studentName}${classTag} needs help with "${topic}" [${urgency} priority]: ${details}`;
  const formattedMsgContent = `[Help Request • ${subject} — ${topic} (${urgency}) | studentId:${req.user.id}] ${details}`;

  const io = req.app.get('io');
  const createdNotifications = [];

  for (const teacher of targetTeachers) {
    const notification = await prisma.notification.create({
      data: {
        userId: teacher.id,
        title,
        message: messageText,
        type: 'help_request',
        link: `progress?studentId=${req.user.id}`
      }
    });
    createdNotifications.push(notification);

    const convId = buildConversationId(req.user.id, teacher.id);
    await prisma.message.create({
      data: {
        conversationId: convId,
        senderId: req.user.id,
        receiverId: teacher.id,
        content: formattedMsgContent
      }
    });

    if (io) {
      io.to(teacher.id).emit('notification', notification);
      io.to(teacher.id).emit('student_help_request', {
        notification,
        student: {
          id: req.user.id,
          name: studentName,
          class: req.user.class,
          stream: req.user.stream
        },
        subject,
        topic,
        details,
        urgency
      });
    }
  }

  res.status(201).json({
    message:
      targetTeachers.length > 0
        ? `Help request sent to ${targetTeachers.map((t) => `${t.firstName} ${t.lastName}`).join(', ')}`
        : 'Help request recorded',
    teachersNotified: targetTeachers.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`
    })),
    notifications: createdNotifications
  });
});

// @desc    Get student help requests (for teachers or students)
// @route   GET /api/notifications/help-requests
// @access  Private
const getHelpRequests = asyncHandler(async (req, res) => {
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    const notifications = await prisma.notification.findMany({
      where: {
        ...(req.user.role === 'teacher' ? { userId: req.user.id } : {}),
        type: 'help_request'
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Also pull student info if studentId is embedded in link
    const studentIds = [
      ...new Set(
        notifications
          .map((n) => {
            const match = (n.link || '').match(/studentId=([a-f0-9-]+)/i);
            return match ? match[1] : null;
          })
          .filter(Boolean)
      )
    ];

    const students = studentIds.length
      ? await prisma.user.findMany({
          where: { id: { in: studentIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            class: true,
            stream: true,
            admissionNumber: true
          }
        })
      : [];
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const helpRequests = notifications.map((n) => {
      const idMatch = (n.link || '').match(/studentId=([a-f0-9-]+)/i);
      const studentId = idMatch ? idMatch[1] : null;
      const titleMatch = (n.title || '').match(/^Help Needed in ([^:]+):\s*(.+)$/);
      const urgencyMatch = (n.message || '').match(/\[(\w+)\s+priority\]/i);
      const detailsMatch = (n.message || '').split('priority]: ');

      return {
        id: n.id,
        studentId,
        student: studentId ? studentMap.get(studentId) || null : null,
        subject: titleMatch ? titleMatch[1].trim() : 'General',
        topic: titleMatch ? titleMatch[2].trim() : n.title,
        urgency: urgencyMatch ? urgencyMatch[1].toLowerCase() : 'medium',
        details: detailsMatch.length > 1 ? detailsMatch.slice(1).join('priority]: ') : n.message,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt
      };
    });

    return res.json({ helpRequests });
  }

  // Student view: return help requests sent by this student + any teacher replies
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    },
    include: {
      sender: { select: userWithRole },
      receiver: { select: userWithRole }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const requests = messages
    .filter((m) => m.senderId === req.user.id && m.content.startsWith('[Help Request •'))
    .map((m) => {
      const headerMatch = m.content.match(
        /^\[Help Request • ([^—]+)—\s*([^(]+)\((\w+)\)[^\]]*\]\s*([\s\S]*)$/
      );
      // Find latest reply in the same conversation after this request
      const replies = messages.filter(
        (r) =>
          r.conversationId === m.conversationId &&
          r.senderId !== req.user.id &&
          new Date(r.createdAt) >= new Date(m.createdAt)
      );
      return {
        id: m.id,
        subject: headerMatch ? headerMatch[1].trim() : 'General',
        topic: headerMatch ? headerMatch[2].trim() : 'Coursework',
        urgency: headerMatch ? headerMatch[3].trim() : 'medium',
        details: headerMatch ? headerMatch[4].trim() : m.content,
        teacher: m.receiver,
        replies: replies.map((r) => ({
          id: r.id,
          content: r.content,
          teacherName: `${r.sender.firstName} ${r.sender.lastName}`,
          createdAt: r.createdAt
        })),
        createdAt: m.createdAt
      };
    });

  res.json({ helpRequests: requests });
});

// @desc    Teacher replies to a student help request & notifies the student
// @route   POST /api/notifications/help-requests/:id/reply
// @access  Private/Teacher+Admin
const replyToHelpRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId, reply, subject = 'Study Help', topic = 'Your Question' } = req.body;

  if (!reply || !reply.trim()) {
    return res.status(400).json({ message: 'Reply message is required' });
  }

  const notification = await prisma.notification.findUnique({ where: { id } });
  let targetStudentId = studentId;

  if (notification) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true }
    });
    if (!targetStudentId) {
      const idMatch = (notification.link || '').match(/studentId=([a-f0-9-]+)/i);
      if (idMatch) targetStudentId = idMatch[1];
    }
  }

  if (!targetStudentId) {
    return res.status(400).json({ message: 'Could not determine student for this help request' });
  }

  const teacherName = `${req.user.firstName} ${req.user.lastName}`;
  const convId = buildConversationId(req.user.id, targetStudentId);

  const msg = await prisma.message.create({
    data: {
      conversationId: convId,
      senderId: req.user.id,
      receiverId: targetStudentId,
      content: `Reply on ${subject} (${topic}): ${reply.trim()}`
    }
  });

  const studentNotification = await prisma.notification.create({
    data: {
      userId: targetStudentId,
      title: `Teacher Replied: ${subject} — ${topic}`,
      message: `${teacherName}: "${reply.trim()}"`,
      type: 'success',
      link: 'support'
    }
  });

  const io = req.app.get('io');
  if (io) {
    io.to(targetStudentId).emit('notification', studentNotification);
  }

  res.json({
    message: 'Reply sent to student',
    data: msg
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createHelpRequest,
  getHelpRequests,
  replyToHelpRequest
};
