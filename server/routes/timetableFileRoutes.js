// server/routes/timetableFileRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');
const { pool } = require('../db');

if (!pool) {
  console.error('[timetableFileRoutes] WARNING: db.pool is not defined.');
}

const UPLOAD_BASE = path.join(process.cwd(), 'server_uploads', 'timetables');

try {
  if (!fs.existsSync(UPLOAD_BASE)) {
    fs.mkdirSync(UPLOAD_BASE, { recursive: true });
    console.log('[timetableFileRoutes] Created upload directory:', UPLOAD_BASE);
  }
} catch (e) {
  console.error('[timetableFileRoutes] Error ensuring upload directory:', e.message);
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) { cb(null, UPLOAD_BASE); },
  filename: function(req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '_' + safe);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

// POST /api/timetables/upload
router.post(
  '/upload',
  authMiddleware,
  requireRole(['faculty', 'admin', 'management']),
  upload.single('file'),
  async function(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      if (!pool || typeof pool.query !== 'function') {
        return res.status(500).json({ error: 'Database not available.' });
      }

      const filename = req.file.filename;
      const originalname = req.file.originalname;
      const mimetype = req.file.mimetype;
      const size = req.file.size;
      const url = '/uploads/timetables/' + filename;
      const uploadedBy = req.user ? req.user.user_id : null;
      const facultyId = req.user ? req.user.faculty_id : null;

      const insertSQL = `
        INSERT INTO timetable_files
          (faculty_id, filename, original_name, mime_type, size_bytes, url, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING tf_id, faculty_id, filename, original_name, mime_type, size_bytes, url, uploaded_on
      `;

      const r = await pool.query(insertSQL, [facultyId, filename, originalname, mimetype, size, url, uploadedBy]);
      return res.json({ message: 'Uploaded', file: r.rows[0] });
    } catch (err) {
      console.error('Upload error:', err.stack);
      return res.status(500).json({ error: 'Server error uploading file' });
    }
  }
);

// GET /api/timetables
router.get('/', authMiddleware, async function(req, res) {
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
    console.error('Error listing timetable_files:', err.stack);
    res.status(500).json({ error: 'Failed to list timetable files' });
  }
});

// DELETE /api/timetables/:id
router.delete(
  '/:id',
  authMiddleware,
  requireRole(['faculty', 'admin', 'management']),
  async function(req, res) {
    try {
      const id = req.params.id;

      if (!pool || typeof pool.query !== 'function') {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Get file info first
      const r = await pool.query(
        'SELECT filename, url FROM timetable_files WHERE tf_id = $1',
        [id]
      );

      if (r.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      const fileRow = r.rows[0];

      // Delete from disk
      const filePath = path.join(UPLOAD_BASE, fileRow.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('[timetableFileRoutes] Deleted from disk:', filePath);
        }
      } catch (fsErr) {
        console.warn('[timetableFileRoutes] Could not delete from disk:', fsErr.message);
      }

      // Delete from database
      await pool.query('DELETE FROM timetable_files WHERE tf_id = $1', [id]);

      return res.json({ message: 'File deleted successfully' });
    } catch (err) {
      console.error('Delete error:', err.stack);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
  }
);

module.exports = router;