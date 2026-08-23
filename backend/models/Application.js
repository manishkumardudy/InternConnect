const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeUrlSnapshot: {
    type: String,
    required: true
  },
  coverNote: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'hired'],
    default: 'applied'
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'appliedAt', updatedAt: 'updatedAt' }
});

// Compound unique index to prevent duplicate applications
ApplicationSchema.index({ listingId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
