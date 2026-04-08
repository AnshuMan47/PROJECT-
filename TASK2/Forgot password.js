// middleware/forgotPasswordLimit.js
const User = require('../models/User');

const checkForgotPasswordLimit = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    
    // Find user by email OR phone
    const user = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { phone }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Reset daily counter if new day
    if (!user.lastForgotRequest || user.lastForgotRequest < today) {
      user.forgotPasswordRequests = 0;
      user.lastForgotRequest = today;
    }
    
    if (user.forgotPasswordRequests >= 1) {
      return res.status(429).json({
        error: 'You can use this option only one time per day.',
        retryAfter: 24 * 60 * 60 * 1000 // 24 hours in ms
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkForgotPasswordLimit;