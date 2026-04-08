// models/User.js (add these fields)
const userSchema = new mongoose.Schema({
  // ... existing fields
  phone: { type: String, sparse: true }, // Allow null for email-only users
  forgotPasswordRequests: { type: Number, default: 0 },
  lastForgotRequest: { type: Date },
  tempPassword: { type: String }, // Temporary password for reset
  tempPasswordExpires: { type: Date }
}, { timestamps: true });