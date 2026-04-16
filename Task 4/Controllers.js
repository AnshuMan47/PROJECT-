// controllers/pointsController.js
const PointsService = require('../services/pointsService');
const User = require('../models/User');
const Answer = require('../models/Answer');

// Get user points & transactions
const getUserPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('pointTransactions.targetUser', 'username')
      .lean();
    
    res.json({
      points: user.points,
      transactions: user.pointTransactions.slice(-20).reverse() // Last 20
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Transfer points
const transferPoints = async (req, res) => {
  try {
    const { toUsername, amount } = req.body;
    
    const toUser = await User.findOne({ username: toUsername });
    if (!toUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (amount <= 0 || !Number.isInteger(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    const result = await PointsService.transferPoints(req.user.id, toUser._id, amount);
    res.json(result);
  } catch (error) {
    res.status(error.message.includes('Insufficient') ? 400 : 500).json({ 
      error: error.message 
    });
  }
};

// Answer upvote (with bonus logic)
const upvoteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const answer = await Answer.findById(answerId);
    
    if (!answer.upvotes.includes(req.user.id)) {
      answer.upvotes.push(req.user.id);
      
      // Check for bonus points
      await PointsService.awardUpvoteBonus(answer.author._id, answerId);
      
      await answer.save();
    }
    
    res.json({ upvotes: answer.upvotes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserPoints,
  transferPoints,
  upvoteAnswer
};