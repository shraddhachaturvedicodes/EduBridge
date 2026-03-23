/*// server/routes/feedbackRoutes.js
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

    // Validation
    if (!sender) {
      console.error('❌ No sender user_id');
      return res.status(401).json({ error: 'Unauthorized - Please login again' });
    }

    if (!receiver_user_id || score === undefined || score === null) {
      console.error('❌ Missing receiver_user_id or score');
      return res.status(400).json({ error: 'receiver_user_id and score required' });
    }

    console.log('✅ Validation passed');

    // Sentiment Analysis (Optional - if Python script exists)
    let sentiment = 'Neutral';
    
    try {
      // Path to Python script (adjust if needed)
      const pythonScriptPath = path.join(__dirname, '../../sentiment_module/analyze.py');
      console.log('🤖 Attempting sentiment analysis...');
      console.log('Python script path:', pythonScriptPath);

      const pythonProcess = spawn('python3', [pythonScriptPath, comment || '']);
      
      let sentimentData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        sentimentData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Wait for Python process to complete
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

        // Timeout after 5 seconds
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

    // Insert feedback into database
    console.log('💾 Inserting feedback into database...');
    console.log('Data:', {
      sender_user_id: sender,
      receiver_user_id: receiver_user_id,
      score: score,
      comment: comment || null,
      sentiment: sentiment
    });

    const q = `INSERT INTO feedback (sender_user_id, receiver_user_id, score, comment, sentiment, created_on)
               VALUES ($1, $2, $3, $4, $5, NOW()) 
               RETURNING *`;
    
    const r = await pool.query(q, [sender, receiver_user_id, score, comment || null, sentiment]);

    console.log('✅ Feedback saved successfully!');
    console.log('Saved data:', r.rows[0]);

    return res.status(201).json({ 
      success: true,
      message: 'Feedback submitted successfully',
      created: r.rows[0],
      sentiment: sentiment
    });

  } catch (err) {
    console.error('❌ Feedback create error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      error: 'Failed to submit feedback. Please try again.',
      details: err.message 
    });
  }
});

// GET /api/feedback?teacher_id=... or faculty_id=... or receiver_user_id=...
router.get('/', async (req, res, next) => {
  try {
    const teacherId = req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id;
    if (!teacherId) {
      return res.status(400).json({ error: 'teacher_id (or faculty_id) required' });
    }

    console.log('📖 Fetching feedback for teacher:', teacherId);

    const q = `SELECT f.id, f.sender_user_id, f.receiver_user_id, f.score, f.comment, f.sentiment, f.created_on,
                      u.display_name as sender_name, u.email as sender_email
               FROM feedback f
               LEFT JOIN users u ON u.user_id = f.sender_user_id
               WHERE f.receiver_user_id = $1
               ORDER BY f.created_on DESC
               LIMIT 500`;
    
    const r = await pool.query(q, [teacherId]);
    
    console.log(`✅ Found ${r.rows.length} feedback entries`);
    
    return res.json({ feedback: r.rows || [] });
  } catch (err) {
    console.error('❌ Feedback list error:', err);
    console.error('Error stack:', err && err.stack);
    return next(err);
  }
});

// GET /api/feedback/summary?teacher_id=...
router.get('/summary', async (req, res, next) => {
  try {
    const teacherId = req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id;
    if (!teacherId) {
      return res.status(400).json({ error: 'teacher_id required' });
    }

    console.log('📊 Fetching feedback summary for teacher:', teacherId);

    const q = `SELECT 
                COALESCE(AVG(score)::numeric, 0) as avg_rating, 
                COUNT(*)::int as count,
                COUNT(CASE WHEN sentiment = 'Positive' THEN 1 END)::int as positive_count,
                COUNT(CASE WHEN sentiment = 'Negative' THEN 1 END)::int as negative_count,
                COUNT(CASE WHEN sentiment = 'Neutral' THEN 1 END)::int as neutral_count
               FROM feedback
               WHERE receiver_user_id = $1`;
    
    const r = await pool.query(q, [teacherId]);
    const row = r.rows[0] || { avg_rating: 0, count: 0 };
    
    console.log('✅ Summary generated:', row);
    
    return res.json({ 
      avg: Number(row.avg_rating) || 0, 
      count: Number(row.count) || 0,
      positive: Number(row.positive_count) || 0,
      negative: Number(row.negative_count) || 0,
      neutral: Number(row.neutral_count) || 0
    });
  } catch (err) {
    console.error('❌ Feedback summary error:', err);
    console.error('Error stack:', err && err.stack);
    return next(err);
  }
});

module.exports = router;*/
// server/routes/feedbackRoutes.js
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

    // Validation
    if (!sender) {
      console.error('❌ No sender user_id');
      return res.status(401).json({ error: 'Unauthorized - Please login again' });
    }

    if (!receiver_user_id || score === undefined || score === null) {
      console.error('❌ Missing receiver_user_id or score');
      return res.status(400).json({ error: 'receiver_user_id and score required' });
    }

    console.log('✅ Validation passed');

    // Get student_id from user_id
    console.log('🔍 Looking up student_id for user_id:', sender);
    const studentQuery = await pool.query(
      'SELECT student_id FROM students WHERE user_id = $1',
      [sender]
    );

    if (!studentQuery.rows || studentQuery.rows.length === 0) {
      console.error('❌ Student not found for user_id:', sender);
      return res.status(400).json({ error: 'Student profile not found. Please contact admin.' });
    }

    const student_id = studentQuery.rows[0].student_id;
    console.log('✅ Found student_id:', student_id);

    // Get faculty_id from user_id
    console.log('🔍 Looking up faculty_id for user_id:', receiver_user_id);
    const facultyQuery = await pool.query(
      'SELECT faculty_id FROM faculty WHERE user_id = $1',
      [receiver_user_id]
    );

    if (!facultyQuery.rows || facultyQuery.rows.length === 0) {
      console.error('❌ Faculty not found for user_id:', receiver_user_id);
      return res.status(400).json({ error: 'Faculty profile not found' });
    }

    const faculty_id = facultyQuery.rows[0].faculty_id;
    console.log('✅ Found faculty_id:', faculty_id);

    // Sentiment Analysis (Optional)
    let sentiment = 'Neutral';
    
    try {
      const pythonScriptPath = path.join(__dirname, '../../sentiment_module/analyze.py');
      console.log('🤖 Attempting sentiment analysis...');
      console.log('Python script path:', pythonScriptPath);

      const pythonProcess = spawn('python3', [pythonScriptPath, comment || '']);
      
      let sentimentData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        sentimentData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

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

    // Build text_content with rating and comment
    const text_content = `Rating: ${score}/5 - ${comment || 'No comment'}`;

    // Insert feedback using YOUR database column names
    console.log('💾 Inserting feedback into database...');
    console.log('Data:', {
      student_id: student_id,
      faculty_id: faculty_id,
      text_content: text_content,
      sentiment: sentiment
    });

    const insertQuery = `
      INSERT INTO feedback (student_id, faculty_id, text_content, sentiment, submitted_on)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      student_id,
      faculty_id,
      text_content,
      sentiment
    ]);

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
    const teacherId = req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id;
    
    if (!teacherId) {
      return res.status(400).json({ error: 'teacher_id parameter is required' });
    }

    console.log('📖 Fetching feedback for teacher user_id:', teacherId);

    // Get faculty_id from user_id
    const facultyQuery = await pool.query(
      'SELECT faculty_id FROM faculty WHERE user_id = $1',
      [teacherId]
    );

    if (!facultyQuery.rows || facultyQuery.rows.length === 0) {
      console.log('⚠️ Faculty not found for user_id:', teacherId);
      return res.json({ feedback: [] });
    }

    const faculty_id = facultyQuery.rows[0].faculty_id;
    console.log('✅ Found faculty_id:', faculty_id);

    // Get feedback for this faculty
    const feedbackQuery = `
      SELECT 
        f.feedback_id as id,
        f.student_id as sender_user_id,
        f.faculty_id as receiver_user_id,
        f.text_content,
        f.sentiment,
        f.submitted_on as created_on,
        s.name as sender_name,
        s.email as sender_email
      FROM feedback f
      LEFT JOIN students s ON f.student_id = s.student_id
      WHERE f.faculty_id = $1
      ORDER BY f.submitted_on DESC
      LIMIT 500
    `;
    
    const result = await pool.query(feedbackQuery, [faculty_id]);
    
    // Parse text_content to extract score and comment
    const feedbackList = result.rows.map(row => {
      let score = 0;
      let comment = row.text_content;
      
      // Extract rating from text_content
      const ratingMatch = row.text_content?.match(/Rating: (\d)\/5/);
      if (ratingMatch) {
        score = parseInt(ratingMatch[1]);
        comment = row.text_content.replace(/Rating: \d\/5 - /, '');
      }
      
      return {
        id: row.id,
        sender_user_id: row.sender_user_id,
        receiver_user_id: row.receiver_user_id,
        score: score,
        comment: comment,
        sentiment: row.sentiment,
        created_on: row.created_on,
        sender_name: row.sender_name,
        sender_email: row.sender_email
      };
    });
    
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
    const teacherId = req.query.teacher_id || req.query.faculty_id || req.query.receiver_user_id;
    
    if (!teacherId) {
      return res.status(400).json({ error: 'teacher_id parameter is required' });
    }

    console.log('📊 Fetching feedback summary for teacher user_id:', teacherId);

    // Get faculty_id from user_id
    const facultyQuery = await pool.query(
      'SELECT faculty_id FROM faculty WHERE user_id = $1',
      [teacherId]
    );

    if (!facultyQuery.rows || facultyQuery.rows.length === 0) {
      return res.json({ count: 0, positive: 0, negative: 0, neutral: 0 });
    }

    const faculty_id = facultyQuery.rows[0].faculty_id;

    const summaryQuery = `
      SELECT 
        COUNT(*)::int as count,
        COUNT(CASE WHEN sentiment = 'Positive' THEN 1 END)::int as positive_count,
        COUNT(CASE WHEN sentiment = 'Negative' THEN 1 END)::int as negative_count,
        COUNT(CASE WHEN sentiment = 'Neutral' THEN 1 END)::int as neutral_count
      FROM feedback
      WHERE faculty_id = $1
    `;
    
    const result = await pool.query(summaryQuery, [faculty_id]);
    const row = result.rows[0] || { count: 0 };
    
    console.log('✅ Summary generated:', row);
    
    return res.json({ 
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
    // Check if user is admin or management
    if (req.user.role !== 'admin' && req.user.role !== 'management') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    console.log('📊 Admin requesting all feedback');

    const feedbackQuery = `
      SELECT 
        f.feedback_id as id,
        f.student_id,
        f.faculty_id,
        f.text_content,
        f.sentiment,
        f.submitted_on as created_on,
        s.name as student_name,
        s.email as student_email,
        fa.name as faculty_name,
        fa.email as faculty_email
      FROM feedback f
      LEFT JOIN students s ON f.student_id = s.student_id
      LEFT JOIN faculty fa ON f.faculty_id = fa.faculty_id
      ORDER BY f.submitted_on DESC
      LIMIT 1000
    `;
    
    const result = await pool.query(feedbackQuery);
    
    // Parse text_content to extract score and comment
    const feedbackList = result.rows.map(row => {
      let score = 0;
      let comment = row.text_content;
      
      // Extract rating from text_content
      const ratingMatch = row.text_content?.match(/Rating: (\d)\/5/);
      if (ratingMatch) {
        score = parseInt(ratingMatch[1]);
        comment = row.text_content.replace(/Rating: \d\/5 - /, '');
      }
      
      return {
        id: row.id,
        student_id: row.student_id,
        faculty_id: row.faculty_id,
        student_name: row.student_name,
        student_email: row.student_email,
        faculty_name: row.faculty_name,
        faculty_email: row.faculty_email,
        score: score,
        comment: comment,
        text_content: row.text_content,
        sentiment: row.sentiment,
        created_on: row.created_on,
        submitted_on: row.created_on
      };
    });
    
    console.log(`✅ Found ${feedbackList.length} total feedback entries`);
    
    return res.json({ 
      feedback: feedbackList,
      total: feedbackList.length
    });
    
  } catch (err) {
    console.error('❌ Error fetching all feedback:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;