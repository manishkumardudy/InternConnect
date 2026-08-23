const mongoose = require('mongoose');

const CATEGORIES = [
  'Engineering & Technology',
  'Business & Management',
  'Design & Creative',
  'Marketing & Sales',
  'Data & Analytics',
  'Finance & Commerce',
  'Content & Writing',
  'Human Resources',
  'Operations',
  'Other'
];

const ListingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: true,
    default: 'Other',
    index: true
  },
  type: {
    type: String,
    enum: ['internship', 'job'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    required: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  stipendMin: {
    type: Number,
    default: 0
  },
  stipendMax: {
    type: Number,
    default: 0
  },
  durationMonths: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  deadline: {
    type: Date
  },
  applicationDeadline: {
    type: Date
  },
  skillsRequired: {
    type: [String],
    index: true,
    default: []
  },
  openings: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    required: true
  },
  responsibilities: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  applicantCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Listing = mongoose.model('Listing', ListingSchema);
Listing.CATEGORIES = CATEGORIES;

module.exports = Listing;
