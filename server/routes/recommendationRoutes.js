// server/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config');
const { scoreFaculty } = require('../services/recommendationService');

router.get('/:studentId', async (req, res) => {
  const studentId = Number(req.params.studentId);
  try {
    const studentRes = await pool.query('SELECT interest_areas, name FROM students WHERE student_id=$1', [studentId]);
    if (!studentRes.rows.length) return res.status(404).json({ error: 'Student not found' });
    const studentRow = studentRes.rows[0];

    const facultyRes = await pool.query('SELECT faculty_id, name, email, department, designation, expertise_areas, availability_status FROM faculty');
    const scored = scoreFaculty(studentRow.interest_areas, facultyRes.rows);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    res.json({ student: { student_id: studentId, name: studentRow.name, interests: studentRow.interest_areas }, recommendations: scored.slice(0, limit) });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ error: 'Database error while generating recommendations.' });
  }
});

module.exports = router;
