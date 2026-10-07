const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { role } = req.user;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(role)) {
      return res.status(403).json({ message: `Access denied. Requires role: ${rolesArray.join(' or ')}` });
    }

    next();
  };
};

module.exports = roleMiddleware;
