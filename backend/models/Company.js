const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    index: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  companySize: {
    type: String,
    default: '1-10'
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);
