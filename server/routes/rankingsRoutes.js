// server/routes/rankingsRoutes.js
const express = require('express');
const router = express.Router();

// Import the pool exported by server/db.js
const { pool } = require('../db');

// GET /api/rankings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT year, metric, value
      FROM rankings
      ORDER BY metric, year ASC
    `);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error reading rankings:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Database error while fetching rankings data.' });
  }
});

// POST /api/rankings/generate-mock
router.post('/generate-mock', async (req, res) => {
  try {
    const metrics = ['NIRF Overall Rank', 'UGC Score (Quality)', 'Research Output Score'];
    const years = [2021, 2022, 2023, 2024, 2025];
    const promises = [];

    metrics.forEach(metric => {
      let baseValue = 50;
      years.forEach(year => {
        const fluctuation = Math.floor(Math.random() * 21) - 10;
        let value = Math.max(1, baseValue + fluctuation);
        promises.push(
          pool.query(
            'INSERT INTO rankings (year, metric, value) VALUES ($1, $2, $3) ON CONFLICT (year, metric) DO NOTHING',
            [year, metric, value]
          )
        );
        baseValue = value;
      });
    });

    await Promise.all(promises);
    return res.status(201).json({ message: `Generated ${metrics.length * years.length} ranking records.` });
  } catch (err) {
    console.error('Error generating mock rankings:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Database error while generating mock rankings.' });
  }
});

module.exports = router;
