const models = require('../models');
const { sendNotification } = require('../config/socket');

// Helper function to get accepted friend count
async function getAcceptedFriendCount(userId) {
  try {
    const allAccepted = await models.Friend.find({ status: 'accepted' });
    const userStr = String(userId);
    return allAccepted.filter(f => {
      const reqId = String(f.requesterId._id || f.requesterId);
      const recId = String(f.recipientId._id || f.recipientId);
      return reqId === userStr || recId === userStr;
    }).length;
  } catch (error) {
    console.error('Error calculating friend count:', error);
    return 0;
  }
}

// Send Friend Request
const sendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required.' });
    }

    if (String(currentUserId) === String(recipientId)) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself.' });
    }

    // Check if recipient user exists
    const recipientUser = await models.User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    // Check existing request/friendship in either direction
    const existing = await models.Friend.find({});
    const existingRelation = existing.find(f => {
      const reqId = String(f.requesterId._id || f.requesterId);
      const recId = String(f.recipientId._id || f.recipientId);
      const cStr = String(currentUserId);
      const rStr = String(recipientId);
      return (reqId === cStr && recId === rStr) || (reqId === rStr && recId === cStr);
    });

    if (existingRelation) {
      if (existingRelation.status === 'accepted') {
        return res.status(400).json({ message: 'You are already friends with this user.' });
      }
      if (existingRelation.status === 'pending') {
        return res.status(400).json({ message: 'A friend request is already pending between you two.' });
      }
    }

    const friendReq = await models.Friend.create({
      requesterId: currentUserId,
      recipientId,
      status: 'pending'
    });

    // Create Notification for the RECIPIENT
    try {
      const senderUser = await models.User.findById(currentUserId);
      const senderName = senderUser ? senderUser.name : 'Someone';

      const notif = await models.Notification.create({
        userId: recipientId,
        type: 'friend_request',
        message: `${senderName} sent you a friend request`,
        relatedId: friendReq._id,
        read: false
      });

      sendNotification(recipientId, notif);
    } catch (notifErr) {
      console.error('Error creating friend request notification:', notifErr);
    }

    res.status(201).json({
      message: 'Friend request sent successfully.',
      friendRequest: friendReq
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Failed to send friend request.' });
  }
};

// Accept or Reject Friend Request
const respondRequest = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be "accept" or "reject".' });
    }

    const friendReq = await models.Friend.findById(requestId);
    if (!friendReq) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }

    const recId = String(friendReq.recipientId._id || friendReq.recipientId);
    if (recId !== String(currentUserId)) {
      return res.status(403).json({ message: 'Not authorized to respond to this friend request.' });
    }

    if (action === 'accept') {
      await models.Friend.findByIdAndUpdate(requestId, { status: 'accepted' });

      // Create Notification for the ORIGINAL REQUESTER
      try {
        const accepterUser = await models.User.findById(currentUserId);
        const accepterName = accepterUser ? accepterUser.name : 'Someone';

        const notif = await models.Notification.create({
          userId: friendReq.requesterId,
          type: 'friend_accepted',
          message: `${accepterName} accepted your friend request`,
          relatedId: friendReq._id,
          read: false
        });

        sendNotification(friendReq.requesterId, notif);
      } catch (notifErr) {
        console.error('Error creating friend accepted notification:', notifErr);
      }

      return res.json({ message: 'Friend request accepted.' });
    } else {
      await models.Friend.deleteOne({ _id: requestId });
      return res.json({ message: 'Friend request rejected.' });
    }
  } catch (error) {
    console.error('Respond friend request error:', error);
    res.status(500).json({ message: 'Failed to respond to friend request.' });
  }
};

// Unfriend / Remove Relationship
const unfriend = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { friendUserId } = req.params;

    const allRelations = await models.Friend.find({});
    const target = allRelations.find(f => {
      const reqId = String(f.requesterId._id || f.requesterId);
      const recId = String(f.recipientId._id || f.recipientId);
      const fStr = String(friendUserId);
      return (reqId === currentUserId && recId === fStr) || (reqId === fStr && recId === currentUserId);
    });

    if (!target) {
      return res.status(404).json({ message: 'Friendship record not found.' });
    }

    await models.Friend.deleteOne({ _id: target._id });
    res.json({ message: 'Unfriended successfully.' });
  } catch (error) {
    console.error('Unfriend error:', error);
    res.status(500).json({ message: 'Failed to unfriend.' });
  }
};

