const jwt = require('jsonwebtoken');
const { Listing, Company, StudentProfile } = require('../models');
const { CITIES, SKILLS } = require('../config/indianData');

const JWT_SECRET = process.env.JWT_SECRET || 'internconnect_super_secret_dev_key_12345';

const getOptionalStudentUser = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.role === 'student') {
        return decoded;
      }
    }
  } catch (e) {
    // Ignore token errors in optional context
  }
  return null;
};

const computeEligibility = (listing, studentProfile) => {
  if (!studentProfile || !Array.isArray(studentProfile.skills) || studentProfile.skills.length === 0) {
    return { matchPercentage: null, matchLabel: null, matchNote: null };
  }

  const listingSkills = Array.isArray(listing.skillsRequired) ? listing.skillsRequired : [];
  if (listingSkills.length === 0) {
    return { matchPercentage: null, matchLabel: null, matchNote: null };
  }

  const studentSkillsLower = studentProfile.skills.map(s => (s || '').toLowerCase().trim()).filter(Boolean);
  let matchingCount = 0;
  listingSkills.forEach(reqSkill => {
    if (studentSkillsLower.includes((reqSkill || '').toLowerCase().trim())) {
      matchingCount++;
    }
  });

  let percentage = (matchingCount / listingSkills.length) * 100;

  // Bonus for interested category
  if (
    Array.isArray(studentProfile.interestedFields) &&
    studentProfile.interestedFields.length > 0 &&
    listing.category &&
    studentProfile.interestedFields.includes(listing.category)
  ) {
    percentage += 15;
  }

  percentage = Math.min(100, Math.round(percentage));

  let matchLabel = 'Not Eligible';
  let matchNote = 'You may not be eligible for this role — consider adding more matching skills to your profile.';

  if (percentage >= 60) {
    matchLabel = 'High Eligibility';
    matchNote = 'Great match! Your profile and skills strongly align with this opportunity.';
  } else if (percentage >= 20) {
    matchLabel = 'Low Eligibility';
    matchNote = 'Moderate match. You meet some requirements, but acquiring additional skills will improve your chances.';
  }

  return { matchPercentage: percentage, matchLabel, matchNote };
};

