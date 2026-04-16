// models/User.js (Updated with language support)
const mongoose = require('mongoose');

const SUPPORTED_LANGUAGES = ['en', 'es', 'hi', 'pt', 'zh', 'fr'];

const userSchema = new mongoose.Schema({
  // ... existing fields (points, subscription, etc.) ...
  preferredLanguage: { 
    type: String, 
    enum: SUPPORTED_LANGUAGES,
    default: 'en'
  },
  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  languageOtp: {
    code: String,
    expiresAt: Date,
    target: String // 'email' or 'phone'
  }
}, { timestamps: true });

userSchema.methods.requiresLanguageVerification = function(newLang) {
  if (this.preferredLanguage === newLang) return false;
  
  // French requires email verification
  if (newLang === 'fr') {
    return !this.emailVerified;
  }
  
  // Others require phone verification
  return !this.phoneVerified;
};

module.exports = {
  model: mongoose.model('User', userSchema),
  SUPPORTED_LANGUAGES
};