// List My Friends
const getFriends = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const allAccepted = await models.Friend.find({ status: 'accepted' }).populate('requesterId').populate('recipientId');

    const friends = [];
    for (const f of allAccepted) {
      const reqId = String(f.requesterId._id || f.requesterId);
      const recId = String(f.recipientId._id || f.recipientId);

      if (reqId === currentUserId || recId === currentUserId) {
        const friendUserObj = reqId === currentUserId ? f.recipientId : f.requesterId;
        const targetId = reqId === currentUserId ? recId : reqId;

        // Ensure user obj is populated
        let userDetail = typeof friendUserObj === 'object' && friendUserObj.name ? friendUserObj : await models.User.findById(targetId);

        if (userDetail) {
          friends.push({
            friendshipId: f._id,
            user: {
              _id: userDetail._id,
              name: userDetail.name,
              email: userDetail.email,
              role: userDetail.role
            },
            createdAt: f.createdAt
          });
        }
      }
    }

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Failed to fetch friends.' });
  }
};

// List Incoming Pending Requests
const getRequests = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const allPending = await models.Friend.find({ status: 'pending' }).populate('requesterId');

    const requests = [];
    for (const f of allPending) {
      const recId = String(f.recipientId._id || f.recipientId);
      if (recId === currentUserId) {
        let reqUser = typeof f.requesterId === 'object' && f.requesterId.name ? f.requesterId : await models.User.findById(f.requesterId);
        if (reqUser) {
          requests.push({
            _id: f._id,
            requester: {
              _id: reqUser._id,
              name: reqUser.name,
              email: reqUser.email,
              role: reqUser.role
            },
            createdAt: f.createdAt
          });
        }
      }
    }

    res.json({ requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Failed to fetch friend requests.' });
  }
};

// List Users to Add (with search query & status indicator)
const getUsers = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { q } = req.query;

    const allUsers = await models.User.find({});
    const allRelations = await models.Friend.find({});

    let candidateUsers = allUsers.filter(u => String(u._id) !== currentUserId);

    if (q) {
      const queryLower = q.toLowerCase();
      candidateUsers = candidateUsers.filter(u =>
        (u.name && u.name.toLowerCase().includes(queryLower)) ||
        (u.email && u.email.toLowerCase().includes(queryLower))
      );
    }

    const result = candidateUsers.map(u => {
      const targetId = String(u._id);
      const rel = allRelations.find(f => {
        const reqId = String(f.requesterId._id || f.requesterId);
        const recId = String(f.recipientId._id || f.recipientId);
        return (reqId === currentUserId && recId === targetId) || (reqId === targetId && recId === currentUserId);
      });

      let status = 'none';
      let requestId = null;
      if (rel) {
        requestId = rel._id;
        const reqId = String(rel.requesterId._id || rel.requesterId);
        if (rel.status === 'accepted') {
          status = 'accepted';
        } else if (rel.status === 'pending') {
          status = reqId === currentUserId ? 'pending_sent' : 'pending_received';
        }
      }

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        friendStatus: status,
        requestId
      };
    });

    res.json({ users: result });
  } catch (error) {
    console.error('Get users list error:', error);
    res.status(500).json({ message: 'Failed to fetch user list.' });
  }
};

// Get friend statistics and daily posting limit info for current user
const getFriendStats = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const friendCount = await getAcceptedFriendCount(currentUserId);

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const allPosts = await models.Post.find({ userId: currentUserId });
    const postsToday = allPosts.filter(p => new Date(p.createdAt) >= todayMidnight).length;

    let maxPostsAllowed = friendCount;
    let isUnlimited = false;

    if (friendCount > 10) {
      isUnlimited = true;
      maxPostsAllowed = Infinity;
    }

    res.json({
      friendCount,
      postsToday,
      maxPostsAllowed: isUnlimited ? 'unlimited' : maxPostsAllowed,
      canPost: friendCount > 0 && (isUnlimited || postsToday < maxPostsAllowed),
      isUnlimited
    });
  } catch (error) {
    console.error('Get friend stats error:', error);
    res.status(500).json({ message: 'Failed to fetch friend stats.' });
  }
};

module.exports = {
  getAcceptedFriendCount,
  sendRequest,
  respondRequest,
  unfriend,
  getFriends,
  getRequests,
  getUsers,
  getFriendStats
};
