const models = require('../models');
const { PLANS, isWithinISTPaymentWindow } = require('../config/plans');
const { sendInvoiceEmail } = require('../utils/mailer');
const crypto = require('crypto');

// Helper function to load or initialize subscription, handling lazy 30-day resets
const getOrInitSubscription = async (userId) => {
  let sub = await models.Subscription.findOne({ userId });

  if (!sub) {
    sub = await models.Subscription.create({
      userId,
      planName: 'free',
      applicationsUsedThisMonth: 0,
      cycleStartDate: new Date(),
      status: 'active'
    });
  } else {
    // Check if 30 days have passed since cycleStartDate
    const cycleStart = new Date(sub.cycleStartDate).getTime();
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    if (now - cycleStart >= thirtyDaysMs) {
      await models.Subscription.findByIdAndUpdate(
        sub._id,
        {
          applicationsUsedThisMonth: 0,
          cycleStartDate: new Date()
        }
      );
      sub = await models.Subscription.findById(sub._id);
    }
  }

  return sub;
};

// GET /api/subscriptions/current
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sub = await getOrInitSubscription(userId);

    const planInfo = PLANS[sub.planName || 'free'] || PLANS.free;

    res.json({
      subscription: sub,
      planDetails: planInfo,
      plans: PLANS,
      isWindowActive: isWithinISTPaymentWindow()
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Failed to fetch subscription details.' });
  }
};

// POST /api/subscriptions/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    // 1. Time-window restriction (10:00 AM - 11:00 AM IST)
    if (!isWithinISTPaymentWindow()) {
      return res.status(403).json({
        message: 'Payments are only allowed between 10:00 AM and 11:00 AM IST. Please try again during this window.'
      });
    }

    const { planName } = req.body;
    if (!planName || !['bronze', 'silver', 'gold'].includes(planName)) {
      return res.status(400).json({ message: 'Invalid plan selected for upgrade.' });
    }

    const targetPlan = PLANS[planName];
    const amountInPaise = targetPlan.price * 100;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isMock = process.env.MOCK_PAYMENTS !== 'false' || !keyId || !keySecret || keyId === 'your_razorpay_key_id';

    let order;

    if (!isMock) {
      const Razorpay = require('razorpay');
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

      order = await rzp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `sub_${req.user.userId}_${Date.now()}`
      });
    } else {
      // Mock / Dev Fallback order when MOCK_PAYMENTS=true or keys are placeholders
      order = {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_mock_${Date.now()}`,
        status: 'created',
        mock: true
      };
    }

    res.json({
      order,
      keyId: isMock ? 'rzp_test_mock' : keyId,
      planName,
      price: targetPlan.price,
      mockMode: isMock
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Failed to create payment order.' });
  }
};

// POST /api/subscriptions/verify-payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    // Time-window restriction (10:00 AM - 11:00 AM IST)
    if (!isWithinISTPaymentWindow()) {
      return res.status(403).json({
        message: 'Payments are only allowed between 10:00 AM and 11:00 AM IST. Please try again during this window.'
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = req.body;
    const userId = req.user.userId;

    if (!razorpay_order_id || !planName || !['bronze', 'silver', 'gold'].includes(planName)) {
      return res.status(400).json({ message: 'Missing required payment verification details.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Standard HMAC SHA256 verification when real Razorpay signature & secret are used
    if (keySecret && keySecret !== 'your_razorpay_key_secret' && !razorpay_order_id.startsWith('order_mock_')) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment signature verification failed.' });
      }
    }

    // Load user subscription
    const sub = await getOrInitSubscription(userId);

    // Update Subscription Document
    const updatedSub = await models.Subscription.findByIdAndUpdate(
      sub._id,
      {
        planName,
        applicationsUsedThisMonth: 0,
        cycleStartDate: new Date(),
        status: 'active',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`
      }
    );

    const refreshedSub = await models.Subscription.findById(sub._id);

    // Dispatch Invoice Email
    const user = await models.User.findById(userId);
    if (user && user.email) {
      const targetPlan = PLANS[planName];
      const invoiceDetails = {
        planName: targetPlan.name,
        amountPaid: `₹${targetPlan.price}`,
        paymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
        orderId: razorpay_order_id,
        date: new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' })
      };
      await sendInvoiceEmail(user.email, invoiceDetails, user.name);
    }

    res.json({
      message: 'Subscription plan upgraded successfully!',
      subscription: refreshedSub
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed.' });
  }
};

module.exports = {
  getOrInitSubscription,
  getCurrentSubscription,
  createRazorpayOrder,
  verifyRazorpayPayment
};
