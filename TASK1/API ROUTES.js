// routes/publicFeed.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const checkPostingLimit = require('../middleware/postingLimits');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Create post (with limits)
router.post('/posts', auth, checkPostingLimit, upload.array('media', 4), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Increment post count
    user.postsToday += 1;
    await user.save();
    
    const post = new Post({
      author: req.user.id,
      content: req.body.content,
      media: req.files?.map(file => ({
        url: `/media/${file.filename}`,
        type: file.mimetype.startsWith('video') ? 'video' : 'image'
      })) || []
    });
    
    await post.save();
    await post.populate('author', 'username');
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get public feed
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .populate('likes', 'username')
      .populate('comments.author', 'username')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like post
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user.id;
    
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }
    
    await post.populate('likes', 'username');
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comment on post
router.post('/posts/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({
      author: req.user.id,
      content: req.body.content
    });
    await post.save();
    
    await post.populate('comments.author','username');
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;