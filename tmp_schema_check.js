require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
});
(async () => {
  try {
    const tables = ['users', 'students', 'faculty', 'feedback'];
    for (const table of tables) {
      const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [table]);
      console.log('---', table, '---');
      res.rows.forEach(r => console.log(r.column_name, r.data_type));
    }
  } catch (err) {
    console.error(err.stack || err);
  } finally {
    await pool.end();
  }
})();
