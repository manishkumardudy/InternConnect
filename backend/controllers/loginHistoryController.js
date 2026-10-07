const { LoginHistory } = require('../models');

const getMyLoginHistory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User identification missing from auth token.' });
    }
    const history = await LoginHistory.find({ userId })
      .sort({ loginAt: -1 })
      .limit(50);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ message: 'Failed to fetch login history.' });
  }
};

module.exports = { getMyLoginHistory };