const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getListings = async (req, res) => {
  try {
    const {
      q,
      type,
      category,
      workMode,
      location,
      city,
      stipendMin,
      minStipend,
      skills,
      page = 1,
      sort = 'newest'
    } = req.query;
    
    const limit = 12;
    const skip = (Math.max(1, parseInt(page) || 1) - 1) * limit;

    const andConditions = [{ status: 'active' }];

    // 1. Keyword Search (matches title, description, skillsRequired, location, category)
    if (q && typeof q === 'string' && q.trim()) {
      const trimmedQ = escapeRegex(q.trim());
      andConditions.push({
        $or: [
          { title: { $regex: trimmedQ, $options: 'i' } },
          { description: { $regex: trimmedQ, $options: 'i' } },
          { skillsRequired: { $regex: trimmedQ, $options: 'i' } },
          { location: { $regex: trimmedQ, $options: 'i' } },
          { category: { $regex: trimmedQ, $options: 'i' } }
        ]
      });
    }

    // 2. Listing Type (internship/job) - Case-Insensitive
    if (type && typeof type === 'string' && type.trim() && type.trim().toLowerCase() !== 'all') {
      andConditions.push({
        type: { $regex: new RegExp(`^${escapeRegex(type.trim())}$`, 'i') }
      });
    }

    // 3. Category Filter (Case-Insensitive Regex)
    if (category && typeof category === 'string' && category.trim() && category.trim().toLowerCase() !== 'all') {
      const catTrimmed = category.trim();
      if (catTrimmed.toLowerCase() === 'other') {
        andConditions.push({
          $or: [
            { category: { $regex: /^other$/i } },
            { category: { $exists: false } },
            { category: null },
            { category: '' }
          ]
        });
      } else {
        andConditions.push({
          category: { $regex: new RegExp(`^${escapeRegex(catTrimmed)}$`, 'i') }
        });
      }
    }

    // 4. Work Mode (remote/hybrid/onsite) - Case-Insensitive
    if (workMode && typeof workMode === 'string' && workMode.trim() && workMode.trim().toLowerCase() !== 'all') {
      andConditions.push({
        workMode: { $regex: new RegExp(`^${escapeRegex(workMode.trim())}$`, 'i') }
      });
    }

    // 5. Location / City Filter (Case-Insensitive Substring Match)
    const targetLoc = (city || location || '').trim();
    if (targetLoc && targetLoc.toLowerCase() !== 'all') {
      andConditions.push({
        location: { $regex: new RegExp(escapeRegex(targetLoc), 'i') }
      });
    }

    // 6. Numeric Stipend Comparison (Parses Number properly and checks stipendMax/stipendMin >= minVal)
    const rawStipend = (stipendMin !== undefined && stipendMin !== '') ? stipendMin : minStipend;
    if (rawStipend !== undefined && rawStipend !== null && rawStipend !== '') {
      const minVal = Number(rawStipend);
      if (!isNaN(minVal) && minVal > 0) {
        andConditions.push({
          $or: [
            { stipendMax: { $gte: minVal } },
            { stipendMin: { $gte: minVal } }
          ]
        });
      }
    }

    // 7. Flexible Skills Array Matching (OR logic with $in + case-insensitive regex)
    if (skills && typeof skills === 'string' && skills.trim()) {
      const skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsList.length > 0) {
        const skillRegexes = skillsList.map(s => new RegExp(`^${escapeRegex(s)}$`, 'i'));
        andConditions.push({
          skillsRequired: { $in: skillRegexes }
        });
      }
    }

    // Define Sorting
    let sortCriteria = { createdAt: -1 };
    if (sort === 'oldest') {
      sortCriteria = { createdAt: 1 };
    } else if (sort === 'stipend_high' || sort === 'stipend') {
      sortCriteria = { stipendMax: -1, createdAt: -1 };
    } else if (sort === 'stipend_low') {
      sortCriteria = { stipendMax: 1, createdAt: -1 };
    } else if (sort === 'trending') {
      sortCriteria = { applicantCount: -1, createdAt: -1 };
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const totalCount = await Listing.countDocuments(query);
    const rawListings = await Listing.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .populate('companyId');

    // Aggregate category counts across all active listings
    const categoryAgg = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryCounts = {};
    (Listing.CATEGORIES || []).forEach(cat => {
      categoryCounts[cat] = 0;
    });
    categoryAgg.forEach(item => {
      if (item._id && categoryCounts[item._id] !== undefined) {
        categoryCounts[item._id] = item.count;
      } else {
        // Uncategorized / legacy null entries counted under 'Other'
        categoryCounts['Other'] = (categoryCounts['Other'] || 0) + item.count;
      }
    });

    // Optional student eligibility calculation
    const studentUser = getOptionalStudentUser(req);
    let studentProfile = null;
    if (studentUser) {
      studentProfile = await StudentProfile.findOne({ userId: studentUser.userId });
    }

    const listings = rawListings.map(doc => {
      const l = doc.toObject ? doc.toObject() : { ...doc };
      if (studentUser) {
        const eligibility = computeEligibility(l, studentProfile);
        l.matchPercentage = eligibility.matchPercentage;
        l.matchLabel = eligibility.matchLabel;
        l.matchNote = eligibility.matchNote;
      }
      return l;
    });

    res.json({
      listings,
      categoryCounts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit) || 1,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Internal server error fetching listings.' });
  }
};

// Autocomplete suggestions controller
const getSuggestions = async (req, res) => {
  try {
    const { q = '', type = 'all' } = req.query;
    const query = q.trim().toLowerCase();

    if (!query) {
      return res.json({ suggestions: [] });
    }

    let matches = [];

    if (type === 'city' || type === 'all') {
      const cityMatches = CITIES.filter(c => c.toLowerCase().includes(query));
      matches.push(...cityMatches);
    }

    if (type === 'skill' || type === 'all') {
      const skillMatches = SKILLS.filter(s => s.toLowerCase().includes(query));
      matches.push(...skillMatches);
    }

    if (type === 'search' || type === 'all') {
      // Dynamic title matches from listings
      const titleMatches = [
        'Java Developer', 'Java Spring Boot', 'Java Backend', 'Java Full Stack',
        'ReactJS Developer', 'React Native Engineer', 'Frontend Engineer', 'Python Data Scientist',
        'Node.js Backend Developer', 'UI/UX Designer', 'Product Manager', 'DevOps Specialist'
      ].filter(t => t.toLowerCase().includes(query));

      matches.push(...titleMatches);
    }

    // Deduplicate and cap at 8 suggestions
    const uniqueSuggestions = [...new Set(matches)].slice(0, 8);
    res.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ suggestions: [] });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('companyId');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    const studentUser = getOptionalStudentUser(req);
    const listingObj = listing.toObject ? listing.toObject() : { ...listing };

    if (studentUser) {
      const studentProfile = await StudentProfile.findOne({ userId: studentUser.userId });
      const eligibility = computeEligibility(listing, studentProfile);
      listingObj.matchPercentage = eligibility.matchPercentage;
      listingObj.matchLabel = eligibility.matchLabel;
      listingObj.matchNote = eligibility.matchNote;
    }

    res.json({ listing: listingObj });
  } catch (error) {
    console.error('Error fetching listing details:', error);
    res.status(500).json({ message: 'Internal server error fetching listing details.' });
  }
};

