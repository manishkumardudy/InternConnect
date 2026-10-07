const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'internconnect_super_secret_dev_key_12345';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains userId, email, role, firebaseUid (optional)
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ message: 'Invalid or malformed authentication token.' });
  }
};

module.exports = authMiddleware;
