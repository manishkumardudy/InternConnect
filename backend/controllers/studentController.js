const { StudentProfile, User } = require('../models');

const getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      // Return a blank structure to indicate it needs creation
      return res.status(200).json({ 
        message: 'Profile not completed yet.',
        profile: null 
      });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Internal server error fetching profile.' });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      college,
      degree,
      graduationYear,
      skills,
      location,
      bio,
      interestedFields,
      lookingFor,
      experience,
      achievements,
      hobbies
    } = req.body;

    if (!college || !degree || !graduationYear || !location) {
      return res.status(400).json({ message: 'College, degree, graduation year, and location are required.' });
    }

    // Convert skills to array if it is a comma-separated string
    let skillsArray = skills;
    if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Convert interestedFields to array
    let fieldsArray = interestedFields;
    if (typeof interestedFields === 'string') {
      fieldsArray = interestedFields.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Convert achievements to array
    let achievementsArray = achievements;
    if (typeof achievements === 'string') {
      achievementsArray = achievements.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(achievements)) {
      achievementsArray = achievements.map(a => typeof a === 'string' ? a.trim() : a).filter(Boolean);
    }

    // Convert hobbies to array
    let hobbiesArray = hobbies;
    if (typeof hobbies === 'string') {
      hobbiesArray = hobbies.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(hobbies)) {
      hobbiesArray = hobbies.map(h => typeof h === 'string' ? h.trim() : h).filter(Boolean);
    }

    // Sanitize experience array
    let experienceArray = [];
    if (Array.isArray(experience)) {
      experienceArray = experience.filter(exp => exp && (exp.title || exp.organization || exp.description));
    }

    const parsedYear = graduationYear ? parseInt(graduationYear, 10) : new Date().getFullYear();
    const yearValue = isNaN(parsedYear) ? new Date().getFullYear() : parsedYear;

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $set: {
          userId: req.user.userId,
          college,
          degree,
          graduationYear: yearValue,
          skills: skillsArray || [],
          location,
          bio: bio || '',
          interestedFields: fieldsArray || [],
          lookingFor: lookingFor || '',
          experience: experienceArray,
          achievements: achievementsArray || [],
          hobbies: hobbiesArray || []
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profile updated successfully.',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Internal server error updating profile.' });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Update profile
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { resumeUrl: fileUrl },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Resume uploaded successfully.',
      resumeUrl: fileUrl,
      profile
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: error.message || 'Internal server error uploading resume.' });
  }
};

const toggleSaveListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.userId;

    let profile = await StudentProfile.findOne({ userId });
    if (!profile) {
      // Create empty profile if not existing
      profile = await StudentProfile.create({
        userId,
        college: 'N/A',
        degree: 'N/A',
        graduationYear: new Date().getFullYear(),
        location: 'N/A',
        savedListings: []
      });
    }

    if (!Array.isArray(profile.savedListings)) {
      profile.savedListings = [];
    }

    const index = profile.savedListings.findIndex(id => String(id._id || id) === String(listingId));
    let saved = false;

    if (index === -1) {
      profile.savedListings.push(listingId);
      saved = true;
    } else {
      profile.savedListings.splice(index, 1);
    }

    await StudentProfile.findByIdAndUpdate(profile._id, { savedListings: profile.savedListings });

    res.json({
      message: saved ? 'Listing bookmarked.' : 'Listing removed from bookmarks.',
      saved,
      savedCount: profile.savedListings.length
    });
  } catch (error) {
    console.error('Error toggling saved listing:', error);
    res.status(500).json({ message: 'Internal server error saving listing.' });
  }
};

const getSavedListings = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.userId })
      .populate({
        path: 'savedListings',
        populate: {
          path: 'companyId',
          select: 'companyName companyLogo logoUrl location website'
        }
      });

    if (!profile) {
      return res.json({ savedListings: [] });
    }

    const validListings = (profile.savedListings || []).filter(Boolean);
    res.json({ savedListings: validListings });
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    res.status(500).json({ message: 'Internal server error fetching saved listings.' });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  toggleSaveListing,
  getSavedListings
};
