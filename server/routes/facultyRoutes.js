// server/routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Create
router.post('/', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const department = req.body.department || req.body.dept || null;
  const designation = req.body.designation || null;
  const expertise_areas = req.body.expertise_areas || req.body.expertise || null;
  const availability_status = req.body.availability_status || req.body.status || 'Available';

  if (!name || !email) return res.status(400).json({ error: 'name and email required' });

  try {
    const result = await pool.query(
      `INSERT INTO faculty (name,email,department,designation,expertise_areas,availability_status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, email, department, designation, expertise_areas, availability_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating faculty:', err);
    if (err && err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Database error while creating faculty.' });
  }
});

// Read all
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT faculty_id, name, email, department, designation, expertise_areas, availability_status FROM faculty ORDER BY faculty_id ASC');
    res.json(r.rows);
  } catch (err) {
    console.error('Error reading faculty:', err);
    res.status(500).json({ error: 'Database error while fetching faculty.' });
  }
});

// Update (partial)
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = [];
  const vals = [];
  let idx = 1;
  const has = k => Object.prototype.hasOwnProperty.call(req.body, k);

  if (has('name')) { fields.push(`name=$${idx++}`); vals.push(req.body.name); }
  if (has('email')) { fields.push(`email=$${idx++}`); vals.push(req.body.email); }
  if (has('department')) { fields.push(`department=$${idx++}`); vals.push(req.body.department); }
  if (has('dept')) { fields.push(`department=$${idx++}`); vals.push(req.body.dept); }
  if (has('designation')) { fields.push(`designation=$${idx++}`); vals.push(req.body.designation); }
  if (has('expertise_areas')) { fields.push(`expertise_areas=$${idx++}`); vals.push(req.body.expertise_areas); }
  if (has('expertise')) { fields.push(`expertise_areas=$${idx++}`); vals.push(req.body.expertise); }
  if (has('availability_status')) { fields.push(`availability_status=$${idx++}`); vals.push(req.body.availability_status); }
  if (has('status')) { fields.push(`availability_status=$${idx++}`); vals.push(req.body.status); }

  if (!fields.length) return res.status(400).json({ error: 'No fields provided' });

  try {
    const q = `UPDATE faculty SET ${fields.join(', ')} WHERE faculty_id=$${idx} RETURNING *`;
    vals.push(id);
    const r = await pool.query(q, vals);
    if (!r.rows.length) return res.status(404).json({ error: 'Faculty not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Error updating faculty:', err);
    res.status(500).json({ error: 'Database error while updating faculty.' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const r = await pool.query('DELETE FROM faculty WHERE faculty_id=$1 RETURNING *', [id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Faculty not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting faculty:', err);
    res.status(500).json({ error: 'Database error while deleting faculty.' });
  }
});

module.exports = router;
