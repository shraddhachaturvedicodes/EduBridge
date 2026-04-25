// server/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

if (!db || !db.pool) {
  console.error('[courseRoutes] WARNING: db.pool missing - check server/db.js export');
}

// GET /api/courses -> list all courses
router.get('/', async (req, res) => {
  try {
    const q = `SELECT course_id, code, title, credits, department, 
                      instructors, description, created_on
               FROM courses
               ORDER BY created_on DESC LIMIT 100`;
    const result = await db.pool.query(q);
    return res.json({ courses: result.rows });
  } catch (err) {
    console.error('[courseRoutes] Error fetching courses:', err.stack);
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id -> single course
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const q = 'SELECT * FROM courses WHERE course_id = $1';
    const r = await db.pool.query(q, [id]);
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    return res.json({ course: r.rows[0] });
  } catch (err) {
    console.error('[courseRoutes] Error fetching course by id:', err.stack);
    return res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST /api/courses -> add new course (admin/management only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { user } = req;

    // Only admin or management can add courses
    if (user.role !== 'admin' && user.role !== 'management') {
      return res.status(403).json({ error: 'Only admin or management can add courses.' });
    }

    const { code, title, credits, department, description } = req.body;

    // Validate required fields
    if (!code || !title || !department) {
      return res.status(400).json({ error: 'Code, title and department are required.' });
    }

    // Check if course code already exists
    const exists = await db.pool.query(
      'SELECT course_id FROM courses WHERE UPPER(code) = UPPER($1)',
      [code]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: `Course code "${code}" already exists.` });
    }

    const q = `INSERT INTO courses (code, title, credits, department, description)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING course_id, code, title, credits, department, description, created_on`;

    const result = await db.pool.query(q, [
      code.toUpperCase(),
      title,
      parseInt(credits) || 0,
      department,
      description || null
    ]);

    return res.status(201).json({
      message: 'Course added successfully!',
      course: result.rows[0]
    });

  } catch (err) {
    console.error('[courseRoutes] Error adding course:', err.stack);
    return res.status(500).json({ error: 'Failed to add course.' });
  }
});

// DELETE /api/courses/:id -> delete course (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { user } = req;
    if (user.role !== 'admin' && user.role !== 'management') {
      return res.status(403).json({ error: 'Only admin or management can delete courses.' });
    }

    const { id } = req.params;
    await db.pool.query('DELETE FROM courses WHERE course_id = $1', [id]);
    return res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('[courseRoutes] Error deleting course:', err.stack);
    return res.status(500).json({ error: 'Failed to delete course.' });
  }
});

module.exports = router;