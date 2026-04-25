// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXP = process.env.JWT_EXP || '8h';

const ALLOWED_DOMAINS = ['geu.ac.in', 'gehu.ac.in', 'gmail.com'];

function getEmailDomain(email) {
  return email.split('@')[1]?.toLowerCase();
}

// =====================
// REGISTER
// =====================
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password minimum 6 characters'),
    body('role').optional().isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, display_name, faculty_code } = req.body;
    const domain = getEmailDomain(email);
    const userRole = role || 'student';

    // RULE 1: Block admin self-registration
    if (userRole === 'admin') {
      return res.status(403).json({
        error: 'Admin accounts cannot be self-registered. Contact system administrator.'
      });
    }

    // RULE 2: Check email domain for all users
    if (!ALLOWED_DOMAINS.includes(domain)) {
      return res.status(400).json({
        error: 'Please use a valid email. Allowed domains: @geu.ac.in, @gehu.ac.in or @gmail.com'
      });
    }

    // RULE 3: Faculty must provide correct faculty code
    if (userRole === 'faculty') {
      const correctCode = process.env.FACULTY_CODE;
      if (!faculty_code || faculty_code.trim() === '') {
        return res.status(403).json({
          error: 'Faculty registration requires a Faculty Code.'
        });
      }
      if (faculty_code.trim() !== correctCode) {
        return res.status(403).json({
          error: 'Invalid Faculty Code. Please contact your administrator.'
        });
      }
    }

    try {
      // Check if email already exists
      const exists = await pool.query(
        'SELECT user_id FROM users WHERE lower(email) = lower($1)', [email]
      );
      if (exists.rows.length) {
        return res.status(400).json({
          error: 'This email is already registered. Please login instead.'
        });
      }

      const hash = await bcrypt.hash(password, 10);

      const r = await pool.query(
        `INSERT INTO users (email, password_hash, role, display_name) 
         VALUES (lower($1), $2, $3, $4) 
         RETURNING user_id, email, role, display_name`,
        [email, hash, userRole, display_name || null]
      );

      return res.status(201).json({
        message: 'Account created successfully!',
        user: r.rows[0]
      });

    } catch (err) {
      console.error('Register error:', err.stack);
      return res.status(500).json({ error: 'Server error. Please try again.' });
    }
  }
);

// =====================
// LOGIN
// =====================
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const r = await pool.query(
        'SELECT user_id, email, password_hash, role, display_name FROM users WHERE lower(email) = lower($1)',
        [email]
      );

      if (r.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = r.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const payload = {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });

      return res.json({
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
          display_name: user.display_name
        }
      });

    } catch (err) {
      console.error('Login error:', err.stack);
      return res.status(500).json({ error: 'Server error. Please try again.' });
    }
  }
);

// =====================
// ME (get current user)
// =====================
const { authMiddleware } = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;