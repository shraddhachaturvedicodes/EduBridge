const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/messages
router.post('/', authMiddleware, async function(req, res) {
  try {
    var sender = req.user.user_id;
    var receiver_user_id = parseInt(req.body.receiver_user_id, 10);
    var text_content = typeof req.body.text_content === 'string' ? req.body.text_content.trim() : '';

    if (!Number.isInteger(receiver_user_id) || receiver_user_id <= 0 || !text_content) {
      return res.status(400).json({ error: 'receiver_user_id and text_content are required' });
    }

    // Prevent sending message to yourself
    if (receiver_user_id === sender) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Check receiver exists
    var r = await pool.query('SELECT user_id FROM users WHERE user_id=$1', [receiver_user_id]);
    if (!r.rows.length) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    var insert = `
      INSERT INTO messages (sender_user_id, receiver_user_id, text_content)
      VALUES ($1, $2, $3)
      RETURNING msg_id, sender_user_id, receiver_user_id, text_content, created_on
    `;
    var result = await pool.query(insert, [sender, receiver_user_id, text_content]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages/conversations
// Must be BEFORE GET /api/messages/:id
router.get('/conversations', authMiddleware, async function(req, res) {
  try {
    var userId = req.user.user_id;

    var sql = `
      WITH ranked AS (
        SELECT
          m.*,
          CASE
            WHEN m.sender_user_id = $1 THEN m.receiver_user_id
            ELSE m.sender_user_id
          END AS peer_id,
          ROW_NUMBER() OVER (
            PARTITION BY
              CASE
                WHEN m.sender_user_id = $1 THEN m.receiver_user_id
                ELSE m.sender_user_id
              END
            ORDER BY m.created_on DESC
          ) AS rn
        FROM messages m
        WHERE (m.sender_user_id = $1 OR m.receiver_user_id = $1)
          AND m.sender_user_id != m.receiver_user_id
      )
      SELECT
        r.peer_id,
        r.msg_id,
        r.text_content,
        r.created_on,
        r.sender_user_id,
        r.receiver_user_id,
        u.display_name AS peer_name,
        u.email AS peer_email,
        u.role AS peer_role
      FROM ranked r
      JOIN users u ON u.user_id = r.peer_id
      WHERE r.rn = 1
      ORDER BY r.created_on DESC
    `;

    var result = await pool.query(sql, [userId]);
    res.json({ conversations: result.rows });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/messages?peer=<id>
// Returns ONLY messages between current user and the peer — full privacy
router.get('/', authMiddleware, async function(req, res) {
  try {
    var userId = req.user.user_id;
    var peer = req.query.peer;

    if (!peer) {
      return res.json([]);
    }

    var peerId = parseInt(peer, 10);
    if (!Number.isInteger(peerId) || peerId <= 0) {
      return res.status(400).json({ error: 'Invalid peer id' });
    }

    if (peerId === userId) {
      return res.json([]);
    }

    // Only return messages between these two specific users
    var sql = `
      SELECT
        m.msg_id,
        m.sender_user_id,
        m.receiver_user_id,
        m.text_content,
        m.created_on,
        su.display_name AS sender_name,
        ru.display_name AS receiver_name
      FROM messages m
      LEFT JOIN users su ON su.user_id = m.sender_user_id
      LEFT JOIN users ru ON ru.user_id = m.receiver_user_id
      WHERE (m.sender_user_id = $1 AND m.receiver_user_id = $2)
         OR (m.sender_user_id = $2 AND m.receiver_user_id = $1)
      ORDER BY m.created_on ASC
    `;

    var result = await pool.query(sql, [userId, peerId]);
    return res.json(result.rows);
  } catch (err) {
    console.error('Error listing messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', authMiddleware, async function(req, res) {
  try {
    var userId = req.user.user_id;
    var id = parseInt(req.params.id, 10);

    var q = `
      DELETE FROM messages
      WHERE msg_id = $1
        AND (sender_user_id = $2 OR receiver_user_id = $2)
      RETURNING msg_id
    `;
    var result = await pool.query(q, [id, userId]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;