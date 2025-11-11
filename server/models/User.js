const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent', 'admin'],
    required: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    sparse: true,
    unique: true
  },
  childEmail: {
    type: String,
    trim: true
  },
  teacherId: {
    type: String,
    sparse: true,
    unique: true
  },
  subjects: [{
    type: String
  }],
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Student-specific fields
  admissionNumber: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    trim: true
  },
  stream: {
    type: String,
    trim: true
  },
  linkedParents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Notification preferences
  notifications: {
    assignmentReminders: {
      type: Boolean,
      default: true
    },
    newGradesAlert: {
      type: Boolean,
      default: true
    },
    announcements: {
      type: Boolean,
      default: true
    }
  },
  // Theme and accessibility
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  textSize: {
    type: Number,
    default: 100,
    min: 50,
    max: 200
  },
  // Device sessions
  sessions: [{
    device: String,
    loginTime: Date,
    ipAddress: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);