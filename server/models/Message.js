const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  conversationId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient conversation queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Generate conversation ID from sender and receiver IDs
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = ids.join('_');
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
