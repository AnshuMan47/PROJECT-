// controllers/forgotPasswordController.js
const User = require('../models/User');
const { generateLetterPassword } = require('../utils/passwordGenerator');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const requestForgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = req.user;
    
    // Generate secure letter-only password
    const tempPassword = generateLetterPassword(12);
    
    // Set temp password (expires in 1 hour)
    user.tempPassword = tempPassword;
    user.tempPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.forgotPasswordRequests += 1;
    await user.save();
    
    // Send via email if provided
    if (email) {
      await transporter.sendMail({
        to: email,
        subject: 'Password Reset - Your New Temporary Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your New Temporary Password</h2>
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; text-align: center;">
              <h1 style="color: #667eea; font-size: 2rem; letter-spacing: 2px;">
                ${tempPassword}
              </h1>
              <p><strong>Letters only - No numbers or symbols!</strong></p>
            </div>
            <p style="margin-top: 2rem;">
              Use this password to log in, then change it immediately in your account settings.
            </p>
            <p>This password expires in <strong>1 hour</strong>.</p>
          </div>
        `
      });
    }
    
    // Send via SMS if phone provided
    if (phone) {
      await twilioClient.messages.create({
        body: `Your temp password: ${tempPassword} (Letters only). Login & change immediately. Expires in 1hr.`,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
    }
    
    res.json({
      success: true,
      message: 'Temporary password sent successfully!',
      method: email ? 'email' : 'sms'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset instructions' });
  }
};

// Complete password reset (login with temp password)
const completeReset = async (req, res) => {
  try {
    const { identifier, password } = req.body; // email or phone
    
    const user = await User.findOne({
      $or: [{ email: identifier?.toLowerCase() }, { phone: identifier }]
    });
    
    if (!user || user.tempPassword !== password || 
        !user.tempPasswordExpires || user.tempPasswordExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired temporary password' });
    }
    
    // Clear temp password fields
    user.tempPassword = undefined;
    user.tempPasswordExpires = undefined;
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      message: 'Password reset successful! Please change your password in settings.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Reset failed' });
  }
};

module.exports = { requestForgotPassword, completeReset };