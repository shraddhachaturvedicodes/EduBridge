// server/routes/timetable.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /api/timetable
router.post('/', async (req, res) => {
  const { course_id, faculty_id, day_of_week, start_time, end_time, room, semester } = req.body;
  if (!course_id || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields: course_id, day_of_week, start_time, end_time.' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO timetable (course_id, faculty_id, day_of_week, start_time, end_time, room, semester)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [course_id, faculty_id || null, day_of_week, start_time, end_time, room || null, semester || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('Error creating timetable entry:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Database error while creating timetable entry.' });
  }
});

// GET /api/timetable
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT t.*, c.code AS course_code, c.title AS course_title, c.department AS course_department
      FROM timetable t
      LEFT JOIN courses c ON c.course_id = t.course_id
      ORDER BY t.day_of_week, t.start_time
    `);
    res.json(r.rows);
  } catch (err) {
    console.error('Error reading timetable:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Database error while fetching timetable.' });
  }
});

router.get('/faculty/:facultyId', async (req, res) => {
  const fid = Number(req.params.facultyId);
  try {
    const r = await pool.query('SELECT * FROM timetable WHERE faculty_id = $1 ORDER BY day_of_week, start_time', [fid]);
    res.json(r.rows);
  } catch (err) {
    console.error('Error reading timetable for faculty:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Database error while fetching faculty timetable.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const fields = [];
  const values = [];
  let idx = 1;
  const has = (k) => Object.prototype.hasOwnProperty.call(req.body, k);

  if (has('course_id')) { fields.push(`course_id = $${idx++}`); values.push(req.body.course_id); }
  if (has('faculty_id')) { fields.push(`faculty_id = $${idx++}`); values.push(req.body.faculty_id); }
  if (has('day_of_week')) { fields.push(`day_of_week = $${idx++}`); values.push(req.body.day_of_week); }
  if (has('start_time')) { fields.push(`start_time = $${idx++}`); values.push(req.body.start_time); }
  if (has('end_time')) { fields.push(`end_time = $${idx++}`); values.push(req.body.end_time); }
  if (has('room')) { fields.push(`room = $${idx++}`); values.push(req.body.room); }
  if (has('semester')) { fields.push(`semester = $${idx++}`); values.push(req.body.semester); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields provided for update.' });

  try {
    const q = `UPDATE timetable SET ${fields.join(', ')} WHERE tt_id = $${idx} RETURNING *`;
    values.push(id);
    const r = await pool.query(q, values);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Timetable entry not found.' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Error updating timetable:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Database error while updating timetable.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const r = await pool.query('DELETE FROM timetable WHERE tt_id = $1 RETURNING *', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Timetable entry not found.' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting timetable entry:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Database error while deleting timetable entry.' });
  }
});

module.exports = router;
