// server/routes/noticeRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db'); // your db wrapper which exports pool
const authMiddleware = require('../middleware/authMiddleware'); // should set req.user
const { requireRole } = require('../middleware/roleGuard');

/**
 * GET /api/notices
 * Query params:
 *   - limit (optional)
 *   - offset (optional)
 * Returns list of notices, newest-first
 */
router.get('/', async (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);
  const offset = parseInt(req.query.offset || '0', 10) || 0;

  try {
    const q = `SELECT notice_id, title, content, target_role, posted_on
               FROM notices
               ORDER BY posted_on DESC
               LIMIT $1 OFFSET $2`;
    const r = await pool.query(q, [limit, offset]);
    res.json({ notices: r.rows || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notices
 * Body: { title, content, target_role }
 * Protected: only faculty, admin, management
 */
router.post('/', authMiddleware, requireRole(['faculty', 'admin', 'management']), async (req, res, next) => {
  try {
    const { title, content, target_role } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const roleVal = (target_role || 'ALL').toUpperCase();

    const q = `INSERT INTO notices (title, content, target_role, posted_on)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
               RETURNING notice_id, title, content, target_role, posted_on`;
    const vals = [title, content, roleVal];
    const r = await pool.query(q, vals);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/notices/:id
 * Protected: admin only
 */
router.delete('/:id', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const r = await pool.query('DELETE FROM notices WHERE notice_id = $1 RETURNING notice_id', [id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Notice not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
