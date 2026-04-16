// middleware/environmentAuth.js
const LoginHistory = require('../models/LoginHistory');
const OTPService = require('../services/otpService'); // From previous language impl
const { parseUserAgent } = require('../utils/userAgentParser');

const isMobileTimeWindow = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const hour = istTime.getHours();
  return hour >= 10 && hour < 13; // 10 AM - 1 PM IST
};

const environmentAuth = async (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress;
  const parsedUA = parseUserAgent(userAgent);

  // Log login attempt
  const loginRecord = new LoginHistory({
    user: req.user.id,
    ipAddress: ip,
    userAgent,
    ...parsedUA,
    loginStatus: 'failed' // Will update on success
  });
  await loginRecord.save();

  // Mobile time restriction
  if (parsedUA.device.isMobile && !isMobileTimeWindow()) {
    loginRecord.loginStatus = 'failed';
    await loginRecord.save();
    return res.status(403).json({
      error: 'Mobile access only allowed 10:00 AM - 1:00 PM IST'
    });
  }

  // Chrome requires OTP
  if (parsedUA.browser.type === 'chrome') {
    req.requiresOtp = true;
    req.pendingLoginRecord = loginRecord._id;
    
    // Generate and send OTP
    const otp = OTPService.generateOTP();
    req.user.tempOtp = otp; // Store temporarily (use Redis in production)
    
    await OTPService.sendEmailOTP(req.user.email, otp);
    
    return res.json({
      otpRequired: true,
      message: 'Chrome detected. Email OTP sent for verification.'
    });
  }

  // Microsoft browsers (Edge) - direct access
  if (parsedUA.browser.type === 'edge') {
    loginRecord.otpVerified = true;
    loginRecord.loginStatus = 'success';
    await loginRecord.save();
    return next();
  }

  // Other browsers - direct access
  loginRecord.otpVerified = true;
  loginRecord.loginStatus = 'success';
  await loginRecord.save();
  return next();
};

module.exports = { environmentAuth };