// config/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  bronze: {
    price: 100, // ₹100/month
    stripePriceId: process.env.STRIPE_BRONZE_PRICE_ID,
    limit: 5,
    name: 'Bronze Plan'
  },
  silver: {
    price: 300, // ₹300/month
    stripePriceId: process.env.STRIPE_SILVER_PRICE_ID,
    limit: 10,
    name: 'Silver Plan'
  },
  gold: {
    price: 1000, // ₹1000/month
    stripePriceId: process.env.STRIPE_GOLD_PRICE_ID,
    limit: Infinity,
    name: 'Gold Plan'
  }
};

module.exports = { stripe, PLANS };