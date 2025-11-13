// server/db.js
// Robust DB pool export used by all routes
const { Pool } = require('pg');

// Use environment variables (server/index.js already loads dotenv)
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
  // optional: you can tune connectionLimits here
  // max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000
});

// quick test log when this module is first required (non-blocking)
pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err && (err.stack || err));
});

module.exports = { pool };
