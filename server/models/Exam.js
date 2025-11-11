const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment'],
    default: 'quiz'
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [String], // for multiple choice
    correctAnswer: String,
    marks: {
      type: Number,
      default: 1
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'short-answer', 'essay'],
      default: 'multiple-choice'
    }
  }],
  results: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [{
      questionIndex: Number,
      answer: String,
      marks: Number
    }],
    totalMarks: Number,
    percentage: Number,
    grade: String,
    submittedAt: Date,
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);
