const { Company } = require('../models');

const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.userId });
    if (!company) {
      return res.status(200).json({
        message: 'Company profile not created yet.',
        company: null
      });
    }
    res.json({ company });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Internal server error fetching company details.' });
  }
};

const updateMyCompany = async (req, res) => {
  try {
    const { companyName, logoUrl, website, industry, companySize, description, location } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required.' });
    }

    const updateFields = {
      companyName,
      website: website || '',
      industry: industry || '',
      companySize: companySize || '1-10',
      description: description || '',
      location: location || ''
    };

    if (logoUrl !== undefined) {
      updateFields.logoUrl = logoUrl || '';
    }

    const updatedCompany = await Company.findOneAndUpdate(
      { userId: req.user.userId },
      updateFields,
      { new: true, upsert: true }
    );

    res.json({
      message: 'Company profile updated successfully.',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Internal server error updating company details.' });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const company = await Company.findOneAndUpdate(
      { userId: req.user.userId },
      { logoUrl: fileUrl },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Company logo uploaded successfully.',
      logoUrl: fileUrl,
      company
    });
  } catch (error) {
    console.error('Error uploading company logo:', error);
    res.status(500).json({ message: error.message || 'Internal server error uploading logo.' });
  }
};

module.exports = {
  getMyCompany,
  updateMyCompany,
  uploadLogo
};
