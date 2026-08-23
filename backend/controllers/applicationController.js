const models = require('../models');
const { Application, Listing, StudentProfile, Company, Notification, User } = models;
const { sendNotification } = require('../config/socket');
const { getOrInitSubscription } = require('./subscriptionController');
const { PLANS } = require('../config/plans');

const applyToListing = async (req, res) => {
  try {
    const { listingId, coverNote } = req.body;
    const studentId = req.user.userId;

    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required.' });
    }

    // 1. Verify listing exists and is active
    const listing = await Listing.findById(listingId).populate('companyId');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }
    if (listing.status === 'closed') {
      return res.status(400).json({ message: 'This listing is closed and no longer accepting applications.' });
    }

    // 2. Check profile completeness guard (requires completed StudentProfile with a resumeUrl)
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile || !profile.resumeUrl) {
      return res.status(400).json({
        message: 'Your profile is incomplete. Please complete your profile and upload a PDF resume first.'
      });
    }

    // 3. Prevent duplicate applications
    const existingApp = await Application.findOne({ listingId, studentId });
    if (existingApp) {
      return res.status(409).json({ message: 'You have already applied to this listing.' });
    }

    // 3.5. Enforce Subscription Plan Limit
    const sub = await getOrInitSubscription(studentId);
    const planName = sub.planName || 'free';
    const planConfig = PLANS[planName] || PLANS.free;

    if (planName !== 'gold' && sub.applicationsUsedThisMonth >= planConfig.limit) {
      return res.status(403).json({
        message: `You've reached your ${planConfig.name} plan limit of ${planConfig.limit} ${planConfig.limit === 1 ? 'application' : 'applications'} this month. Upgrade your plan to apply for more.`
      });
    }

    // 4. Create Application
    const newApp = await Application.create({
      listingId,
      studentId,
      resumeUrlSnapshot: profile.resumeUrl,
      coverNote: coverNote || '',
      status: 'applied',
      statusUpdatedAt: new Date()
    });

    // 4.5. Increment subscription usage
    await models.Subscription.findByIdAndUpdate(sub._id, {
      applicationsUsedThisMonth: (sub.applicationsUsedThisMonth || 0) + 1
    });

    // 5. Increment applicant count
    await Listing.findByIdAndUpdate(listingId, {
      $set: { applicantCount: (listing.applicantCount || 0) + 1 }
    });

    // 6. Notify Recruiter (fetch recruiter userId from Company ref)
    const company = listing.companyId; // Populated above
    if (company && company.userId) {
      const recruiterUserId = company.userId;
      const studentUser = await User.findById(studentId);
      const studentName = studentUser ? studentUser.name : 'A student';
      
      const notificationMsg = `${studentName} applied for your posting: "${listing.title}"`;
      
      const notif = await Notification.create({
        userId: recruiterUserId,
        type: 'new_application',
        message: notificationMsg,
        relatedId: newApp._id,
        listingId: listingId,
        applicantUserId: studentId,
        read: false
      });

      // Send real-time Socket notification
      sendNotification(recruiterUserId, notif);
    }

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: newApp
    });
  } catch (error) {
    console.error('Error applying to listing:', error);
    res.status(500).json({ message: 'Internal server error processing application.' });
  }
};

const getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.userId;
    // Populate listing, and nested populate company details
    const applications = await Application.find({ studentId })
      .sort({ appliedAt: -1 })
      .populate({
        path: 'listingId',
        populate: { path: 'companyId' }
      });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({ message: 'Internal server error fetching applications.' });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.userId;

    const app = await Application.findById(id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (String(app.studentId) !== String(studentId)) {
      return res.status(403).json({ message: 'You are not authorized to withdraw this application.' });
    }

    if (app.status !== 'applied') {
      return res.status(400).json({ message: 'Cannot withdraw application once status has changed.' });
    }

    // Decrement listing applicantCount
    const listing = await Listing.findById(app.listingId);
    if (listing) {
      await Listing.findByIdAndUpdate(app.listingId, {
        $set: { applicantCount: Math.max(0, (listing.applicantCount || 1) - 1) }
      });
    }

    await Application.deleteOne({ _id: id });

    res.json({ message: 'Application withdrawn successfully.' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ message: 'Internal server error withdrawing application.' });
  }
};

const getListingApplications = async (req, res) => {
  try {
    const { id } = req.params; // Listing ID
    const recruiterId = req.user.userId;

    // Verify company and listing ownership
    const company = await Company.findOne({ userId: recruiterId });
    if (!company) {
      return res.status(403).json({ message: 'Company profile not found.' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (String(listing.companyId) !== String(company._id)) {
      return res.status(403).json({ message: 'You are not authorized to view applicants for this listing.' });
    }

    // Fetch applications
    const applications = await Application.find({ listingId: id })
      .sort({ appliedAt: -1 })
      .populate('studentId'); // User details (name, email)

    // For each application, fetch student profile manually and convert to plain JSON object
    const detailedApps = [];
    for (const app of applications) {
      const plainApp = app.toObject ? app.toObject() : app;
      const sId = plainApp.studentId?._id || plainApp.studentId;
      const studentProfile = sId ? await StudentProfile.findOne({ userId: sId }) : null;
      detailedApps.push({
        ...plainApp,
        studentProfile: studentProfile ? (studentProfile.toObject ? studentProfile.toObject() : studentProfile) : null
      });
    }

    res.json({ applications: detailedApps });
  } catch (error) {
    console.error('Error fetching listing applications:', error);
    res.status(500).json({ message: 'Internal server error fetching applications.' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // Application ID
    const { status } = req.body; // shortlisted, rejected, hired
    const recruiterId = req.user.userId;

    if (!['shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update.' });
    }

    // Fetch application and listing to verify ownership
    const app = await Application.findById(id).populate('listingId');
    if (!app) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const company = await Company.findOne({ userId: recruiterId });
    if (!company || String(app.listingId.companyId) !== String(company._id)) {
      return res.status(403).json({ message: 'You are not authorized to manage this application.' });
    }

    // Update status
    const updatedApp = await Application.findByIdAndUpdate(
      id,
      { status, statusUpdatedAt: new Date() },
      { new: true }
    );

    // Notify Student
    const studentUserId = app.studentId;
    const listingTitle = app.listingId.title;
    const companyName = company.companyName;

    let message = '';
    if (status === 'shortlisted') {
      message = `Congratulations! You have been shortlisted by ${companyName} for "${listingTitle}".`;
    } else if (status === 'hired') {
      message = `Hooray! You have been Hired by ${companyName} for "${listingTitle}"! Check your email/dashboard.`;
    } else if (status === 'rejected') {
      message = `Thank you for applying to "${listingTitle}" at ${companyName}. Unfortunately, the company decided to move forward with other candidates.`;
    }

    const notif = await Notification.create({
      userId: studentUserId,
      type: 'status_change',
      message,
      relatedId: updatedApp._id,
      read: false
    });

    // Send real-time Socket notification
    sendNotification(studentUserId, notif);

    res.json({
      message: `Applicant status updated to ${status}.`,
      application: updatedApp
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Internal server error updating status.' });
  }
};

module.exports = {
  applyToListing,
  getStudentApplications,
  withdrawApplication,
  getListingApplications,
  updateApplicationStatus
};
