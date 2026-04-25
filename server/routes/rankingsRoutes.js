// server/routes/rankingsRoutes.js
const express = require('express');
const router = express.Router();
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
    console.error('Error reading rankings:', err.stack);
    return res.status(500).json({ error: 'Database error while fetching rankings.' });
  }
});

// POST /api/rankings/generate-mock
// Realistic Graphic Era University inspired data
router.post('/generate-mock', async (req, res) => {
  try {
    // Realistic GEU-inspired data per year
    // NIRF rank: lower = better (GEU is typically in 100-200 range)
    // Other scores: higher = better (out of 100)
    const data = [
      // NIRF Overall Rank (lower is better)
      { metric: 'NIRF Overall Rank',       year: 2021, value: 175 },
      { metric: 'NIRF Overall Rank',       year: 2022, value: 162 },
      { metric: 'NIRF Overall Rank',       year: 2023, value: 148 },
      { metric: 'NIRF Overall Rank',       year: 2024, value: 131 },
      { metric: 'NIRF Overall Rank',       year: 2025, value: 118 },
      { metric: 'NIRF Overall Rank',       year: 2026, value: 104 },

      // Teaching & Learning Quality (out of 100)
      { metric: 'Teaching & Learning',     year: 2021, value: 62 },
      { metric: 'Teaching & Learning',     year: 2022, value: 65 },
      { metric: 'Teaching & Learning',     year: 2023, value: 68 },
      { metric: 'Teaching & Learning',     year: 2024, value: 72 },
      { metric: 'Teaching & Learning',     year: 2025, value: 75 },
      { metric: 'Teaching & Learning',     year: 2026, value: 78 },

      // Research Output Score (out of 100)
      { metric: 'Research Output',         year: 2021, value: 38 },
      { metric: 'Research Output',         year: 2022, value: 42 },
      { metric: 'Research Output',         year: 2023, value: 47 },
      { metric: 'Research Output',         year: 2024, value: 53 },
      { metric: 'Research Output',         year: 2025, value: 58 },
      { metric: 'Research Output',         year: 2026, value: 63 },

      // Graduation & Placement Outcomes (out of 100)
      { metric: 'Graduation Outcomes',     year: 2021, value: 70 },
      { metric: 'Graduation Outcomes',     year: 2022, value: 72 },
      { metric: 'Graduation Outcomes',     year: 2023, value: 75 },
      { metric: 'Graduation Outcomes',     year: 2024, value: 78 },
      { metric: 'Graduation Outcomes',     year: 2025, value: 82 },
      { metric: 'Graduation Outcomes',     year: 2026, value: 85 },

      // Industry Connect & Internships (out of 100)
      { metric: 'Industry Connect',        year: 2021, value: 55 },
      { metric: 'Industry Connect',        year: 2022, value: 58 },
      { metric: 'Industry Connect',        year: 2023, value: 63 },
      { metric: 'Industry Connect',        year: 2024, value: 67 },
      { metric: 'Industry Connect',        year: 2025, value: 71 },
      { metric: 'Industry Connect',        year: 2026, value: 76 },

      // Infrastructure Score (out of 100)
      { metric: 'Infrastructure Score',    year: 2021, value: 72 },
      { metric: 'Infrastructure Score',    year: 2022, value: 74 },
      { metric: 'Infrastructure Score',    year: 2023, value: 76 },
      { metric: 'Infrastructure Score',    year: 2024, value: 79 },
      { metric: 'Infrastructure Score',    year: 2025, value: 82 },
      { metric: 'Infrastructure Score',    year: 2026, value: 85 },
    ];

    // Clear old data and insert fresh
    await pool.query('DELETE FROM rankings');

    const promises = data.map(d =>
      pool.query(
        `INSERT INTO rankings (year, metric, value)
         VALUES ($1, $2, $3)
         ON CONFLICT (year, metric) DO UPDATE SET value = EXCLUDED.value`,
        [d.year, d.metric, d.value]
      )
    );

    await Promise.all(promises);

    return res.status(201).json({
      message: `Successfully generated ${data.length} realistic GEU ranking records.`
    });

  } catch (err) {
    console.error('Error generating rankings:', err.stack);
    return res.status(500).json({ error: 'Database error while generating rankings.' });
  }
});

module.exports = router;