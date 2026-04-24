// server/routes/timetableRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Add timetable entry
router.post('/', async (req, res) => {
  const { course_id, faculty_id, day_of_week, start_time, end_time, room, semester } = req.body;
  if (!course_id || day_of_week === undefined || !start_time || !end_time) return res.status(400).json({ error: 'Missing fields' });
  try {
    const r = await pool.query(
      `INSERT INTO timetable (course_id, faculty_id, day_of_week, start_time, end_time, room, semester)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [course_id, faculty_id || null, day_of_week, start_time, end_time, room || null, semester || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('Error creating timetable entry:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Get full timetable
router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT t.*, c.code AS course_code, c.title AS course_title, c.department AS course_department
      FROM timetable t
      LEFT JOIN courses c ON c.course_id = t.course_id
      ORDER BY t.day_of_week, t.start_time
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error('Error reading timetable:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM timetable WHERE faculty_id=$1 ORDER BY day_of_week, start_time', [req.params.facultyId]);
    res.json(r.rows);
  } catch (err) {
    console.error('Error reading faculty timetable:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

// update and delete (similar to previous pattern)
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = [];
  const vals = [];
  let idx = 1;
  const has = k => Object.prototype.hasOwnProperty.call(req.body, k);

  if (has('course_id')) { fields.push(`course_id=$${idx++}`); vals.push(req.body.course_id); }
  if (has('faculty_id')) { fields.push(`faculty_id=$${idx++}`); vals.push(req.body.faculty_id); }
  if (has('day_of_week')) { fields.push(`day_of_week=$${idx++}`); vals.push(req.body.day_of_week); }
  if (has('start_time')) { fields.push(`start_time=$${idx++}`); vals.push(req.body.start_time); }
  if (has('end_time')) { fields.push(`end_time=$${idx++}`); vals.push(req.body.end_time); }
  if (has('room')) { fields.push(`room=$${idx++}`); vals.push(req.body.room); }
  if (has('semester')) { fields.push(`semester=$${idx++}`); vals.push(req.body.semester); }

  if (!fields.length) return res.status(400).json({ error: 'No fields' });

  try {
    const q = `UPDATE timetable SET ${fields.join(', ')} WHERE tt_id=$${idx} RETURNING *`;
    vals.push(id);
    const r = await pool.query(q, vals);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Error updating timetable:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM timetable WHERE tt_id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting timetable:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
