const models = require('../models');
const { getAcceptedFriendCount } = require('./friendController');

// Create a Post
const createPost = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'Media file (image or video) is required.' });
    }

    // 1. Friend & Daily Limit Check
    const friendCount = await getAcceptedFriendCount(currentUserId);

    if (friendCount === 0) {
      return res.status(403).json({ message: 'You need at least 1 friend to post.' });
    }

    if (friendCount <= 10) {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const userPosts = await models.Post.find({ userId: currentUserId });
      const postsToday = userPosts.filter(p => new Date(p.createdAt) >= todayMidnight).length;

      if (postsToday >= friendCount) {
        return res.status(403).json({
          message: `Daily post limit reached (${postsToday}/${friendCount}). Add more friends to post more!`
        });
      }
    }

    // 2. Media processing
    const isVideo = req.file.mimetype.startsWith('video/') ||
      /\.(mp4|webm|mov|avi|mkv)$/i.test(req.file.originalname);
    const mediaType = isVideo ? 'video' : 'image';
    const mediaUrl = `/uploads/${req.file.filename}`;

    // 3. Create post
    const post = await models.Post.create({
      userId: currentUserId,
      mediaUrl,
      mediaType,
      caption: req.body.caption || '',
      likes: [],
      comments: [],
      shareCount: 0
    });

    res.status(201).json({
      message: 'Post published successfully.',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post.' });
  }
};

// Get Public Feed
const getPosts = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const rawPosts = await models.Post.find({});

    // Sort newest first
    rawPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const usersList = await models.User.find({});
    const usersMap = new Map(usersList.map(u => [String(u._id), u]));

    const posts = rawPosts.map(p => {
      const author = usersMap.get(String(p.userId._id || p.userId));
      const likesArray = (p.likes || []).map(id => String(id._id || id));
      const isLiked = likesArray.includes(currentUserId);

      const formattedComments = (p.comments || []).map(c => {
        const commenter = usersMap.get(String(c.userId._id || c.userId));
        return {
          _id: c._id,
          text: c.text,
          pinned: !!c.pinned,
          createdAt: c.createdAt,
          user: {
            _id: c.userId,
            name: commenter ? commenter.name : 'User',
            role: commenter ? commenter.role : 'student'
          }
        };
      });

      // Sort pinned comments first, then chronological
      formattedComments.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      return {
        _id: p._id,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        caption: p.caption,
        shareCount: p.shareCount || 0,
        createdAt: p.createdAt,
        author: {
          _id: p.userId,
          name: author ? author.name : 'Unknown User',
          email: author ? author.email : '',
          role: author ? author.role : 'student'
        },
        likesCount: likesArray.length,
        isLiked,
        comments: formattedComments
      };
    });

    // Also include friend limit info in response for convenience
    const friendCount = await getAcceptedFriendCount(currentUserId);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const userPosts = rawPosts.filter(p => String(p.userId._id || p.userId) === currentUserId);
    const postsToday = userPosts.filter(p => new Date(p.createdAt) >= todayMidnight).length;

    res.json({
      posts,
      stats: {
        friendCount,
        postsToday,
        maxPostsAllowed: friendCount > 10 ? 'unlimited' : friendCount,
        canPost: friendCount > 0 && (friendCount > 10 || postsToday < friendCount)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch public feed.' });
  }
};

// Toggle Like/Unlike
const likePost = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { postId } = req.params;

    const post = await models.Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const likesList = (post.likes || []).map(id => String(id._id || id));
    const index = likesList.indexOf(currentUserId);

    let isLiked = false;
    if (index > -1) {
      likesList.splice(index, 1);
      isLiked = false;
    } else {
      likesList.push(currentUserId);
      isLiked = true;
    }

    await models.Post.findByIdAndUpdate(postId, { likes: likesList });

    res.json({
      message: isLiked ? 'Post liked.' : 'Post unliked.',
      isLiked,
      likesCount: likesList.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to toggle like.' });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await models.Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const newComment = {
      userId: currentUserId,
      text: text.trim(),
      pinned: false,
      createdAt: new Date()
    };

    const comments = post.comments || [];
    comments.push(newComment);

    await models.Post.findByIdAndUpdate(postId, { comments });

    // Fetch commenter name for immediate UI return
    const user = await models.User.findById(currentUserId);

    res.status(201).json({
      message: 'Comment added successfully.',
      comment: {
        _id: newComment._id || new Date().getTime(),
        text: newComment.text,
        pinned: false,
        createdAt: newComment.createdAt,
        user: {
          _id: currentUserId,
          name: user ? user.name : 'You',
          role: user ? user.role : 'student'
        }
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment.' });
  }
};

// Delete Comment (author of comment OR post owner)
const deleteComment = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { postId, commentId } = req.params;

    const post = await models.Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comments = post.comments || [];
    const comment = comments.find(c => String(c._id) === String(commentId));
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const commentAuthorId = String(comment.userId._id || comment.userId);
    const postOwnerId = String(post.userId._id || post.userId);

    if (currentUserId !== commentAuthorId && currentUserId !== postOwnerId) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment.' });
    }

    const updatedComments = comments.filter(c => String(c._id) !== String(commentId));
    await models.Post.findByIdAndUpdate(postId, { comments: updatedComments });

    res.json({
      message: 'Comment deleted successfully.',
      commentId
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment.' });
  }
};

// Toggle Pin/Unpin Comment (post owner ONLY)
const pinComment = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { postId, commentId } = req.params;

    const post = await models.Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const postOwnerId = String(post.userId._id || post.userId);
    if (currentUserId !== postOwnerId) {
      return res.status(403).json({ message: 'Only the post owner can pin comments.' });
    }

    const comments = post.comments || [];
    const comment = comments.find(c => String(c._id) === String(commentId));
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    comment.pinned = !comment.pinned;
    await models.Post.findByIdAndUpdate(postId, { comments });

    res.json({
      message: comment.pinned ? 'Comment pinned successfully.' : 'Comment unpinned successfully.',
      commentId,
      pinned: comment.pinned
    });
  } catch (error) {
    console.error('Pin comment error:', error);
    res.status(500).json({ message: 'Failed to toggle comment pin.' });
  }
};

// Share Post
const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await models.Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const newShareCount = (post.shareCount || 0) + 1;
    await models.Post.findByIdAndUpdate(postId, { shareCount: newShareCount });

    const shareUrl = `${req.protocol}://${req.get('host')}/public-space#post-${postId}`;

    res.json({
      message: 'Post link generated.',
      shareUrl,
      shareCount: newShareCount
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Failed to share post.' });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  addComment,
  deleteComment,
  pinComment,
  sharePost
};
