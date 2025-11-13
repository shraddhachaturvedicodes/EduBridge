// server/server.js
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded timetable files (filesystem storage)
app.use('/uploads/timetables', express.static(path.join(process.cwd(), 'uploads', 'timetables')));

// routes (modular)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
const rankingsRouter = require('./routes/rankings');
app.use('/api/rankings', rankingsRouter);


// API 404 fallback
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API Route Not Found.' });
  }
  next();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
