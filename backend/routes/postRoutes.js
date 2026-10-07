const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { uploadPostMedia } = require('../middleware/uploadMiddleware');
const postController = require('../controllers/postController');

router.use(authMiddleware);

router.post('/', uploadPostMedia, postController.createPost);
router.get('/', postController.getPosts);
router.put('/:postId/like', postController.likePost);
router.post('/:postId/comment', postController.addComment);
router.delete('/:postId/comment/:commentId', postController.deleteComment);
router.put('/:postId/comment/:commentId/pin', postController.pinComment);
router.post('/:postId/share', postController.sharePost);

module.exports = router;
