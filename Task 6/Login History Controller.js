// controllers/loginHistoryController.js
const LoginHistory = require('../models/LoginHistory');

const getLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({ user: req.user.id })
      .sort({ loginTime: -1 })
      .limit(50)
      .lean();

    res.json({
      history,
      totalLogins: history.length,
      recentDevices: [...new Set(history.slice(0, 10).map(h => h.device.type))],
      suspiciousLogins: history.filter(h => h.loginStatus === 'failed').length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyChromeOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    
    if (req.user.tempOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Update login record
    await LoginHistory.findByIdAndUpdate(req.pendingLoginRecord, {
      otpVerified: true,
      loginStatus: 'success'
    });

    // Clear temp OTP
    req.user.tempOtp = null;
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLoginHistory, verifyChromeOtp };