const mongoose = require('mongoose');
const { verifyLoginOtp } = require('./controllers/authController');
const { User, Otp, LoginHistory } = require('./models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'internconnect_super_secret_dev_key_12345';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find any user
  const user = await User.findOne();
  if (!user) {
    console.log('No users found.'); process.exit(0);
  }

  console.log('Testing with user:', user._id);
  
  // Create OTP manually
  const testOtp = await Otp.create({
    userId: user._id,
    code: '123456',
    purpose: 'login_chrome',
    expiresAt: new Date(Date.now() + 10 * 60000)
  });

  // Make a tempToken
  const tempLoginToken = jwt.sign(
    { userId: user._id, purpose: 'login_otp_verify' },
    JWT_SECRET,
    { expiresIn: '5m' }
  );

  const req = {
    body: {
      tempLoginToken,
      code: '123456'
    }
  };

  const res = {
    status: (code) => {
      console.log('res.status called with:', code);
      return res;
    },
    json: (data) => {
      console.log('res.json called with:', data);
      return res;
    },
    cookie: (name, value) => {
      console.log('res.cookie set:', name);
    }
  };

  try {
    await verifyLoginOtp(req, res);
  } catch (err) {
    console.error('CRASH IN VERIFY LOGIN OTP:', err);
  }

  process.exit(0);
}

test().catch(console.error);
