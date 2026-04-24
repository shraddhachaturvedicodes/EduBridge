// server/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Create
router.post('/', async (req, res) => {
  const { name, email, major, enrollment_year, interest_areas } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  try {
    const r = await pool.query(
      'INSERT INTO students (name,email,major,enrollment_year,interest_areas) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, email, major || null, enrollment_year || null, interest_areas || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('Error creating student:', err);
    if (err && err.code === '23505') return res.status(400).json({ error: 'Email exists' });
    res.status(500).json({ error: 'Database error while creating student.' });
  }
});

// Read all
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT student_id, name, email, major, enrollment_year, interest_areas FROM students ORDER BY student_id ASC');
    res.json(r.rows);
  } catch (err) {
    console.error('Error reading students:', err);
    res.status(500).json({ error: 'Database error while fetching students.' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = [];
  const vals = [];
  let idx = 1;
  const has = k => Object.prototype.hasOwnProperty.call(req.body, k);

  if (has('name')) { fields.push(`name=$${idx++}`); vals.push(req.body.name); }
  if (has('email')) { fields.push(`email=$${idx++}`); vals.push(req.body.email); }
  if (has('major')) { fields.push(`major=$${idx++}`); vals.push(req.body.major); }
  if (has('enrollment_year')) { fields.push(`enrollment_year=$${idx++}`); vals.push(req.body.enrollment_year); }
  if (has('interest_areas')) { fields.push(`interest_areas=$${idx++}`); vals.push(req.body.interest_areas); }

  if (!fields.length) return res.status(400).json({ error: 'No fields provided' });

  try {
    const q = `UPDATE students SET ${fields.join(', ')} WHERE student_id=$${idx} RETURNING *`;
    vals.push(id);
    const r = await pool.query(q, vals);
    if (!r.rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Database error while updating student.' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const r = await pool.query('DELETE FROM students WHERE student_id=$1 RETURNING *', [id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Database error while deleting student.' });
  }
});

module.exports = router;
