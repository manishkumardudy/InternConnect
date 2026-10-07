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

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  organization: { type: String, default: '' },
  duration: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const StudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  college: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  skills: {
    type: [String],
    index: true,
    default: []
  },
  location: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  interestedFields: {
    type: [String],
    enum: CATEGORIES,
    default: []
  },
  lookingFor: {
    type: String,
    enum: ['internship', 'job', 'both', ''],
    default: ''
  },
  experience: {
    type: [ExperienceSchema],
    default: []
  },
  achievements: {
    type: [String],
    default: []
  },
  hobbies: {
    type: [String],
    default: []
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  savedListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
