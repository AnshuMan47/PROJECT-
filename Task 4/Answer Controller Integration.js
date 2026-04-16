// controllers/answerController.js
const Answer = require('../models/Answer');
const PointsService = require('../services/pointsService');
const User = require('../models/User');

// Create answer (award points)
const createAnswer = async (req, res) => {
  try {
    // ... validation & question check ...
    
    const answer = new Answer({
      questionId: req.body.questionId,
      author: req.user.id,
      content: req.body.content
    });
    
    await answer.save();
    
    // Award points immediately
    await PointsService.awardAnswerPoints(req.user.id, answer._id);
    
    await answer.populate('author', 'username points');
    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove answer (deduct points)
const removeAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Deduct points if previously awarded
    if (!answer.isRemoved && answer.pointsAwarded) {
      await PointsService.deductPointsForRemoval(answer.author._id, answer._id);
    }
    
    answer.isRemoved = true;
    await answer.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};