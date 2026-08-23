const { Notification, Application, Listing } = require('../models');

const getNotifications = async (req, res) => {
  try {
    const rawNotifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50); // Cap at 50 recent notifications
      
    const notifications = [];
    for (const notif of rawNotifications) {
      const plainNotif = notif.toObject ? notif.toObject() : notif;

      // Ensure listingId & applicantUserId are populated even for legacy records
      if (!plainNotif.listingId && plainNotif.relatedId) {
        const app = await Application.findById(plainNotif.relatedId);
        if (app) {
          plainNotif.listingId = app.listingId;
          plainNotif.applicantUserId = app.studentId;
        } else {
          const listing = await Listing.findById(plainNotif.relatedId);
          if (listing) {
            plainNotif.listingId = listing._id;
          }
        }
      }

      notifications.push(plainNotif);
    }

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error fetching notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (String(notif.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to modify this notification.' });
    }

    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json({ message: 'Notification marked as read.', notification: updated });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error updating notification.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
