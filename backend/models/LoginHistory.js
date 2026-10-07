const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'laptop', 'mobile'],
    default: 'desktop'
  },
  ipAddress: {
    type: String,
    default: ''
  },
  loginAt: {
    type: Date,
    default: Date.now
  },
  otpRequired: {
    type: Boolean,
    default: false
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  outcome: {
    type: String,
    enum: ['success', 'blocked_mobile_window', 'otp_pending', 'otp_verified'],
    default: 'success'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);
