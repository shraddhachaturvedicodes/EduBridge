// server/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // expects server/db exports { pool }

if (!db || !db.pool) {
  console.error('[courseRoutes] WARNING: db.pool missing - check server/db.js export');
}

// GET /api/courses  -> list courses
router.get('/', async (req, res) => {
  try {
    const q = `SELECT course_id, code, title, credits, department, instructors, description, created_on
               FROM courses
               ORDER BY created_on DESC LIMIT 100`;
    const result = await db.pool.query(q);
    return res.json({ courses: result.rows });
  } catch (err) {
    // log full stack server-side for debugging
    console.error('[courseRoutes] Error fetching courses:', err && err.stack ? err.stack : err);
    // send a simple message to client to avoid leaking internals
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id -> single course
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const q = 'SELECT * FROM courses WHERE course_id = $1';
    const r = await db.pool.query(q, [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    return res.json({ course: r.rows[0] });
  } catch (err) {
    console.error('[courseRoutes] Error fetching course by id:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Failed to fetch course' });
  }
});

module.exports = router;
