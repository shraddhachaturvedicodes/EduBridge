// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db'); // adjust if export differs

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXP = process.env.JWT_EXP || '8h';

// Register
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min length 6'),
    body('role').optional().isIn(['student','faculty','admin']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, role, display_name } = req.body;
    try {
      // check existing
      const exists = await pool.query('SELECT user_id FROM users WHERE lower(email) = lower($1)', [email]);
      if (exists.rows.length) return res.status(400).json({ error: 'Email already exists' });

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);

      const r = await pool.query(
        'INSERT INTO users (email, password_hash, role, display_name) VALUES (lower($1), $2, $3, $4) RETURNING user_id, email, role, display_name',
        [email, hash, role || 'student', display_name || null]
      );

      const user = r.rows[0];
      // Optionally link user to a student/faculty row separately (not done here).
      return res.status(201).json({ user });
    } catch (err) {
      console.error('Register error:', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const r = await pool.query('SELECT user_id, email, password_hash, role, display_name FROM users WHERE lower(email) = lower($1)', [email]);
      if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = r.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const payload = { user_id: user.user_id, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });

      return res.json({ token, user: { user_id: user.user_id, email: user.email, role: user.role, display_name: user.display_name } });
    } catch (err) {
      console.error('Login error:', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// Me (protected)
const { authMiddleware } = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  // req.user has been attached by authMiddleware and enriched with db info if available
  res.json({ user: req.user });
});

module.exports = router;
