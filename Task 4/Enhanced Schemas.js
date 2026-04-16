// models/User.js (Updated with points)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ... existing fields (subscription, etc.) ...
  points: { 
    total: { type: Number, default: 0 },
    earned: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    lastActivityDate: { type: Date }
  },
  pointTransactions: [{
    type: { 
      type: String, 
      enum: ['answer', 'upvote_bonus', 'transfer_sent', 'transfer_received', 'deduction'] 
    },
    amount: Number,
    description: String,
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }
  }]
}, { timestamps: true });

// Prevent transfers if ≤10 points
userSchema.methods.canTransferPoints = function() {
  return this.points.total > 10;
};

// Update daily activity tracking
userSchema.methods.updateActivity = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  this.points.lastActivityDate = today;
};

module.exports = mongoose.model('User', userSchema);

// models/Answer.js (for question-answer system)
const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isRemoved: { type: Boolean, default: false },
  pointsAwarded: { type: Boolean, default: false } // Track if 5-upvote bonus given
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);