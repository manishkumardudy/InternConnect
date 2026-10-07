const db = require('../config/db');

// Export Mongoose models if MongoDB is active, else fall back to local JSON adapter
const mongoModels = {
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
  isMockDb: false
};

const localDbModels = require('../config/localDb');

// Proxy object to dynamically delegate to Mongoose models or local JSON adapter
module.exports = new Proxy(mongoModels, {
  get(target, prop) {
    if (db.isMock()) {
      return localDbModels[prop];
    }
    return target[prop];
  }
});
