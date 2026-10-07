const { getISTHour } = require('../utils/timeUtils');

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limit: 1,
    description: '1 internship application per month'
  },
  bronze: {
    name: 'Bronze',
    price: 100,
    limit: 3,
    description: '3 internship applications per month'
  },
  silver: {
    name: 'Silver',
    price: 300,
    limit: 5,
    description: '5 internship applications per month'
  },
  gold: {
    name: 'Gold',
    price: 1000,
    limit: Infinity,
    description: 'Unlimited internship applications'
  }
};

function isWithinISTPaymentWindow() {
  const hour = getISTHour();
  if (hour === -1) return true; // DISABLE_TIME_WINDOW override
  return hour === 10;
}

module.exports = {
  PLANS,
  isWithinISTPaymentWindow
};