const createListing = async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const company = await Company.findOne({ userId: recruiterId });
    if (!company) {
      return res.status(400).json({ message: 'Please create a company profile first before posting a listing.' });
    }

    const {
      title,
      category,
      type,
      workMode,
      location,
      stipendMin,
      stipendMax,
      durationMonths,
      startDate,
      deadline,
      applicationDeadline,
      skillsRequired,
      openings,
      description,
      responsibilities
    } = req.body;

    const effectiveDeadline = deadline || applicationDeadline;

    if (!title || !type || !workMode || !location || !durationMonths || !startDate || !effectiveDeadline || !description) {
      return res.status(400).json({ message: 'Required fields are missing.' });
    }

    const validCategory = (Listing.CATEGORIES && Listing.CATEGORIES.includes(category)) ? category : (category || 'Other');

    let skillsArray = skillsRequired;
    if (typeof skillsRequired === 'string') {
      skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
    }

    let responsibilitiesArray = responsibilities;
    if (typeof responsibilities === 'string') {
      responsibilitiesArray = responsibilities.split('\n').map(r => r.trim()).filter(Boolean);
    }

    const parsedDeadline = new Date(effectiveDeadline);

    const newListing = await Listing.create({
      companyId: company._id,
      title,
      category: validCategory,
      type,
      workMode,
      location,
      stipendMin: parseInt(stipendMin) || 0,
      stipendMax: parseInt(stipendMax) || 0,
      durationMonths: parseInt(durationMonths),
      startDate: new Date(startDate),
      deadline: parsedDeadline,
      applicationDeadline: parsedDeadline,
      skillsRequired: skillsArray || [],
      openings: parseInt(openings) || 1,
      description,
      responsibilities: responsibilitiesArray || [],
      status: 'active',
      applicantCount: 0
    });

    res.status(201).json({
      message: 'Listing posted successfully.',
      listing: newListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Internal server error posting listing.' });
  }
};

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.userId;

    const company = await Company.findOne({ userId: recruiterId });
    if (!company) {
      return res.status(403).json({ message: 'Access denied. Recruiter company not found.' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (String(listing.companyId) !== String(company._id)) {
      return res.status(403).json({ message: 'You are not authorized to update this listing.' });
    }

    const {
      title,
      category,
      type,
      workMode,
      location,
      stipendMin,
      stipendMax,
      durationMonths,
      startDate,
      deadline,
      applicationDeadline,
      skillsRequired,
      openings,
      description,
      responsibilities,
      status
    } = req.body;

    let skillsArray = skillsRequired;
    if (typeof skillsRequired === 'string') {
      skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
    }

    let responsibilitiesArray = responsibilities;
    if (typeof responsibilities === 'string') {
      responsibilitiesArray = responsibilities.split('\n').map(r => r.trim()).filter(Boolean);
    }

    const effectiveDeadline = deadline || applicationDeadline;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (workMode !== undefined) updateData.workMode = workMode;
    if (location !== undefined) updateData.location = location;
    if (stipendMin !== undefined) updateData.stipendMin = parseInt(stipendMin) || 0;
    if (stipendMax !== undefined) updateData.stipendMax = parseInt(stipendMax) || 0;
    if (durationMonths !== undefined && !isNaN(parseInt(durationMonths))) updateData.durationMonths = parseInt(durationMonths);
    if (startDate) updateData.startDate = new Date(startDate);
    if (effectiveDeadline) {
      const parsed = new Date(effectiveDeadline);
      updateData.deadline = parsed;
      updateData.applicationDeadline = parsed;
    }
    if (skillsRequired !== undefined) updateData.skillsRequired = skillsArray;
    if (openings !== undefined && !isNaN(parseInt(openings))) updateData.openings = parseInt(openings);
    if (description !== undefined) updateData.description = description;
    if (responsibilities !== undefined) updateData.responsibilities = responsibilitiesArray;
    if (status !== undefined) updateData.status = status;
    if (category) {
      updateData.category = (Listing.CATEGORIES && Listing.CATEGORIES.includes(category)) ? category : category;
    }

    const updated = await Listing.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Listing updated successfully.',
      listing: updated
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Internal server error updating listing.' });
  }
};

const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.userId;

    const company = await Company.findOne({ userId: recruiterId });
    if (!company) {
      return res.status(403).json({ message: 'Access denied. Recruiter company not found.' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (String(listing.companyId) !== String(company._id)) {
      return res.status(403).json({ message: 'You are not authorized to delete this listing.' });
    }

    await Listing.findByIdAndDelete(id);

    // Also clean up any associated Application records
    try {
      const { Application } = require('../models');
      if (Application) {
        await Application.deleteMany({ listingId: id });
      }
    } catch (cleanErr) {
      console.warn('Note: applications cleanup error:', cleanErr.message);
    }

    res.json({
      message: 'Listing deleted successfully.',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ message: 'Internal server error deleting listing.' });
  }
};

const closeListing = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.userId;

    const company = await Company.findOne({ userId: recruiterId });
    if (!company) {
      return res.status(403).json({ message: 'Access denied. Recruiter company not found.' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (String(listing.companyId) !== String(company._id)) {
      return res.status(403).json({ message: 'You are not authorized to close this listing.' });
    }

    const updated = await Listing.findByIdAndUpdate(id, { status: 'closed' }, { new: true });

    res.json({
      message: 'Listing closed successfully.',
      listing: updated
    });
  } catch (error) {
    console.error('Error closing listing:', error);
    res.status(500).json({ message: 'Internal server error closing listing.' });
  }
};

const getRecruiterListings = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const company = await Company.findOne({ userId: recruiterId });
    
    if (!company) {
      return res.json({ listings: [] });
    }

    const listings = await Listing.find({ companyId: company._id }).sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    console.error('Error fetching recruiter listings:', error);
    res.status(500).json({ message: 'Internal server error fetching listings.' });
  }
};

module.exports = {
  getListings,
  getSuggestions,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  closeListing,
  getRecruiterListings
};
