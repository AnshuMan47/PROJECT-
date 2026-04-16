// services/pointsService.js
const User = require('../models/User');
const Answer = require('../models/Answer');

class PointsService {
  static async awardAnswerPoints(userId, answerId) {
    const user = await User.findById(userId);
    const pointsEarned = 5;
    
    user.points.earned += pointsEarned;
    user.points.total += pointsEarned;
    user.updateActivity();
    
    user.pointTransactions.push({
      type: 'answer',
      amount: pointsEarned,
      description: `Answered question (Answer ID: ${answerId})`,
      relatedAnswer: answerId
    });
    
    await user.save();
    return pointsEarned;
  }

  static async awardUpvoteBonus(userId, answerId) {
    const answer = await Answer.findById(answerId).populate('author');
    if (!answer || answer.pointsAwarded || answer.isRemoved) return 0;

    const upvotesCount = answer.upvotes.length;
    if (upvotesCount >= 5) {
      const bonusPoints = 5;
      const author = answer.author;
      
      author.points.earned += bonusPoints;
      author.points.total += bonusPoints;
      
      author.pointTransactions.push({
        type: 'upvote_bonus',
        amount: bonusPoints,
        description: `Answer got 5+ upvotes (Answer ID: ${answerId})`,
        relatedAnswer: answerId
      });
      
      answer.pointsAwarded = true;
      await answer.save();
      await author.save();
      
      return bonusPoints;
    }
    return 0;
  }

  static async deductPointsForRemoval(userId, answerId, reason = 'Answer removed') {
    const user = await User.findById(userId);
    const deduction = -5; // Match initial award
    
    user.points.total += deduction;
    user.points.spent -= deduction; // Reverse spent tracking
    
    user.pointTransactions.push({
      type: 'deduction',
      amount: deduction,
      description: `${reason} (Answer ID: ${answerId})`,
      relatedAnswer: answerId
    });
    
    await user.save();
    return deduction;
  }

  static async transferPoints(fromUserId, toUserId, amount) {
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    
    if (!fromUser.canTransferPoints() || fromUser.points.total < amount) {
      throw new Error('Insufficient points or transfer not allowed');
    }
    
    // Deduct from sender
    fromUser.points.total -= amount;
    fromUser.points.spent += amount;
    fromUser.pointTransactions.push({
      type: 'transfer_sent',
      amount: -amount,
      description: `Transferred ${amount} points to ${toUser.username}`,
      targetUser: toUserId
    });
    
    // Add to receiver
    toUser.points.total += amount;
    toUser.points.earned += amount;
    toUser.pointTransactions.push({
      type: 'transfer_received',
      amount,
      description: `Received ${amount} points from ${fromUser.username}`,
      targetUser: fromUserId
    });
    
    await fromUser.save();
    await toUser.save();
    
    return { success: true, amount };
  }
}

module.exports = PointsService;