const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student routes
router.post('/', authMiddleware, roleMiddleware('student'), applicationController.applyToListing);
router.get('/student/me', authMiddleware, roleMiddleware('student'), applicationController.getStudentApplications);
router.get('/students/me/applications', authMiddleware, roleMiddleware('student'), applicationController.getStudentApplications);
router.delete('/:id', authMiddleware, roleMiddleware('student'), applicationController.withdrawApplication);

// Recruiter routes
router.get('/listing/:id', authMiddleware, roleMiddleware('recruiter'), applicationController.getListingApplications);
router.get('/listings/:id/applications', authMiddleware, roleMiddleware('recruiter'), applicationController.getListingApplications);
router.patch('/:id/status', authMiddleware, roleMiddleware('recruiter'), applicationController.updateApplicationStatus);

module.exports = router;
