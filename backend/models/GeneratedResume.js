const mongoose = require('mongoose');

const GeneratedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  personalInfo: {
    phone: String,
    address: String,
    dob: String,
    linkedin: String,
    github: String,
    leetcode: String
  },
  careerObjective: {
    type: String,
    default: ''
  },
  education: [{
    degree: String,
    institution: String,
    yearRange: String,
    cgpa: String
  }],
  // Legacy backward compatibility
  qualifications: {
    type: [String],
    default: []
  },
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String,
    certificateLink: String
  }],
  skills: {
    languages: String,
    tools: String,
    frameworks: String,
    other: String
  },
  projects: [{
    title: String,
    techStack: String,
    link: String,
    description: String
  }],
  internships: [{
    organization: String,
    role: String,
    duration: String,
    description: String,
    certificateLink: String
  }],
  certifications: [{
    name: String,
    issuer: String
  }],
  achievements: {
    type: [String],
    default: []
  },
  photoUrl: {
    type: String,
    default: ''
  },
  generatedPdfUrl: {
    type: String,
    default: ''
  },
  paymentId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GeneratedResume', GeneratedResumeSchema);

