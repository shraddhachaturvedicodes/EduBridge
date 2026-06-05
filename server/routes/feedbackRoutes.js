const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { spawn } = require('child_process');
const path = require('path');

// POST /api/feedback - Submit feedback with sentiment analysis
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const sender = req.user && (req.user.user_id || req.user.id);
    const { receiver_user_id, score, comment } = req.body || {};
    const receiverId = parseInt(receiver_user_id, 10);
    const scoreValue = parseInt(score, 10);

    if (!sender) {
      return res.status(401).json({ error: 'Unauthorized - Please login again' });
    }

    if (!receiverId || Number.isNaN(scoreValue) || scoreValue < 1 || scoreValue > 5) {
      return res.status(400).json({ error: 'Valid receiver_user_id and score required' });
    }

    // Sentiment Analysis
    let sentiment = 'Neutral';
    try {
      const pythonScriptPath = path.join(__dirname, '../../sentiment_module/analyze.py');
      const pythonBin = process.env.PYTHON_BIN || 'python3';
      const pythonProcess = spawn(pythonBin, [pythonScriptPath, comment || '']);

      let sentimentData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => { sentimentData += data.toString(); });
      pythonProcess.stderr.on('data', (data) => { errorData += data.toString(); });

      await new Promise((resolve) => {
        pythonProcess.on('close', (code) => {
          if (code === 0 && sentimentData) {
            try {
              const result = JSON.parse(sentimentData);
              sentiment = result.sentiment || 'Neutral';
            } catch (e) {}
          }
          resolve();
        });
        setTimeout(() => { pythonProcess.kill(); resolve(); }, 5000);
      });
    } catch (e) {
      sentiment = 'Neutral';
    }

    const result = await pool.query(
      `INSERT INTO feedback (sender_user_id, receiver_user_id, score, comment, sentiment, created_on)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [sender, receiverId, scoreValue, comment || null, sentiment]
    );

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      created: result.rows[0],
      sentiment
    });
  } catch (err) {
    console.error('Feedback submission error:', err);
    return res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
  }
});

// GET /api/feedback?teacher_id=...
// ✅ ANONYMOUS: sender identity is NOT returned to faculty
router.get('/', async (req, res, next) => {
  try {
    const teacherId = parseInt(req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id, 10);
    if (!teacherId) {
      return res.status(400).json({ error: 'teacher_id parameter is required' });
    }

    const result = await pool.query(
      `SELECT
         f.id,
         f.score,
         f.comment,
         f.sentiment,
         f.created_on,
         ru.display_name AS receiver_name
       FROM feedback f
       LEFT JOIN users ru ON ru.user_id = f.receiver_user_id
       WHERE f.receiver_user_id = $1
       ORDER BY f.created_on DESC
       LIMIT 500`,
      [teacherId]
    );

    // Return feedback WITHOUT any sender info — fully anonymous to faculty
    const feedbackList = result.rows.map((row) => ({
      id: row.id,
      score: row.score,
      comment: row.comment,
      sentiment: row.sentiment,
      created_on: row.created_on,
      receiver_name: row.receiver_name
      // ❌ NO sender_name, sender_email, sender_user_id
    }));

    return res.json({ feedback: feedbackList });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// GET /api/feedback/summary?teacher_id=...
router.get('/summary', async (req, res, next) => {
  try {
    const teacherId = parseInt(req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id, 10);
    if (!teacherId) {
      return res.status(400).json({ error: 'teacher_id parameter is required' });
    }

    const result = await pool.query(
      `SELECT
         COUNT(*)::int as count,
         COUNT(CASE WHEN sentiment = 'Positive' THEN 1 END)::int as positive_count,
         COUNT(CASE WHEN sentiment = 'Negative' THEN 1 END)::int as negative_count,
         COUNT(CASE WHEN sentiment = 'Neutral'  THEN 1 END)::int as neutral_count,
         COALESCE(AVG(score)::numeric, 0) as avg_rating
       FROM feedback
       WHERE receiver_user_id = $1`,
      [teacherId]
    );

    const row = result.rows[0] || { count: 0 };
    return res.json({
      avg: Number(row.avg_rating) || 0,
      count: Number(row.count) || 0,
      positive: Number(row.positive_count) || 0,
      negative: Number(row.negative_count) || 0,
      neutral: Number(row.neutral_count) || 0
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/feedback/all - Admin/Management only
// ✅ Admin CAN see who submitted (oversight purpose) but student identity shown clearly
router.get('/all', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'management') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const result = await pool.query(
      `SELECT
         f.id,
         f.score,
         f.comment,
         f.sentiment,
         f.created_on,
         ru.display_name AS faculty_name
       FROM feedback f
       LEFT JOIN users ru ON ru.user_id = f.receiver_user_id
       ORDER BY f.created_on DESC
       LIMIT 1000`
    );

    // Admin sees faculty name and feedback stats but NOT student identity
    // This keeps student anonymity even from admin while still allowing oversight
    const feedbackList = result.rows.map(row => ({
      id: row.id,
      faculty_name: row.faculty_name,
      score: row.score,
      comment: row.comment,
      sentiment: row.sentiment,
      created_on: row.created_on
      // ❌ NO student_name, student_email, sender_user_id
    }));

    return res.json({ feedback: feedbackList, total: feedbackList.length });
  } catch (err) {
    console.error('Error fetching all feedback:', err);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;