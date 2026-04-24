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
    console.log('Students with user_id null:');
    let res = await pool.query('SELECT student_id, name, email, user_id FROM students WHERE user_id IS NULL LIMIT 20');
    console.log(res.rows);
    console.log('Students with user_id populated:');
    res = await pool.query('SELECT student_id, name, email, user_id FROM students WHERE user_id IS NOT NULL LIMIT 20');
    console.log(res.rows);
    console.log('Students that do not have a matching user:');
    res = await pool.query(`SELECT s.student_id, s.name, s.email, s.user_id FROM students s LEFT JOIN users u ON s.user_id = u.user_id WHERE s.user_id IS NOT NULL AND u.user_id IS NULL LIMIT 20`);
    console.log(res.rows);
    console.log('Users with role student missing student row:');
    res = await pool.query(`SELECT u.user_id, u.email, u.role FROM users u WHERE u.role = 'student' AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.user_id) LIMIT 20`);
    console.log(res.rows);
  } catch (err) {
    console.error(err.stack || err);
  } finally {
    await pool.end();
  }
})();
