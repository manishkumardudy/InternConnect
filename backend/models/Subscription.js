const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  planName: {
    type: String,
    enum: ['free', 'bronze', 'silver', 'gold'],
    default: 'free'
  },
  applicationsUsedThisMonth: {
    type: Number,
    default: 0
  },
  cycleStartDate: {
    type: Date,
    default: Date.now
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
