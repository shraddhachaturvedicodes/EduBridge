// server/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // optional auth for posting
const { pool } = require('../db'); // expects server/db.js to export { pool }

/**
 * POST /api/feedback
 * Body: { student_id, faculty_id, text_content }
 * Auth is optional but recommended. We'll allow posting if required fields present.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { student_id, faculty_id, text_content } = req.body;
    if (!student_id || !faculty_id || !text_content) {
      return res.status(400).json({ error: 'Missing required fields: student_id, faculty_id, text_content' });
    }

    // if you have a python sentiment runner service, you could call it here.
    // For now, keep sentiment nullable to avoid external dependency failures.
    const sentiment = null;

    const q = `INSERT INTO feedback (student_id, faculty_id, text_content, sentiment) VALUES ($1,$2,$3,$4) RETURNING *`;
    const r = await pool.query(q, [student_id, faculty_id, text_content, sentiment]);
    return res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('Error creating feedback:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error creating feedback' });
  }
});

/**
 * GET /api/feedback
 * Returns recent feedback with student and faculty names (join).
 */
router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT f.feedback_id, s.name AS student_name, fa.name AS faculty_name, 
             f.text_content, f.sentiment, f.submitted_on
      FROM feedback f
      LEFT JOIN students s ON f.student_id = s.student_id
      LEFT JOIN faculty fa ON f.faculty_id = fa.faculty_id
      ORDER BY f.submitted_on DESC
      LIMIT 500
    `;
    const r = await pool.query(q);
    return res.json(r.rows);
  } catch (err) {
    console.error('Error reading feedback:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Database error while fetching feedback.' });
  }
});

module.exports = router;
