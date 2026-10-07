const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

router.get('/me', authMiddleware, roleMiddleware('student'), studentController.getMyProfile);
router.put('/me', authMiddleware, roleMiddleware('student'), studentController.updateMyProfile);
router.get('/me/applications', authMiddleware, roleMiddleware('student'), require('../controllers/applicationController').getStudentApplications);
router.get('/me/saved-listings', authMiddleware, roleMiddleware('student'), studentController.getSavedListings);
router.post('/me/resume', authMiddleware, roleMiddleware('student'), uploadResume, studentController.uploadResume);
router.post('/me/upload-resume', authMiddleware, roleMiddleware('student'), uploadResume, studentController.uploadResume);
router.post('/me/saved-listings/:listingId', authMiddleware, roleMiddleware('student'), studentController.toggleSaveListing);

module.exports = router;
