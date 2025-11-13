// server/routes/timetableFileRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();

// auth + role middleware (adjust paths if your project places them elsewhere)
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');

// IMPORTANT: your project exports { pool } from server/db.js
const { pool } = require('../db');

if (!pool) {
  console.error('[timetableFileRoutes] WARNING: db.pool is not defined. Check server/db.js export.');
}

// Upload folder (served as /uploads by server/index.js)
const UPLOAD_BASE = path.join(process.cwd(), 'server_uploads', 'timetables');

// Ensure folder exists
try {
  if (!fs.existsSync(UPLOAD_BASE)) {
    fs.mkdirSync(UPLOAD_BASE, { recursive: true });
    console.log('[timetableFileRoutes] Created upload directory:', UPLOAD_BASE);
  }
} catch (e) {
  console.error('[timetableFileRoutes] Error ensuring upload directory exists:', e && (e.stack || e.message || e));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_BASE),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// POST /api/timetables/upload
// Requires authentication and role (faculty/admin/management)
router.post(
  '/upload',
  authMiddleware,
  requireRole(['faculty', 'admin', 'management']),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded. Field name must be "file".' });
      }

      // Ensure pool is present
      if (!pool || typeof pool.query !== 'function') {
        console.error('[timetableFileRoutes] DB pool is missing or invalid');
        return res.status(500).json({ error: 'Database not available on server.' });
      }

      // file metadata
      const { filename, originalname, mimetype, size } = req.file;
      // relative URL for client: index.js serves server_uploads at /uploads
      const url = `/uploads/timetables/${filename}`;
      // Who uploaded? authMiddleware should set req.user.user_id
      const uploadedBy = req.user?.user_id ?? null;
      // If req.user has faculty mapping use that, else null
      const facultyId = req.user?.faculty_id ?? null;

      const insertSQL = `
        INSERT INTO timetable_files
          (faculty_id, filename, original_name, mime_type, size_bytes, url, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING tf_id, faculty_id, filename, original_name, mime_type, size_bytes, url, uploaded_on
      `;

      const values = [facultyId, filename, originalname, mimetype, size, url, uploadedBy];

      const r = await pool.query(insertSQL, values);
      const row = r.rows && r.rows[0] ? r.rows[0] : null;

      return res.json({ message: 'Uploaded', file: row });
    } catch (err) {
      // Log full stack so you can paste it here if anything still fails
      console.error('Upload error:', err && (err.stack || err.message || err));
      return res.status(500).json({ error: 'Server error uploading file' });
    }
  }
);

// GET /api/timetables  -> list files
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!pool || typeof pool.query !== 'function') {
      return res.status(500).json({ error: 'Database not available' });
    }
    const r = await pool.query(
      `SELECT tf_id, faculty_id, filename, original_name, mime_type, size_bytes, url, uploaded_on
       FROM timetable_files
       ORDER BY uploaded_on DESC`
    );
    res.json({ files: r.rows });
  } catch (err) {
    console.error('Error listing timetable_files:', err && (err.stack || err.message || err));
    res.status(500).json({ error: 'Failed to list timetable files' });
  }
});

module.exports = router;
