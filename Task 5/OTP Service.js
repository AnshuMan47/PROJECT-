// services/otpService.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio'); // npm install twilio

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

class OTPService {
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static async sendEmailOTP(email, otp) {
    await transporter.sendMail({
      to: email,
      subject: 'Language Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
          <h2>🔒 Language Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #1e40af; color: white; font-size: 2.5rem; font-weight: bold; 
                      text-align: center; padding: 1.5rem; border-radius: 12px; 
                      letter-spacing: 0.3rem; font-family: monospace;">
            ${otp}
          </div>
          <p style="margin-top: 1.5rem; color: #666;">
            This code expires in 10 minutes. Enter it to change your language preference.
          </p>
        </div>
      `
    });
  }

  static async sendPhoneOTP(phone, otp) {
    await twilioClient.messages.create({
      body: `Your language verification code: ${otp} (expires in 10 min)`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
  }
}

module.exports = OTPService;