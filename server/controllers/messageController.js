const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, conversationId } = req.body;

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if conversation exists or create new one
    let conversation = conversationId
      ? await Message.findOne({ conversationId })
      : null;

    if (!conversation) {
      // Create new conversation
      const newConversationId = `${req.user._id}_${receiverId}_${Date.now()}`;
      conversation = await Message.create({
        sender: req.user._id,
        receiver: receiverId,
        content,
        conversationId: newConversationId,
        isRead: false
      });
    } else {
      // Add message to existing conversation
      conversation.messages.push({
        sender: req.user._id,
        content,
        timestamp: new Date(),
        isRead: false
      });
      await conversation.save();
    }

    // Emit real-time message
    const io = req.app.get('io');
    io.to(receiverId).emit('new_message', {
      conversationId: conversation.conversationId,
      message: {
        sender: req.user._id,
        content,
        timestamp: new Date(),
        isRead: false
      },
      sender: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      conversationId: conversation.conversationId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'firstName lastName email role')
    .populate('receiver', 'firstName lastName email role')
    .sort({ updatedAt: -1 });

    // Group by conversationId and get latest message
    const conversationMap = new Map();

    conversations.forEach(conv => {
      const otherUser = conv.sender._id.toString() === req.user._id.toString()
        ? conv.receiver
        : conv.sender;

      const key = conv.conversationId;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          conversationId: key,
          otherUser,
          lastMessage: conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1]
            : { content: conv.content, timestamp: conv.createdAt },
          unreadCount: conv.messages.filter(msg =>
            msg.sender.toString() !== req.user._id.toString() && !msg.isRead
          ).length,
          updatedAt: conv.updatedAt
        });
      }
    });

    const result = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Message.findOne({ conversationId })
      .populate('sender', 'firstName lastName email role')
      .populate('receiver', 'firstName lastName email role')
      .populate('messages.sender', 'firstName lastName role');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of this conversation
    if (conversation.sender._id.toString() !== req.user._id.toString() &&
        conversation.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    // Mark messages as read
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString() && !msg.isRead) {
        msg.isRead = true;
      }
    });
    await conversation.save();

    // Get paginated messages
    const messages = conversation.messages
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice((page - 1) * limit, page * limit);

    res.json({
      conversation: {
        conversationId,
        otherUser: conversation.sender._id.toString() === req.user._id.toString()
          ? conversation.receiver
          : conversation.sender
      },
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversation.messages.length,
        pages: Math.ceil(conversation.messages.length / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Message.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is part of this conversation
    if (conversation.sender._id.toString() !== req.user._id.toString() &&
        conversation.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    // Mark messages from other user as read
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString() && !msg.isRead) {
        msg.isRead = true;
      }
    });

    await conversation.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    });

    let unreadCount = 0;

    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.sender.toString() !== req.user._id.toString() && !msg.isRead) {
          unreadCount++;
        }
      });
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationMessages,
  markAsRead,
  getUnreadCount
};
