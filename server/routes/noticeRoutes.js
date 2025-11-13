// server/routes/noticeRoutes.js
const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/roleGuard');

// load auth middleware safely (support multiple export shapes)
let authMiddleware;
try {
  const am = require('../middleware/authMiddleware');
  // case: module.exports = function(req,res,next){}
  if (typeof am === 'function') authMiddleware = am;
  // case: module.exports = { authMiddleware: fn } or exports.authMiddleware = fn
  else if (am && typeof am.authMiddleware === 'function') authMiddleware = am.authMiddleware;
  else if (am && typeof am.default === 'function') authMiddleware = am.default;
  else {
    console.warn('noticeRoutes: authMiddleware not found as function in ../middleware/authMiddleware. Requests requiring auth will fail.');
    authMiddleware = null;
  }
} catch (e) {
  console.warn('noticeRoutes: failed to require ../middleware/authMiddleware:', e && e.message);
  authMiddleware = null;
}

// safe DB import
let pool;
try {
  const db = require('../db');
  pool = db && (db.pool || db);
} catch (err) {
  try {
    const cfg = require('../config');
    pool = (cfg && cfg.PG && cfg.PG.pool) || (cfg && cfg.pool) || cfg;
  } catch (e) {
    pool = null;
  }
}

const dbError = (res, err, ctx) => {
  console.error(`${ctx} error:`, err && err.stack ? err.stack : err);
  return res.status(500).json({ error: 'DB error' });
};

// helper to ensure auth middleware exists before using it
const requireAuthOrFail = (req, res) => {
  if (!authMiddleware) {
    res.status(500).json({ error: 'Auth middleware missing on server' });
    return false;
  }
  return true;
};

// POST /api/notices  (admin or management)
router.post('/', (req, res, next) => {
  // if we have a valid auth middleware function, call it; otherwise return error
  if (!authMiddleware) return res.status(500).json({ error: 'Auth middleware not available on server' });
  // call authMiddleware and continue in its callback to our async handler
  authMiddleware(req, res, async (err) => {
    if (err) return next(err);
    // inline role guard
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!['admin', 'management'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });

    const { title, content, target_role } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Missing title or content' });

    if (!pool || !pool.query) {
      console.error('Notice create failed: DB pool not available');
      return res.status(500).json({ error: 'DB error' });
    }

    try {
      const q = 'INSERT INTO notices (title, content, target_role) VALUES ($1,$2,$3) RETURNING *';
      const vals = [title, content, target_role || 'ALL'];
      const r = await pool.query(q, vals);
      return res.status(201).json(r.rows[0]);
    } catch (err2) {
      return dbError(res, err2, 'Error creating notice');
    }
  });
});

// GET /api/notices (public)
router.get('/', async (req, res) => {
  if (!pool || !pool.query) return res.status(500).json({ error: 'DB error' });
  try {
    const r = await pool.query('SELECT * FROM notices ORDER BY posted_on DESC');
    res.json(r.rows);
  } catch (err) {
    return dbError(res, err, 'Error reading notices');
  }
});

// DELETE /api/notices/:id (admin or management)
router.delete('/:id', (req, res, next) => {
  if (!authMiddleware) return res.status(500).json({ error: 'Auth middleware not available on server' });
  authMiddleware(req, res, async (err) => {
    if (err) return next(err);
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!['admin', 'management'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });

    const id = Number(req.params.id);
    if (!pool || !pool.query) return res.status(500).json({ error: 'DB error' });

    try {
      const r = await pool.query('DELETE FROM notices WHERE notice_id = $1 RETURNING *', [id]);
      if (!r.rows.length) return res.status(404).json({ error: 'Notice not found' });
      res.json({ message: 'Notice deleted' });
    } catch (err2) {
      return dbError(res, err2, 'Error deleting notice');
    }
  });
});

module.exports = router;
