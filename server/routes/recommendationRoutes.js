// server/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/recommendations?q=...&limit=...
 * Searches faculty by expertise_areas, department, name, designation
 * Works from the faculty table joined with users
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().replace(/^['"]+|['"]+$/g, '').trim();
    if (!q) return res.json({ recommendations: [] });

    const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 100);
    const param = `%${q}%`;

    // Search faculty table — expertise_areas is a text[] so we use array_to_string to search it
    // Also search name, department, designation
    // Join with users to get user_id for messaging
    const sql = `
      SELECT
        f.faculty_id,
        f.name,
        f.email,
        f.department,
        f.designation,
        f.availability_status,
        f.expertise_areas,
        f.user_id,
        COALESCE(u.display_name, f.name) AS display_name,
        COALESCE(u.user_id, f.user_id)   AS messaging_user_id
      FROM faculty f
      LEFT JOIN users u ON u.user_id = f.user_id
      WHERE
        array_to_string(f.expertise_areas, ' ') ILIKE $1
        OR f.name        ILIKE $1
        OR f.department  ILIKE $1
        OR f.designation ILIKE $1
      ORDER BY
        -- Available faculty first
        CASE WHEN LOWER(f.availability_status) = 'available' THEN 0 ELSE 1 END,
        f.name ASC
      LIMIT $2
    `;

    const r = await pool.query(sql, [param, limit]);
    const rows = (r.rows || []).map(row => ({
      faculty_id:          row.faculty_id,
      user_id:             row.messaging_user_id,
      display_name:        row.display_name || row.name,
      email:               row.email,
      department:          row.department,
      designation:         row.designation,
      availability_status: row.availability_status,
      expertise:           row.expertise_areas
                             ? row.expertise_areas.join(', ')
                             : '',
      expertise_areas:     row.expertise_areas || [],
      // score based on availability: available = 0.9, unavailable = 0.5
      score: (row.availability_status || '').toLowerCase() === 'available' ? 0.9 : 0.5
    }));

    return res.json({ recommendations: rows });
  } catch (err) {
    console.error('[recommendations] GET / error:', err.stack || err);
    return next(err);
  }
});

/**
 * GET /api/recommendations/profiles
 * Returns all faculty profiles
 */
router.get('/profiles', authMiddleware, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '200', 10) || 200, 1000);

    const sql = `
      SELECT
        f.faculty_id,
        f.name,
        f.email,
        f.department,
        f.designation,
        f.availability_status,
        f.expertise_areas,
        f.workload_hours,
        f.user_id,
        COALESCE(u.display_name, f.name) AS display_name
      FROM faculty f
      LEFT JOIN users u ON u.user_id = f.user_id
      ORDER BY
        CASE WHEN LOWER(f.availability_status) = 'available' THEN 0 ELSE 1 END,
        f.name ASC
      LIMIT $1
    `;

    const r = await pool.query(sql, [limit]);
    return res.json({ profiles: r.rows || [] });
  } catch (err) {
    console.error('[recommendations] GET /profiles error:', err.stack || err);
    return next(err);
  }
});

/**
 * POST /api/recommendations/teacher/profile
 * Update faculty expertise/designation/department
 */
router.post('/teacher/profile', authMiddleware, async (req, res, next) => {
  try {
    const requester = req.user || {};
    const requesterRole = (requester.role || '').toLowerCase();
    const isPrivileged = ['faculty', 'admin', 'management'].includes(requesterRole);
    if (!isPrivileged) return res.status(403).json({ error: 'Forbidden' });

    const { user_id, expertise, department, designation, bio } = req.body || {};
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // Find faculty row by user_id
    const existing = await pool.query('SELECT faculty_id FROM faculty WHERE user_id = $1', [user_id]);

    if (existing.rows.length === 0) {
      // Get user info to create faculty row
      const userRow = await pool.query('SELECT email, display_name FROM users WHERE user_id = $1', [user_id]);
      if (!userRow.rows.length) return res.status(404).json({ error: 'User not found' });

      const expertiseArr = expertise
        ? `{${expertise.split(',').map(s => `"${s.trim()}"`).join(',')}}`
        : '{}';

      const ins = await pool.query(
        `INSERT INTO faculty (name, email, department, designation, expertise_areas, user_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          userRow.rows[0].display_name || userRow.rows[0].email,
          userRow.rows[0].email,
          department || 'General',
          designation || 'Lecturer',
          expertiseArr,
          user_id
        ]
      );
      return res.json({ created: ins.rows[0] });
    } else {
      const facultyId = existing.rows[0].faculty_id;
      const updates = [];
      const vals = [];
      let idx = 1;

      if (expertise !== undefined) {
        const arr = `{${expertise.split(',').map(s => `"${s.trim()}"`).join(',')}}`;
        updates.push(`expertise_areas = $${idx++}`); vals.push(arr);
      }
      if (department !== undefined) { updates.push(`department = $${idx++}`); vals.push(department); }
      if (designation !== undefined) { updates.push(`designation = $${idx++}`); vals.push(designation); }

      if (updates.length === 0) return res.json({ message: 'Nothing to update' });

      vals.push(facultyId);
      const up = await pool.query(
        `UPDATE faculty SET ${updates.join(', ')} WHERE faculty_id = $${idx} RETURNING *`,
        vals
      );
      return res.json({ updated: up.rows[0] });
    }
  } catch (err) {
    console.error('[recommendations] POST /teacher/profile error:', err.stack || err);
    return next(err);
  }
});

module.exports = router;