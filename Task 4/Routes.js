// routes/points.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserPoints, transferPoints } = require('../controllers/pointsController');

router.get('/me', auth, getUserPoints);
router.post('/transfer', auth, transferPoints);

module.exports = router;

// routes/answers.js
router.post('/', auth, createAnswer);
router.delete('/:id', auth, removeAnswer);
router.post('/:id/upvote', auth, upvoteAnswer);