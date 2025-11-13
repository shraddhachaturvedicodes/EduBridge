// server/middleware/roleGuard.js
// Exports a factory `requireRole` that checks req.user.role
// Usage: const { requireRole } = require('../middleware/roleGuard');
//        router.post(..., requireRole(['faculty','admin']), handler)

function requireRole(allowed) {
  // allow either a string role or an array of roles
  const allowedArr = Array.isArray(allowed) ? allowed : [allowed];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (allowedArr.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { requireRole };
