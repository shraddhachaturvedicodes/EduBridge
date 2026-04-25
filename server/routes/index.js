// server/routes/index.js - central router
const express = require('express');
const router = express.Router();

// Import all route modules
const facultyRoutes = require('./facultyRoutes');
const studentRoutes = require('./studentRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const courseRoutes = require('./courseRoutes');
const timetableRoutes = require('./timetableRoutes');
const noticeRoutes = require('./noticeRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const authRoutes = require('./authRoutes');
const messageRoutes = require('./messageRoutes');
const timetableFileRoutes = require('./timetableFileRoutes');
const rankingsRoutes = require('./rankingsRoutes'); // 🆕 add this line
const usersRoutes = require('./usersRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');

// Mount all route modules
router.use('/faculty', facultyRoutes);
router.use('/students', studentRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/courses', courseRoutes);
router.use('/timetable', timetableRoutes);
router.use('/timetables', timetableFileRoutes); // file upload/listing
router.use('/notices', noticeRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/rankings', rankingsRoutes); // 🆕 mount here
router.use('/users', usersRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
