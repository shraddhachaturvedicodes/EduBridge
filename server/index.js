// server/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const express = require('express');
const cors = require('cors');

// helmet optional
let helmet;
try { helmet = require('helmet'); } catch (e) { helmet = null; }

const routes = require('./routes'); // central router index
const { pool } = require('./db');   // pull pool from db.js
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler') || {
  errorHandler: (err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server error' }); },
  notFoundHandler: (req, res, next) => res.status(404).json({ error: 'API Route Not Found.' })
};

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (helmet) app.use(helmet());

// --------- Robust static uploads serving ---------
// Look for common directories where uploaded files might be written.
// We prefer an explicit 'server_uploads' if present, otherwise 'server/uploads' or 'uploads'.
const candidateDirs = [
  path.join(process.cwd(), 'server_uploads'), // C:\Users\HP\EduBridge\server_uploads
  path.join(__dirname, 'uploads'),            // C:\Users\HP\EduBridge\server\uploads
  path.join(process.cwd(), 'uploads'),        // C:\Users\HP\EduBridge\uploads
  path.join(__dirname, '..', 'server_uploads') // another possible layout
];

let uploadsDir = null;
for (const d of candidateDirs) {
  try {
    if (fs.existsSync(d) && fs.statSync(d).isDirectory()) {
      uploadsDir = d;
      break;
    }
  } catch (e) {
    // ignore permission or stat errors
  }
}

if (uploadsDir) {
  console.log('[uploads] serving static files from', uploadsDir);
  // Serve at /uploads so a saved file under <uploadsDir>/timetables/<file>
  // will be reachable at http://<host>:<port>/uploads/timetables/<file>
  app.use('/uploads', express.static(uploadsDir));
} else {
  console.warn('[uploads] WARNING: no uploads directory found. Checked:', candidateDirs);
}

// mount API router under /api
app.use('/api', routes);

// simple health-check
app.get('/health', (req, res) => res.json({ ok: true }));

// 404 handler for /api routes (must be after router)
app.use('/api', notFoundHandler);

// global error handler
app.use(errorHandler);

// Start server after verifying pool exists and log some useful info
(async () => {
  try {
    if (!pool || typeof pool.query !== 'function') {
      throw new Error('Postgres pool not available. Check server/db.js and server/config.js');
    }
    const r = await pool.query('SELECT NOW() AS now');
    console.log('Postgres connected. server time:', r.rows && r.rows[0] ? r.rows[0] : r);
  } catch (err) {
    console.error('Database Connection Error:', err && err.stack ? err.stack : err);
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
    // brief route summary (best-effort)
    try {
      console.log('--- Registered routes (brief) ---');
      console.log('GET /health');
      if (routes && routes.stack) {
        routes.stack.forEach(r => {
          if (r.route && r.route.path) {
            const methods = Object.keys(r.route.methods).join(', ').toUpperCase();
            console.log(`${methods} ${path.posix.join('/api', r.route.path)}`);
          }
        });
      }
      console.log('--------------------------------');
    } catch (e) {
      /* noop */
    }
  });
})();
