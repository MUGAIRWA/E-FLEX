const { prisma } = require('../config/db');
const { userWithRole } = require('../utils/selects');
const { asyncHandler, getPagination } = require('../utils/helpers');

const buildConversationId = (userA, userB) => [String(userA), String(userB)].sort().join('_');

const messageInclude = {
  sender: { select: userWithRole },
  receiver: { select: userWithRole }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, conversationId, messageType, fileUrl, fileName } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ message: 'receiverId and content are required' });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return res.status(404).json({ message: 'Receiver not found' });
  }

  const convId = conversationId || buildConversationId(req.user.id, receiverId);

  const created = await prisma.message.create({
    data: {
      conversationId: convId,
      senderId: req.user.id,
      receiverId,
      content,
      ...(messageType ? { messageType } : {}),
      ...(fileUrl ? { fileUrl } : {}),
      ...(fileName ? { fileName } : {})
    },
    include: messageInclude
  });

  // Emit real-time message
  const io = req.app.get('io');
  if (io) {
    io.to(receiverId).emit('new_message', {
      conversationId: convId,
      message: {
        id: created.id,
        sender: req.user.id,
        senderId: req.user.id,
        content: created.content,
        timestamp: created.createdAt,
        createdAt: created.createdAt,
        isRead: false
      },
      sender: {
        id: req.user.id,
        _id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  }

  res.status(201).json({
    message: 'Message sent successfully',
    conversationId: convId,
    data: created
  });
});

// @desc    Get conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    },
    include: messageInclude,
    orderBy: { createdAt: 'desc' }
  });

  const conversationMap = new Map();

  for (const msg of messages) {
    const key = msg.conversationId;
    const otherUser = msg.senderId === req.user.id ? msg.receiver : msg.sender;

    if (!conversationMap.has(key)) {
      conversationMap.set(key, {
        conversationId: key,
        otherUser,
        lastMessage: {
          id: msg.id,
          sender: msg.senderId,
          content: msg.content,
          timestamp: msg.createdAt,
          isRead: msg.isRead
        },
        unreadCount: 0,
        updatedAt: msg.createdAt
      });
    }

    if (msg.receiverId === req.user.id && !msg.isRead) {
      conversationMap.get(key).unreadCount += 1;
    }
  }

  res.json(Array.from(conversationMap.values()));
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const pageInfo = getPagination(req.query, 50);

  const firstMsg = await prisma.message.findFirst({
    where: { conversationId },
    include: messageInclude
  });

  if (!firstMsg) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  if (firstMsg.senderId !== req.user.id && firstMsg.receiverId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to view this conversation' });
  }

  // Mark unread messages directed to current user as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: req.user.id,
      isRead: false
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      include: messageInclude,
      orderBy: { createdAt: 'asc' },
      skip: pageInfo.skip,
      take: pageInfo.limit
    }),
    prisma.message.count({ where: { conversationId } })
  ]);

  const otherUser = firstMsg.senderId === req.user.id ? firstMsg.receiver : firstMsg.sender;

  res.json({
    conversation: {
      conversationId,
      otherUser
    },
    messages,
    pagination: {
      page: pageInfo.page,
      limit: pageInfo.limit,
      total,
      pages: Math.ceil(total / pageInfo.limit)
    }
  });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const firstMsg = await prisma.message.findFirst({ where: { conversationId } });

  if (!firstMsg) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  if (firstMsg.senderId !== req.user.id && firstMsg.receiverId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to access this conversation' });
  }

  await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: req.user.id,
      isRead: false
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });

  res.json({ message: 'Messages marked as read' });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await prisma.message.count({
    where: {
      receiverId: req.user.id,
      isRead: false
    }
  });

  res.json({ unreadCount });
});

module.exports = {
  sendMessage,
  getConversations,
  getConversationMessages,
  markAsRead,
  getUnreadCount
};
