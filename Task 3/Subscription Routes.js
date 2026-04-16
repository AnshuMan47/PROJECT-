// routes/subscription.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { restrictPaymentTime } = require('../middleware/paymentTimeWindow');
const { 
  createCheckoutSession, 
  handleStripeWebhook, 
  checkQuestionLimit 
} = require('../controllers/subscriptionController');

router.post('/checkout', auth, restrictPaymentTime, createCheckoutSession);
router.post('/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

// Post question (with limits)
router.post('/questions', auth, checkQuestionLimit, async (req, res) => {
  // Increment question count
  const user = await User.findById(req.user.id);
  user.subscription.questionsToday += 1;
  await user.save();
  
  // Handle question posting logic here
  res.json({ success: true, message: 'Question posted successfully!' });
});

module.exports = router;