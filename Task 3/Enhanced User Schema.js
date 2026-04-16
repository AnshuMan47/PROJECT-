// models/User.js (Updated with subscriptions)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ... existing fields ...
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'bronze', 'silver', 'gold'], 
      default: 'free' 
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    questionsToday: { type: Number, default: 0 },
    lastQuestionDate: { type: Date }
  }
}, { timestamps: true });

userSchema.methods.getDailyQuestionLimit = function() {
  const limits = {
    free: 1,
    bronze: 5,
    silver: 10,
    gold: Infinity
  };
  return limits[this.subscription.plan];
};

userSchema.methods.hasQuestionLimitReached = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.subscription.lastQuestionDate < today) {
    this.subscription.questionsToday = 0;
    this.subscription.lastQuestionDate = today;
    await this.save();
  }
  
  return this.subscription.questionsToday >= this.getDailyQuestionLimit();
};

module.exports = mongoose.model('User', userSchema);