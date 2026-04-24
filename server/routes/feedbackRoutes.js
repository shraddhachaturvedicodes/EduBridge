const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { spawn } = require('child_process');
const path = require('path');

// POST /api/feedback - Submit feedback with sentiment analysis
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    console.log('📝 Feedback submission received');
    console.log('User:', req.user);
    console.log('Body:', req.body);

    const sender = req.user && (req.user.user_id || req.user.id);
    const { receiver_user_id, score, comment } = req.body || {};
    const receiverId = parseInt(receiver_user_id, 10);
    const scoreValue = parseInt(score, 10);

    // Validation
    if (!sender) {
      console.error('❌ No sender user_id');
      return res.status(401).json({ error: 'Unauthorized - Please login again' });
    }

    if (!receiverId || Number.isNaN(scoreValue) || scoreValue < 1 || scoreValue > 5) {
      console.error('❌ Missing or invalid receiver_user_id or score');
      return res.status(400).json({ error: 'Valid receiver_user_id and score required' });
    }

    console.log('✅ Validation passed');

    // Sentiment Analysis (Optional - if Python script exists)
    let sentiment = 'Neutral';
    try {
      const pythonScriptPath = path.join(__dirname, '../../sentiment_module/analyze.py');
      console.log('🤖 Attempting sentiment analysis...');
      console.log('Python script path:', pythonScriptPath);

      const pythonProcess = spawn('python', [pythonScriptPath, comment || '']);
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
              console.log('✅ Sentiment analysis successful:', sentiment);
            } catch (parseErr) {
              console.log('⚠️ Could not parse sentiment result, using Neutral');
            }
          } else {
            console.log('⚠️ Sentiment analysis failed or not available, using Neutral');
            if (errorData) console.log('Python error:', errorData);
          }
          resolve();
        });

        setTimeout(() => {
          pythonProcess.kill();
          console.log('⚠️ Sentiment analysis timeout, using Neutral');
          resolve();
        }, 5000);
      });
    } catch (sentimentErr) {
      console.log('⚠️ Sentiment analysis not available:', sentimentErr.message);
      sentiment = 'Neutral';
    }

    console.log('💾 Inserting feedback into database...');
    console.log('Data:', {
      sender_user_id: sender,
      receiver_user_id: receiverId,
      score: scoreValue,
      comment: comment || null,
      sentiment: sentiment
    });

    const insertQuery = `
      INSERT INTO feedback (sender_user_id, receiver_user_id, score, comment, sentiment, created_on)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [sender, receiverId, scoreValue, comment || null, sentiment]);

    console.log('✅ Feedback saved successfully!');
    console.log('Saved data:', result.rows[0]);

    return res.status(201).json({ 
      success: true,
      message: 'Feedback submitted successfully',
      created: result.rows[0],
      sentiment: sentiment
    });
  } catch (err) {
    console.error('❌ Feedback submission error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      error: 'Failed to submit feedback. Please try again.',
      details: err.message 
    });
  }
});

// GET /api/feedback?teacher_id=...
router.get('/', async (req, res, next) => {
  try {
    const teacherId = parseInt(req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id, 10);
    if (!teacherId) {
      return res.status(400).json({ error: 'teacher_id parameter is required' });
    }

    console.log('📖 Fetching feedback for teacher user_id:', teacherId);

    const feedbackQuery = `
      SELECT
        f.id,
        f.sender_user_id,
        f.receiver_user_id,
        f.score,
        f.comment,
        f.sentiment,
        f.created_on,
        su.display_name AS sender_name,
        su.email AS sender_email,
        ru.display_name AS receiver_name,
        ru.email AS receiver_email
      FROM feedback f
      LEFT JOIN users su ON su.user_id = f.sender_user_id
      LEFT JOIN users ru ON ru.user_id = f.receiver_user_id
      WHERE f.receiver_user_id = $1
      ORDER BY f.created_on DESC
      LIMIT 500
    `;

    const result = await pool.query(feedbackQuery, [teacherId]);
    const feedbackList = result.rows.map((row) => ({
      id: row.id,
      sender_user_id: row.sender_user_id,
      receiver_user_id: row.receiver_user_id,
      score: row.score,
      comment: row.comment,
      sentiment: row.sentiment,
      created_on: row.created_on,
      sender_name: row.sender_name,
      sender_email: row.sender_email,
      receiver_name: row.receiver_name,
      receiver_email: row.receiver_email
    }));

    console.log(`✅ Found ${feedbackList.length} feedback entries`);
    return res.json({ feedback: feedbackList });
  } catch (err) {
    console.error('❌ Error fetching feedback:', err);
    console.error('Error stack:', err.stack);
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

    console.log('📊 Fetching feedback summary for teacher user_id:', teacherId);

    const summaryQuery = `
      SELECT 
        COUNT(*)::int as count,
        COUNT(CASE WHEN sentiment = 'Positive' THEN 1 END)::int as positive_count,
        COUNT(CASE WHEN sentiment = 'Negative' THEN 1 END)::int as negative_count,
        COUNT(CASE WHEN sentiment = 'Neutral' THEN 1 END)::int as neutral_count,
        COALESCE(AVG(score)::numeric, 0) as avg_rating
      FROM feedback
      WHERE receiver_user_id = $1
    `;

    const result = await pool.query(summaryQuery, [teacherId]);
    const row = result.rows[0] || { count: 0 };

    console.log('✅ Summary generated:', row);
    return res.json({ 
      avg: Number(row.avg_rating) || 0,
      count: Number(row.count) || 0,
      positive: Number(row.positive_count) || 0,
      negative: Number(row.negative_count) || 0,
      neutral: Number(row.neutral_count) || 0
    });
  } catch (err) {
    console.error('❌ Error fetching summary:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/feedback/all - Get ALL feedback (Admin/Management only)
router.get('/all', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'management') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    console.log('📊 Admin requesting all feedback');

    const feedbackQuery = `
      SELECT 
        f.id,
        f.sender_user_id,
        f.receiver_user_id,
        f.score,
        f.comment,
        f.sentiment,
        f.created_on,
        su.display_name AS student_name,
        su.email AS student_email,
        ru.display_name AS faculty_name,
        ru.email AS faculty_email
      FROM feedback f
      LEFT JOIN users su ON su.user_id = f.sender_user_id
      LEFT JOIN users ru ON ru.user_id = f.receiver_user_id
      ORDER BY f.created_on DESC
      LIMIT 1000
    `;

    const result = await pool.query(feedbackQuery);
    const feedbackList = result.rows.map(row => ({
      id: row.id,
      student_id: row.sender_user_id,
      faculty_id: row.receiver_user_id,
      student_name: row.student_name,
      student_email: row.student_email,
      faculty_name: row.faculty_name,
      faculty_email: row.faculty_email,
      score: row.score,
      comment: row.comment,
      sentiment: row.sentiment,
      created_on: row.created_on,
      submitted_on: row.created_on
    }));

    console.log(`✅ Found ${feedbackList.length} total feedback entries`);
    return res.json({ feedback: feedbackList, total: feedbackList.length });
  } catch (err) {
    console.error('❌ Error fetching all feedback:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;