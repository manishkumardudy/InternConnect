const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const resumeBuilderController = require('../controllers/resumeBuilderController');

router.use(authMiddleware);
router.use(roleMiddleware('student'));

router.post('/create-order', resumeBuilderController.createResumeOrder);
router.post('/verify-payment', resumeBuilderController.verifyResumePayment);
router.get('/my-resumes', resumeBuilderController.getMyResumes);

module.exports = router;
