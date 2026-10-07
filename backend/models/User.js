const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  lastPasswordResetRequestAt: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'recruiter'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
