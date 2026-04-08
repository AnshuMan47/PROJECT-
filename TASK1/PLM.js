// middleware/postingLimits.js
const User = require('../models/User');

const checkPostingLimit = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await User.findById(userId).populate('friends');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Reset daily counter if new day
    if (user.lastPostDate < today) {
      user.postsToday = 0;
      user.lastPostDate = today;
    }
    
    const friendCount = user.friends.length;
    let maxPosts;
    
    if (friendCount === 0) {
      return res.status(403).json({
        error: 'You need at least 1 friend to post on the public page'
      });
    } else if (friendCount === 1) {
      maxPosts = 1;
    } else if (friendCount === 2) {
      maxPosts = 2;
    } else if (friendCount > 10) {
      maxPosts = Infinity; // No limit
    } else {
      maxPosts = friendCount; // Scale between 3-10 friends
    }
    
    if (user.postsToday >= maxPosts) {
      return res.status(403).json({
        error: `Daily posting limit reached (${user.postsToday}/${maxPosts}). Make more friends to post more!`
      });
    }
    
    req.maxPosts = maxPosts;
    req.userPostsToday = user.postsToday;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkPostingLimit;