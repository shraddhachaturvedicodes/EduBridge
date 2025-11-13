// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../db'); // adjust if your db export is different
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header) return res.status(401).json({ error: 'Authorization header missing' });
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization format' });
    const token = parts[1];

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach minimal payload now, and fetch full user record from DB
    req.user = payload;

    // Optionally enrich with DB user details
    try {
      const r = await pool.query('SELECT user_id, email, role, display_name FROM users WHERE user_id = $1', [payload.user_id]);
      if (r.rows.length) {
        req.user = { ...req.user, ...r.rows[0] };
      }
    } catch (err) {
      // don't fail requests on DB read error here; attach payload at least
      console.error('Auth middleware DB read error:', err && err.stack ? err.stack : err);
    }

    next();
  } catch (err) {
    console.error('Auth middleware unexpected error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const userRole = req.user.role;
  if (Array.isArray(roles)) {
    if (!roles.includes(userRole)) return res.status(403).json({ error: 'Forbidden' });
  } else {
    if (userRole !== roles) return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
};

module.exports = { authMiddleware, requireRole };
