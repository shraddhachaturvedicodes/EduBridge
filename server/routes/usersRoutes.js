// server/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/users?roles=faculty,admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rolesQuery = req.query.roles || '';
    const roles = rolesQuery.split(',').map(r => r.trim()).filter(Boolean);
    let sql, params;
    if (roles.length) {
      // parameterized roles IN clause
      const placeholders = roles.map((_, i) => `$${i+1}`).join(',');
      sql = `SELECT user_id, display_name, email, role FROM users WHERE role IN (${placeholders}) ORDER BY display_name`;
      params = roles;
    } else {
      sql = `SELECT user_id, display_name, email, role FROM users ORDER BY display_name`;
      params = [];
    }
    const { rows } = await pool.query(sql, params);
    res.json({ users: rows });
  } catch (err) {
    console.error('Error fetching users', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
