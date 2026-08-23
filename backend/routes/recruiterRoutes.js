const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadLogo } = require('../middleware/uploadMiddleware');

router.get('/me', authMiddleware, roleMiddleware('recruiter'), recruiterController.getMyCompany);
router.put('/me', authMiddleware, roleMiddleware('recruiter'), recruiterController.updateMyCompany);
router.post('/me/logo', authMiddleware, roleMiddleware('recruiter'), uploadLogo, recruiterController.uploadLogo);

module.exports = router;
