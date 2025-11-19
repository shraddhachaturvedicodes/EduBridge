// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
let requireRole = null;
try {
  const rg = require('../middleware/roleGuard');
  requireRole = rg && typeof rg.requireRole === 'function' ? rg.requireRole : null;
} catch (e) { /* ignore */ }

if (!requireRole) {
  requireRole = (allowed = []) => (req, res, next) => {
    try {
      const user = req.user || {};
      const role = String(user.role || '').toLowerCase();
      if (!user.user_id) return res.status(403).json({ error: 'Forbidden' });
      if (allowed.length === 0) return next();
      if (allowed.map(x => String(x).toLowerCase()).includes(role)) return next();
      return res.status(403).json({ error: 'Forbidden' });
    } catch (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  };
}

const bcrypt = require('bcrypt');
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

// POST /api/admin/faculty
// body: { email, display_name, temp_password, department?, designation? }
router.post('/faculty', authMiddleware, requireRole(['admin']), async (req, res, next) => {
  try {
    const { email, display_name = null, temp_password, department = null, designation = null } = req.body || {};
    if (!email || !temp_password) return res.status(400).json({ error: 'email and temp_password required' });

    // check existing user
    const exists = await pool.query('SELECT user_id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (exists.rows && exists.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(String(temp_password), SALT_ROUNDS);

    const insertQ = `
      INSERT INTO users (email, password_hash, display_name, role, created_on)
      VALUES ($1,$2,$3,$4, NOW())
      RETURNING user_id, email, display_name, role
    `;
    const r = await pool.query(insertQ, [email, password_hash, display_name, 'faculty']);
    const created = r.rows[0];

    // Optionally store department/designation in teacher_profiles as empty record (not required)
    // We will not force creation of teacher_profiles row here to keep it simple — faculty completes profile.

    return res.json({ created });
  } catch (err) {
    console.error('[admin] create faculty error', err && (err.stack || err));
    return next(err);
  }
});

module.exports = router;
