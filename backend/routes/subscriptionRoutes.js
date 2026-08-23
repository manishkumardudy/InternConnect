const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

router.use(authMiddleware);

router.get('/current', subscriptionController.getCurrentSubscription);
router.post('/create-order', subscriptionController.createRazorpayOrder);
router.post('/verify-payment', subscriptionController.verifyRazorpayPayment);

module.exports = router;
