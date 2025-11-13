// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function authMiddleware(req, res, next) {
  try {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header) return res.status(401).json({ error: 'Authorization header missing' });

    // Accept formats: "Bearer <token>" OR raw token (defensive)
    let token;
    if (header.startsWith('Bearer ')) token = header.split(' ')[1];
    else token = header;

    if (!token) return res.status(401).json({ error: 'Invalid authorization format' });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // payload should contain user_id, email, role
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error in auth middleware' });
  }
}

module.exports = authMiddleware;
