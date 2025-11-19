// server/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/feedback
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const sender = req.user && (req.user.user_id || req.user.id);
    const { receiver_user_id, score, comment } = req.body || {};
    if (!sender) return res.status(401).json({ error: 'Unauthorized' });
    if (!receiver_user_id || score === undefined || score === null) return res.status(400).json({ error: 'receiver_user_id and score required' });

    const q = `INSERT INTO feedback (sender_user_id, receiver_user_id, score, comment, created_on)
               VALUES ($1,$2,$3,$4,NOW()) RETURNING *`;
    const r = await pool.query(q, [sender, receiver_user_id, score, comment || null]);
    return res.json({ created: r.rows[0] });
  } catch (err) {
    console.error('Feedback create error', err && (err.stack || err));
    return next(err);
  }
});

// GET /api/feedback?teacher_id=... or faculty_id=... or receiver_user_id=...
router.get('/', async (req, res, next) => {
  try {
    const teacherId = req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id;
    if (!teacherId) return res.status(400).json({ error: 'teacher_id (or faculty_id) required' });

    const q = `SELECT f.id, f.sender_user_id, f.receiver_user_id, f.score, f.comment, f.created_on,
                      u.display_name as sender_name, u.email as sender_email
               FROM feedback f
               LEFT JOIN users u ON u.user_id = f.sender_user_id
               WHERE f.receiver_user_id = $1
               ORDER BY f.created_on DESC
               LIMIT 500`;
    const r = await pool.query(q, [teacherId]);
    return res.json({ feedback: r.rows || [] });
  } catch (err) {
    console.error('Feedback list error', err && (err.stack || err));
    return next(err);
  }
});

// GET /api/feedback/summary?teacher_id=...
router.get('/summary', async (req, res, next) => {
  try {
    const teacherId = req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id;
    if (!teacherId) return res.status(400).json({ error: 'teacher_id required' });

    const q = `SELECT COALESCE(AVG(score)::numeric, 0) as avg_rating, COUNT(*)::int as count
               FROM feedback
               WHERE receiver_user_id = $1`;
    const r = await pool.query(q, [teacherId]);
    const row = r.rows[0] || { avg_rating: 0, count: 0 };
    return res.json({ avg: Number(row.avg_rating) || 0, count: Number(row.count) || 0 });
  } catch (err) {
    console.error('Feedback summary error', err && (err.stack || err));
    return next(err);
  }
});

module.exports = router;
