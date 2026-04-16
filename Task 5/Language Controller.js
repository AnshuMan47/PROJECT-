// controllers/languageController.js
const User = require('../models/User').model;
const OTPService = require('../services/otpService');

const requestLanguageOTP = async (req, res) => {
  try {
    const { language } = req.body;
    const user = await User.findById(req.user.id);

    if (!['en', 'es', 'hi', 'pt', 'zh', 'fr'].includes(language)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    if (!user.requiresLanguageVerification(language)) {
      // No verification needed
      user.preferredLanguage = language;
      await user.save();
      return res.json({ 
        success: true, 
        message: `Language changed to ${language.toUpperCase()}`,
        otpRequired: false 
      });
    }

    // Generate OTP
    const otp = OTPService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.languageOtp = { code: otp, expiresAt, target: language === 'fr' ? 'email' : 'phone' };
    await user.save();

    // Send OTP
    if (language === 'fr') {
      await OTPService.sendEmailOTP(user.email, otp);
    } else {
      await OTPService.sendPhoneOTP(user.phone, otp);
    }

    res.json({ 
      success: true, 
      message: 'Verification code sent!',
      otpRequired: true,
      method: language === 'fr' ? 'email' : 'phone'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyLanguageOTP = async (req, res) => {
  try {
    const { otp, language } = req.body;
    const user = await User.findById(req.user.id);

    const now = new Date();
    if (!user.languageOtp || 
        user.languageOtp.code !== otp || 
        now > user.languageOtp.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Apply language change
    user.preferredLanguage = language;
    user.languageOtp = null; // Clear OTP
    await user.save();

    res.json({ 
      success: true, 
      message: `Language successfully changed to ${language.toUpperCase()}! 🎉`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLanguageSettings = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    currentLanguage: user.preferredLanguage,
    supportedLanguages: ['en', 'es', 'hi', 'pt', 'zh', 'fr'],
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified
  });
};

module.exports = {
  requestLanguageOTP,
  verifyLanguageOTP,
  getLanguageSettings
};