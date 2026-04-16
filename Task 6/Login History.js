// models/LoginHistory.js
const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ipAddress: { type: String, required: true },
  userAgent: String,
  browser: {
    name: String,
    version: String,
    type: { type: String, enum: ['chrome', 'edge', 'firefox', 'safari', 'other'] }
  },
  os: {
    name: String,
    version: String,
    type: { type: String, enum: ['windows', 'macos', 'linux', 'android', 'ios', 'other'] }
  },
  device: { 
    type: { type: String, enum: ['desktop', 'laptop', 'tablet', 'mobile', 'unknown'] },
    isMobile: Boolean
  },
  location: {
    country: String,
    region: String,
    city: String
  },
  loginTime: { type: Date, default: Date.now },
  loginStatus: { type: String, enum: ['success', 'failed'], default: 'success' },
  otpVerified: { type: Boolean, default: false }
}, { timestamps: true });

loginHistorySchema.index({ user: 1, loginTime: -1 });
loginHistorySchema.index({ ipAddress: 1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);