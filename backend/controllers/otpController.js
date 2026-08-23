const { Otp, User } = require('../models');
const { sendOtpEmail } = require('../utils/mailer');

// Generate a 6-digit numeric OTP
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/otp/send
const sendOtp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { purpose } = req.body;

    if (!purpose || !['resume_payment', 'language_change_fr', 'login_chrome', 'register_recruiter', 'register_student'].includes(purpose)) {
      return res.status(400).json({ message: 'Valid OTP purpose is required.' });
    }

    // Rate limit check: if an OTP was requested < 15s ago, reuse existing OTP code to avoid SMTP spam
    const recentOtp = await Otp.findOne({ userId, purpose });
    if (recentOtp) {
      const createdAt = new Date(recentOtp.createdAt).getTime();
      const now = Date.now();
      if (now - createdAt < 15 * 1000) {
        // Return active code immediately without delay
        console.log(`[OTP REUSED] User ${userId} (${purpose}): ${recentOtp.code}`);
        return res.json({ message: 'OTP sent to your registered email.', expiresInMinutes: 10 });
      }
      // Delete old OTP before creating new one
      await Otp.deleteMany({ userId, purpose });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.create({ userId, code, purpose, expiresAt });

    console.log(`[OTP GENERATED] User: ${user.email} | Purpose: ${purpose} | Code: ${code}`);

    // Send email asynchronously so API response is instant (<20ms) and never hangs the UI
    sendOtpEmail(user.email, code, purpose).catch((mailErr) => {
      console.error('Asynchronous OTP email error:', mailErr.message);
    });

    res.json({ message: 'OTP sent to your registered email.', expiresInMinutes: 10 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

// POST /api/otp/verify
const verifyOtp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { code, purpose } = req.body;

    if (!code || !purpose) {
      return res.status(400).json({ message: 'OTP code and purpose are required.' });
    }

    const otp = await Otp.findOne({ userId, purpose });
    if (!otp) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    // Check expiry
    if (new Date(otp.expiresAt).getTime() < Date.now()) {
      await Otp.deleteMany({ userId, purpose });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Check code match
    if (String(otp.code) !== String(code).trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP valid — delete it
    await Otp.deleteMany({ userId, purpose });

    res.json({ message: 'OTP verified successfully.', verified: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP.' });
  }
};

// Utility for unauthenticated OTP send (used by login_chrome flow)
const sendOtpForUser = async (userId, email, purpose) => {
  // Delete any existing OTP for this user+purpose
  await Otp.deleteMany({ userId, purpose });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  console.log(`=== DEBUG SEND OTP ===`);
  console.log(`Sending OTP for userId: ${userId}, email: ${email}, purpose: ${purpose}`);
  console.log(`Generated OTP code: ${code}, expiresAt: ${expiresAt.toISOString()}`);
  console.log(`======================`);

  await Otp.create({ userId, code, purpose, expiresAt });
  
  // Send email asynchronously so API response is instant
  sendOtpEmail(email, code, purpose).catch(err => {
    console.error('Asynchronous OTP email error:', err.message);
  });

  return code;
};

// Utility for unauthenticated OTP verify (used by login_chrome flow)
const verifyOtpForUser = async (userId, code, purpose) => {
  // Fetch ALL non-deleted OTPs for this purpose, then match manually by string
  // (avoids any ObjectId/string casting mismatch issues)
  const allOtpsForPurpose = await Otp.find({ purpose });

  const targetUserIdStr = String(userId).trim();
  const targetCodeStr = String(code).trim();

  console.log('=== DEBUG OTP VERIFY (manual match) ===');
  console.log('Target userId:', targetUserIdStr);
  console.log('Target code:', targetCodeStr);
  console.log('All OTPs for purpose', purpose, ':', allOtpsForPurpose.map(o => ({
    userId: String(o.userId),
    code: String(o.code),
    expiresAt: o.expiresAt
  })));

  // Find a matching OTP by comparing userId as strings
  const matchingOtps = allOtpsForPurpose.filter(o => String(o.userId) === targetUserIdStr);

  if (matchingOtps.length === 0) {
    console.log('FAIL: No OTP found for this userId (string-matched).');
    console.log('========================================');
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }

  // Use the most recent one for this user
  matchingOtps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const otp = matchingOtps[0];

  console.log('Matched OTP record:', { userId: String(otp.userId), code: String(otp.code), expiresAt: otp.expiresAt });
  console.log('Code match:', String(otp.code) === targetCodeStr);
  console.log('========================================');

  if (new Date(otp.expiresAt).getTime() < Date.now()) {
    await Otp.deleteMany({ userId: otp.userId, purpose });
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (String(otp.code) !== targetCodeStr) {
    return { valid: false, message: 'Invalid OTP. Please check and try again.' };
  }

  await Otp.deleteMany({ userId: otp.userId, purpose });
  return { valid: true, message: 'OTP verified successfully.' };
};

module.exports = { sendOtp, verifyOtp, sendOtpForUser, verifyOtpForUser };
