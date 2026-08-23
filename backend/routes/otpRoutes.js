const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const otpController = require('../controllers/otpController');

router.post('/send', authMiddleware, otpController.sendOtp);
router.post('/verify', authMiddleware, otpController.verifyOtp);

module.exports = router;
