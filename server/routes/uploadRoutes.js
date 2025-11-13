// server/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const uploadsBase = path.join(process.cwd(), 'uploads');
const timetableDir = path.join(uploadsBase, 'timetables');
if (!fs.existsSync(uploadsBase)) fs.mkdirSync(uploadsBase);
if (!fs.existsSync(timetableDir)) fs.mkdirSync(timetableDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, timetableDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^\w\-]/g, '_');
    cb(null, `${name}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// upload by faculty/admin
router.post('/timetables/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!['faculty','admin'].includes(req.user.role)) {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Only faculty or admin can upload timetable files' });
    }

    let facultyId = Number(req.body.faculty_id) || null;
    if (!facultyId) {
      const fres = await pool.query('SELECT faculty_id FROM faculty WHERE user_id = $1 LIMIT 1', [req.user.user_id]);
      if (fres.rows.length) facultyId = fres.rows[0].faculty_id;
    }

    if (!facultyId) {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'faculty_id not provided and cannot be inferred' });
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `/uploads/timetables/${req.file.filename}`;
    const q = `INSERT INTO timetable_files (faculty_id, filename, original_name, mime_type, size_bytes, url, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const vals = [facultyId, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, fileUrl, req.user.user_id];
    const ins = await pool.query(q, vals);
    res.status(201).json(ins.rows[0]);
  } catch (err) {
    console.error('Upload error:', err.message || err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// list files (public) with optional ?faculty_id=
router.get('/timetables', async (req, res) => {
  try {
    const facultyId = req.query.faculty_id ? Number(req.query.faculty_id) : null;
    const q = facultyId ? 'SELECT * FROM timetable_files WHERE faculty_id = $1 ORDER BY uploaded_on DESC' : 'SELECT * FROM timetable_files ORDER BY uploaded_on DESC';
    const r = facultyId ? await pool.query(q, [facultyId]) : await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error('List timetables error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch timetable files' });
  }
});

// get single file metadata
router.get('/timetables/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const r = await pool.query('SELECT * FROM timetable_files WHERE tf_id = $1', [id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Timetable detail error:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
