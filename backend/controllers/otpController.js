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

    if (!purpose || !['resume_payment', 'language_change_fr'].includes(purpose)) {
      return res.status(400).json({ message: 'Valid OTP purpose is required.' });
    }

    // Rate limit check: if an OTP was requested < 15s ago, reuse existing OTP code to avoid SMTP spam
    const recentOtp = await Otp.findOne({ userId, purpose });
    if (recentOtp) {
      const createdAt = new Date(recentOtp.createdAt).getTime();
      const now = Date.now();
      if (now - createdAt < 15 * 1000) {
        // Return active code immediately without delay
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

module.exports = { sendOtp, verifyOtp };
