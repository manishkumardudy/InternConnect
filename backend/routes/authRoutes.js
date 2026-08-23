const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-register-otp', authController.verifyRegisterOtp);
router.post('/resend-register-otp', authController.resendRegisterOtp);
router.post('/login', authController.login);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/update-language', authMiddleware, authController.updateLanguage);

module.exports = router;

