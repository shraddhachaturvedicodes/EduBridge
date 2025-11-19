// server/middleware/roleGuard.js
/**
 * requireRole - middleware factory to allow only users with specific roles
 * Usage:
 *   const { requireRole } = require('../middleware/roleGuard');
 *   router.post('/', authMiddleware, requireRole(['faculty','admin','management']), handler);
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    try {
      // If authMiddleware sets req.user, check it
      const user = req.user || (req.auth && req.auth.user) || null;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const role = (user.role || '').toLowerCase();
      const normalizedAllowed = allowedRoles.map(r => (r || '').toLowerCase());

      if (!normalizedAllowed.includes(role)) {
        return res.status(403).json({ error: 'Forbidden: insufficient privileges' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireRole };
