const { User, LoginHistory } = require('../models');
const jwt = require('jsonwebtoken');
const { generateRandomPassword } = require('../utils/passwordGenerator');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { sendOtpForUser, verifyOtpForUser } = require('./otpController');
const { getISTHour } = require('../utils/timeUtils');

const JWT_SECRET = process.env.JWT_SECRET || 'internconnect_super_secret_dev_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'internconnect_refresh_secret_key_67890';

// Helper to generate access and refresh tokens
const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// Set refresh token cookie helper
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Helper: build user response object (includes preferredLanguage)
const buildUserResponse = (user) => ({
  userId: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  preferredLanguage: user.preferredLanguage || 'en'
});

// Parse User-Agent to extract browser, OS, device type
function parseUserAgent(uaString) {
  try {
    const UAParser = require('ua-parser-js');
    const parser = new UAParser(uaString || '');
    const result = parser.getResult();

    const browser = result.browser.name || 'Unknown';
    const os = `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim();
    let deviceType = 'desktop';
    if (result.device.type === 'mobile' || result.device.type === 'tablet') {
      deviceType = 'mobile';
    }

    return { browser, os, deviceType };
  } catch (e) {
    return { browser: 'Unknown', os: 'Unknown', deviceType: 'desktop' };
  }
}

const register = async (req, res) => {
  try {
    const { email, password, role, name, firebaseUid } = req.body;

    if (!email || !role || !name) {
      return res.status(400).json({ message: 'Name, email, and role are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this email.' });
    }

    // Use firebaseUid or generate a mock/local one
    const uid = firebaseUid || 'mock-uid-' + Math.random().toString(36).substr(2, 9);

    // Create user
    const newUser = await User.create({
      email,
      name,
      role,
      firebaseUid: uid,
      password: password || 'defaultpassword'
    });

    const purpose = role === 'recruiter' ? 'register_recruiter' : 'register_student';

    // Generate and send OTP via email
    await sendOtpForUser(newUser._id, newUser.email, purpose);

    // Issue a short-lived temp token for OTP verification
    const tempRegistrationToken = jwt.sign(
      { userId: newUser._id, purpose: 'register_otp_verify' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(201).json({
      otpRequired: true,
      tempRegistrationToken,
      message: `Registration initiated. An OTP has been sent to ${newUser.email}. Please verify to activate your account.`,
      user: buildUserResponse(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

const login = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("HEADERS:", req.headers["content-type"]);

  try {
    const { email, password, firebaseIdToken } = req.body;
    let user = null;

    // Parse device info
    const uaString = req.headers['user-agent'] || '';
    const { browser, os, deviceType } = parseUserAgent(uaString);
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    if (firebaseIdToken) {
      const payload = jwt.decode(firebaseIdToken);
      const userEmail = payload?.email || email;
      const userName = payload?.name || 'Firebase User';
      const userUid = payload?.uid || 'fb-uid-' + Math.random().toString(36).substr(2, 9);

      user = await User.findOne({ email: userEmail });
      if (!user) {
        user = await User.create({
          email: userEmail,
          name: userName,
          role: req.body.role || 'student',
          firebaseUid: userUid
        });
      }
    } else {
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials. User not found.' });
      }

      if (user.password && user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
    }

    // === CONDITIONAL ACCESS RULES ===

    // Rule A: Mobile login — strictly allowed only between 10:00 AM and 11:00 AM (10:00 - 10:59:59)
    if (deviceType === 'mobile') {
      const hour = getISTHour();
      if (hour !== -1 && hour !== 10) {
        // Log blocked attempt
        await LoginHistory.create({
          userId: user._id,
          browser, os, deviceType, ipAddress,
          loginAt: new Date(),
          otpRequired: false, otpVerified: false,
          outcome: 'blocked_mobile_window'
        });
        return res.status(403).json({
          message: 'Mobile login is only allowed between 10:00 AM and 11:00 AM.',
          blocked: true,
          reason: 'mobile_time_window'
        });
      }
    }

    // Chrome OTP login logic
    if (browser.toLowerCase().includes('chrome') && deviceType !== 'mobile') {
      // Log OTP-pending attempt
      await LoginHistory.create({
        userId: user._id,
        browser, os, deviceType, ipAddress,
        loginAt: new Date(),
        otpRequired: true, otpVerified: false,
        outcome: 'otp_pending'
      });

      // Send OTP
      await sendOtpForUser(user._id, user.email, 'login_chrome');

      // Issue a short-lived temp token (5 min) — NOT an access token, just for the OTP verification step
      const tempLoginToken = jwt.sign(
        { userId: user._id, purpose: 'login_otp_verify' },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        otpRequired: true,
        tempLoginToken,
        message: 'OTP sent to your email. Please verify to complete login.',
        user: buildUserResponse(user)
      });
    }

    // Rule C: All other browsers/devices — normal login
    await LoginHistory.create({
      userId: user._id,
      browser, os, deviceType, ipAddress,
      loginAt: new Date(),
      otpRequired: false, otpVerified: false,
      outcome: 'success'
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Login successful.',
      accessToken,
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

// POST /api/auth/verify-login-otp
const verifyLoginOtp = async (req, res) => {
  try {
    const { Otp } = require('../models');
    const { tempLoginToken, code } = req.body;

    if (!tempLoginToken || !code) {
      return res.status(400).json({ message: 'Temp login token and OTP code are required.' });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempLoginToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Login session expired. Please log in again.' });
    }

    if (decoded.purpose !== 'login_otp_verify') {
      return res.status(400).json({ message: 'Invalid login verification token.' });
    }

    const userId = decoded.userId;

    // Verify OTP inline to avoid any issues with verifyOtpForUser
    const otpRecord = await Otp.findOne({ userId, purpose: 'login_chrome' }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await Otp.deleteMany({ userId, purpose: 'login_chrome' });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (String(otpRecord.code) !== String(code).trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP matched successfully, delete it
    await Otp.deleteMany({ userId, purpose: 'login_chrome' });

    // Update LoginHistory to otp_verified
    const latestHistory = await LoginHistory.findOne({ userId, outcome: 'otp_pending' }).sort({ createdAt: -1 });
    if (latestHistory) {
      await LoginHistory.findByIdAndUpdate(latestHistory._id, {
        otpVerified: true,
        outcome: 'otp_verified'
      });
    }

    // Issue real tokens
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'OTP verified. Login successful.',
      accessToken,
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ message: 'Failed to verify login OTP. Please try again.' });
  }
};

const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      accessToken,
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully.' });
};

const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ message: 'Email or phone number is required.' });
    }

    const trimmed = identifier.trim();
    const isEmail = trimmed.includes('@');

    let user = null;
    if (isEmail) {
      user = await User.findOne({ email: trimmed });
    } else {
      user = await User.findOne({ phone: trimmed });
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email/phone number.' });
    }

    // Rate Limit Check (24 hours = 86400000 ms)
    if (user.lastPasswordResetRequestAt) {
      const lastReset = new Date(user.lastPasswordResetRequestAt).getTime();
      const now = Date.now();
      if (now - lastReset < 24 * 60 * 60 * 1000) {
        return res.status(429).json({ message: 'You can use this option only once per day.' });
      }
    }

    // Generate new password
    const newPassword = generateRandomPassword(10);
    const now = new Date();

    // Update user via findByIdAndUpdate
    await User.findByIdAndUpdate(user._id, {
      password: newPassword,
      lastPasswordResetRequestAt: now
    });

    // Send reset email or dev fallback log
    await sendPasswordResetEmail(user.email, newPassword);

    res.json({ message: 'A new password has been generated and sent to your registered email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset.' });
  }
};

// PATCH /api/auth/update-language
const updateLanguage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { language } = req.body;

    if (!language || !['en', 'es', 'hi', 'pt', 'zh', 'fr'].includes(language)) {
      return res.status(400).json({ message: 'Invalid language code.' });
    }

    await User.findByIdAndUpdate(userId, { preferredLanguage: language });

    res.json({ message: 'Language preference updated.', preferredLanguage: language });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ message: 'Failed to update language preference.' });
  }
};

// POST /api/auth/verify-register-otp
const verifyRegisterOtp = async (req, res) => {
  try {
    const { Otp } = require('../models');
    const { tempRegistrationToken, code } = req.body;

    if (!tempRegistrationToken || !code) {
      return res.status(400).json({ message: 'Temp registration token and OTP code are required.' });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempRegistrationToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Registration session expired. Please sign up again.' });
    }

    if (decoded.purpose !== 'register_otp_verify') {
      return res.status(400).json({ message: 'Invalid registration verification token.' });
    }

    const userId = decoded.userId;

    // Check OTP record for this user
    const otpRecord = await Otp.findOne({
      userId,
      purpose: { $in: ['register_recruiter', 'register_student'] }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await Otp.deleteMany({ userId, purpose: otpRecord.purpose });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (String(otpRecord.code) !== String(code).trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP verified — delete it
    await Otp.deleteMany({ userId, purpose: otpRecord.purpose });

    // Issue real tokens
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Record login in LoginHistory
    const uaString = req.headers['user-agent'] || '';
    const { browser, os, deviceType } = parseUserAgent(uaString);
    const ipAddress = req.ip || req.connection?.remoteAddress || '';

    await LoginHistory.create({
      userId: user._id,
      browser,
      os,
      deviceType,
      ipAddress,
      loginAt: new Date(),
      otpRequired: true,
      otpVerified: true,
      outcome: 'otp_verified'
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Account verified and activated successfully.',
      accessToken,
      user: buildUserResponse(user)
    });
  } catch (error) {
    console.error('Verify registration OTP error:', error);
    res.status(500).json({ message: 'Failed to verify registration OTP. Please try again.' });
  }
};

// POST /api/auth/resend-register-otp
const resendRegisterOtp = async (req, res) => {
  try {
    const { tempRegistrationToken } = req.body;
    if (!tempRegistrationToken) {
      return res.status(400).json({ message: 'Temp registration token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempRegistrationToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Session expired. Please sign up again.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const purpose = user.role === 'recruiter' ? 'register_recruiter' : 'register_student';
    await sendOtpForUser(user._id, user.email, purpose);

    res.json({ message: `A new OTP has been sent to ${user.email}.` });
  } catch (error) {
    console.error('Resend registration OTP error:', error);
    res.status(500).json({ message: 'Failed to resend registration OTP.' });
  }
};

module.exports = {
  register,
  verifyRegisterOtp,
  resendRegisterOtp,
  login,
  verifyLoginOtp,
  refresh,
  logout,
  forgotPassword,
  updateLanguage
};
