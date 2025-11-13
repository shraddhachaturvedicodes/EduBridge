// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db'); // adjust import if your db export is different
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/messages
// body: { receiver_user_id, text_content, [attachment_url] }
router.post('/', authMiddleware, async (req, res) => {
  try {
    const sender = req.user.user_id;
    const { receiver_user_id, text_content, attachment_url = null } = req.body;
    if (!receiver_user_id || !text_content) return res.status(400).json({ error: 'Missing fields' });

    // ensure receiver exists
    const r = await pool.query('SELECT user_id FROM users WHERE user_id=$1', [receiver_user_id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Receiver user not found' });

    const insert = `INSERT INTO messages (sender_user_id, receiver_user_id, text_content, attachment_url)
                    VALUES ($1,$2,$3,$4) RETURNING msg_id, sender_user_id, receiver_user_id, text_content, created_on`;
    const { rows } = await pool.query(insert, [sender, receiver_user_id, text_content, attachment_url]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages?peer=<id>  OR  GET /api/messages to list latest for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const peer = req.query.peer;
    if (peer) {
      // fetch all messages between user and peer ordered asc
      const sql = `
        SELECT m.*, su.display_name as sender_name, ru.display_name as receiver_name
        FROM messages m
        LEFT JOIN users su ON su.user_id = m.sender_user_id
        LEFT JOIN users ru ON ru.user_id = m.receiver_user_id
        WHERE (sender_user_id=$1 AND receiver_user_id=$2)
           OR (sender_user_id=$2 AND receiver_user_id=$1)
        ORDER BY created_on ASC
      `;
      const { rows } = await pool.query(sql, [userId, parseInt(peer, 10)]);
      return res.json(rows);
    } else {
      // inbox: latest messages for the user (could be limited/paginated)
      const sql = `
        SELECT m.*, su.display_name as sender_name, ru.display_name as receiver_name
        FROM messages m
        LEFT JOIN users su ON su.user_id = m.sender_user_id
        LEFT JOIN users ru ON ru.user_id = m.receiver_user_id
        WHERE sender_user_id = $1 OR receiver_user_id = $1
        ORDER BY created_on DESC
        LIMIT 200
      `;
      const { rows } = await pool.query(sql, [userId]);
      return res.json(rows);
    }
  } catch (err) {
    console.error('Error listing messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/conversations  -> one row per peer with latest message
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const sql = `
      WITH peers AS (
        SELECT
          CASE WHEN sender_user_id = $1 THEN receiver_user_id ELSE sender_user_id END AS peer_id,
          MAX(created_on) AS last_time
        FROM messages
        WHERE sender_user_id = $1 OR receiver_user_id = $1
        GROUP BY peer_id
      )
      SELECT
        p.peer_id,
        m.msg_id,
        m.text_content,
        m.created_on,
        u.display_name AS peer_name,
        u.email AS peer_email
      FROM peers p
      JOIN messages m
        ON ((m.sender_user_id = $1 AND m.receiver_user_id = p.peer_id)
            OR (m.sender_user_id = p.peer_id AND m.receiver_user_id = $1))
        AND m.created_on = p.last_time
      JOIN users u ON u.user_id = p.peer_id
      ORDER BY p.last_time DESC;
    `;
    const { rows } = await pool.query(sql, [userId]);
    res.json({ conversations: rows });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const id = parseInt(req.params.id, 10);
    // Only allow sender or receiver (or admin) to delete
    const q = `DELETE FROM messages WHERE msg_id=$1 AND (sender_user_id=$2 OR receiver_user_id=$2) RETURNING msg_id`;
    const { rows } = await pool.query(q, [id, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Message not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
