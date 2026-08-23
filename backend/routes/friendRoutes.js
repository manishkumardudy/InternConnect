const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const friendController = require('../controllers/friendController');

router.use(authMiddleware);

router.post('/request', friendController.sendRequest);
router.put('/respond/:requestId', friendController.respondRequest);
router.delete('/:friendUserId', friendController.unfriend);
router.get('/', friendController.getFriends);
router.get('/requests', friendController.getRequests);
router.get('/users', friendController.getUsers);
router.get('/stats', friendController.getFriendStats);

module.exports = router;
