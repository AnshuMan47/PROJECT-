// controllers/subscriptionController.js
const User = require('../models/User');
const { stripe, PLANS } = require('../config/stripe');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create Stripe checkout session
const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = await User.findById(userId);
    
    // Create or retrieve Stripe customer
    let customer;
    if (!user.subscription.stripeCustomerId) {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: userId }
      });
      user.subscription.stripeCustomerId = customer.id;
    } else {
      customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: PLANS[plan].stripePriceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription?cancelled=true`,
      metadata: { userId: userId, plan }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stripe webhook for successful payments
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    const user = await User.findById(userId);
    user.subscription.plan = plan;
    user.subscription.stripeSubscriptionId = session.subscription;
    user.subscription.currentPeriodStart = new Date();
    user.subscription.currentPeriodEnd = moment().tz('Asia/Kolkata').add(1, 'month').toDate();
    await user.save();

    // Send invoice email
    await sendSubscriptionEmail(user, plan, session);
  }

  res.json({ received: true });
};

const sendSubscriptionEmail = async (user, plan, session) => {
  const invoiceUrl = `${process.env.FRONTEND_URL}/subscription/invoice/${session.id}`;
  
  await transporter.sendMail({
    to: user.email,
    subject: `Welcome to ${PLANS[plan].name}! - Invoice & Plan Details`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 Welcome to ${PLANS[plan].name}!</h2>
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2rem; border-radius: 12px; text-align: center;">
          <h1>Thank You!</h1>
          <p>Your subscription is now active</p>
        </div>
        
        <div style="margin: 2rem 0;">
          <h3>📋 Plan Details</h3>
          <ul style="background: #f8fafc; padding: 1.5rem; border-radius: 8px;">
            <li><strong>Plan:</strong> ${PLANS[plan].name}</li>
            <li><strong>Questions per day:</strong> ${PLANS[plan].limit === Infinity ? 'Unlimited' : PLANS[plan].limit}</li>
            <li><strong>Amount:</strong> ₹${PLANS[plan].price}/month</li>
            <li><strong>Valid until:</strong> ${moment(user.subscription.currentPeriodEnd).tz('Asia/Kolkata').format('DD MMM YYYY, hh:mm A IST')}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 2rem 0;">
          <a href="${invoiceUrl}" style="background: #667eea; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold;">
            📄 View Invoice & Receipt
          </a>
        </div>
        
        <hr style="margin: 2rem 0;">
        <p>You can now post up to ${PLANS[plan].limit === Infinity ? 'unlimited' : PLANS[plan].limit} questions per day!</p>
      </div>
    `
  });
};

// Check question posting limit
const checkQuestionLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (await user.hasQuestionLimitReached()) {
      const limits = { free: 1, bronze: 5, silver: 10, gold: 'Unlimited' };
      return res.status(403).json({
        error: `Daily question limit reached (${limits[user.subscription.plan]} questions/day). Upgrade your plan!`
      });
    }
    
    req.userQuestionsToday = user.subscription.questionsToday;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createCheckoutSession,
  handleStripeWebhook,
  checkQuestionLimit
};