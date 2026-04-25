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

    console.log('Fetching notices for role:', role, '-> noticeRoles:', noticeRoles);

    // 1. Get notices from last 3 days based on role
    const noticeResult = await pool.query(
      `SELECT notice_id as id, title, content, posted_on as created_at
       FROM notices
       WHERE target_role = ANY($1::text[])
       AND posted_on >= NOW() - INTERVAL '3 days'
       ORDER BY posted_on DESC
       LIMIT 10`,
      [noticeRoles]
    );

    console.log('Notices found:', noticeResult.rows.length);

    noticeResult.rows.forEach(n => {
      notifications.push({
        id: `notice_${n.id}`,
        type: 'notice',
        title: '📢 New Notice',
        body: n.title,
        created_at: n.created_at
      });
    });

    // 2. Get messages from last 3 days received by this user
    const msgResult = await pool.query(
      `SELECT m.msg_id as id, m.text_content, m.created_on as created_at,
              u.display_name as sender_name
       FROM messages m
       JOIN users u ON u.user_id = m.sender_user_id
       WHERE m.receiver_user_id = $1
       AND m.created_on >= NOW() - INTERVAL '3 days'
       ORDER BY m.created_on DESC
       LIMIT 10`,
      [user_id]
    );

    console.log('Messages found:', msgResult.rows.length);

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

    // 3. Management and admin also get feedback from last 3 days
    if (role === 'admin' || role === 'management') {
      try {
        const feedbackResult = await pool.query(
          `SELECT f.id, f.comment, f.created_on as created_at,
                  u.display_name as sender_name
           FROM feedback f
           LEFT JOIN users u ON u.user_id = f.sender_user_id
           WHERE f.created_on >= NOW() - INTERVAL '3 days'
           ORDER BY f.created_on DESC
           LIMIT 10`
        );

        console.log('Feedback found:', feedbackResult.rows.length);

        feedbackResult.rows.forEach(f => {
          notifications.push({
            id: `feedback_${f.id}`,
            type: 'feedback',
            title: '⭐ New Feedback Submitted',
            body: f.comment
              ? f.comment.substring(0, 60) + (f.comment.length > 60 ? '...' : '')
              : 'New feedback received',
            created_at: f.created_at
          });
        });
      } catch (feedbackErr) {
        console.warn('Feedback query failed:', feedbackErr.message);
      }
    }

    // Sort all notifications newest first
    notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const result = notifications.slice(0, 15);
    console.log('Total notifications returned:', result.length);

    return res.json({ notifications: result });

  } catch (err) {
    console.error('Notifications error:', err.stack);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;