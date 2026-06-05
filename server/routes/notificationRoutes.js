// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const { user_id, role } = req.user;

  try {
    const notifications = [];

    // Map user role to notice target_role values in DB
    let noticeRoles = ['ALL'];
    if (role === 'student') {
      noticeRoles = ['ALL', 'STUDENTS'];
    } else if (role === 'faculty') {
      noticeRoles = ['ALL', 'FACULTY'];
    } else if (role === 'admin' || role === 'management') {
      noticeRoles = ['ALL', 'MANAGEMENT', 'STUDENTS', 'FACULTY'];
    }

    // 1. Notices filtered by role
    const noticeResult = await pool.query(
      `SELECT notice_id as id, title, content, posted_on as created_at
       FROM notices
       WHERE UPPER(target_role) = ANY($1::text[])
       AND posted_on >= NOW() - INTERVAL '7 days'
       ORDER BY posted_on DESC
       LIMIT 10`,
      [noticeRoles]
    );

    noticeResult.rows.forEach(n => {
      notifications.push({
        id: `notice_${n.id}`,
        type: 'notice',
        title: '📢 New Notice',
        body: n.title,
        created_at: n.created_at
      });
    });

    // 2. Messages received by this user
    const msgResult = await pool.query(
      `SELECT m.msg_id as id, m.text_content, m.created_on as created_at,
              u.display_name as sender_name
       FROM messages m
       JOIN users u ON u.user_id = m.sender_user_id
       WHERE m.receiver_user_id = $1
       AND m.created_on >= NOW() - INTERVAL '7 days'
       ORDER BY m.created_on DESC
       LIMIT 10`,
      [user_id]
    );

    msgResult.rows.forEach(m => {
      notifications.push({
        id: `msg_${m.id}`,
        type: 'message',
        title: `💬 Message from ${m.sender_name || 'Someone'}`,
        body: m.text_content
          ? m.text_content.substring(0, 60) + (m.text_content.length > 60 ? '...' : '')
          : 'New message received',
        created_at: m.created_at
      });
    });

    // 3. Faculty: notified of new feedback but WITHOUT sender identity
    if (role === 'faculty') {
      try {
        const feedbackResult = await pool.query(
          `SELECT f.id, f.comment, f.score, f.created_on as created_at
           FROM feedback f
           WHERE f.receiver_user_id = $1
           AND f.created_on >= NOW() - INTERVAL '7 days'
           ORDER BY f.created_on DESC
           LIMIT 10`,
          [user_id]
        );

        feedbackResult.rows.forEach(f => {
          notifications.push({
            id: `feedback_${f.id}`,
            type: 'feedback',
            // ✅ No sender name — anonymous
            title: `⭐ New Anonymous Feedback — ${f.score}/5`,
            body: f.comment
              ? f.comment.substring(0, 60) + (f.comment.length > 60 ? '...' : '')
              : 'New feedback received',
            created_at: f.created_at
          });
        });
      } catch (err) {
        console.warn('Faculty feedback query failed:', err.message);
      }
    }

    // 4. Admin/Management: feedback notifications without student identity
    if (role === 'admin' || role === 'management') {
      try {
        const feedbackResult = await pool.query(
          `SELECT f.id, f.comment, f.score, f.created_on as created_at,
                  ru.display_name as faculty_name
           FROM feedback f
           LEFT JOIN users ru ON ru.user_id = f.receiver_user_id
           WHERE f.created_on >= NOW() - INTERVAL '7 days'
           ORDER BY f.created_on DESC
           LIMIT 10`
        );

        feedbackResult.rows.forEach(f => {
          notifications.push({
            id: `feedback_${f.id}`,
            type: 'feedback',
            // ✅ Shows which faculty received it but NOT who sent it
            title: `⭐ New Feedback for ${f.faculty_name || 'Faculty'} — ${f.score}/5`,
            body: f.comment
              ? f.comment.substring(0, 60) + (f.comment.length > 60 ? '...' : '')
              : 'New feedback received',
            created_at: f.created_at
          });
        });
      } catch (err) {
        console.warn('Admin feedback query failed:', err.message);
      }
    }

    notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json({ notifications: notifications.slice(0, 15) });

  } catch (err) {
    console.error('Notifications error:', err.stack);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;