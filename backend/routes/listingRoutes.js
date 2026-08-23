const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.get('/', listingController.getListings);
router.get('/suggestions', listingController.getSuggestions);
router.get('/:id', listingController.getListingById);

// Recruiter routes
router.post('/', authMiddleware, roleMiddleware('recruiter'), listingController.createListing);
router.put('/:id', authMiddleware, roleMiddleware('recruiter'), listingController.updateListing);
router.delete('/:id', authMiddleware, roleMiddleware('recruiter'), listingController.deleteListing);
router.patch('/:id/close', authMiddleware, roleMiddleware('recruiter'), listingController.closeListing);

// Owned listings routing
router.get('/recruiter/me', authMiddleware, roleMiddleware('recruiter'), listingController.getRecruiterListings);
router.get('/recruiters/me/listings', authMiddleware, roleMiddleware('recruiter'), listingController.getRecruiterListings);

module.exports = router;
