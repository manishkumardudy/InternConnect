// Central export for Mongoose models
// Usage: const { User, Listing } = require('../models');
module.exports = {
  User: require('./User'),
  StudentProfile: require('./StudentProfile'),
  Company: require('./Company'),
  Listing: require('./Listing'),
  Application: require('./Application'),
  Notification: require('./Notification'),
  Friend: require('./Friend'),
  Post: require('./Post'),
  Subscription: require('./Subscription'),
  Otp: require('./Otp'),
  GeneratedResume: require('./GeneratedResume'),
  LoginHistory: require('./LoginHistory'),
};
