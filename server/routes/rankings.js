// server/routes/rankings.js
const express = require('express');
const router = express.Router();

// adjust the DB import path if your db helper file is elsewhere
// I expect a helper at server/db.js which exports a 'pool' (pg Pool) or query wrapper.
const pool = require('../db'); // if ../db exports pool.query, adapt accordingly

// GET /api/rankings
router.get('/', async (req, res) => {
  try {
    const q = `SELECT year, metric, value FROM rankings ORDER BY metric, year ASC`;
    const result = await pool.query(q);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error reading rankings:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Database error while fetching rankings data.' });
  }
});

module.exports = router;
