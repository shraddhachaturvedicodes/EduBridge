// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg'); 
const cors = require('cors'); 

const app = express();
const port = 5000; // API will run on http://localhost:5000

// 1. PostgreSQL Database Setup (Connection Pool)
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database Connection Error:', err.stack);
    } else {
        console.log('PostgreSQL database connected successfully!');
    }
});

// Middleware Setup
app.use(cors()); // Enable CORS for client/server communication
app.use(express.json()); // Allow the server to parse JSON bodies (for POST requests)

// =========================================================================
// 2. API Routes for Faculty (CRUD Operations)
// =========================================================================

// CREATE (Add New Faculty) POST /api/faculty
app.post('/api/faculty', async (req, res) => {
    const { name, email, department, designation, expertise_areas, availability_status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO faculty (name, email, department, designation, expertise_areas, availability_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, department, designation, expertise_areas || null, availability_status || 'Available']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating faculty:', err.message);
        res.status(500).json({ error: 'Database error while creating faculty. Check unique email.' });
    }
});

// READ All Faculty GET /api/faculty
app.get('/api/faculty', async (req, res) => {
    try {
        const result = await pool.query('SELECT faculty_id, name, email, department, designation, expertise_areas, availability_status FROM faculty ORDER BY faculty_id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading faculty:', err.message);
        res.status(500).json({ error: 'Database error while fetching faculty.' });
    }
});

// DELETE Faculty DELETE /api/faculty/:id
app.delete('/api/faculty/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM faculty WHERE faculty_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Faculty member not found.' });
        }
        res.status(200).json({ message: 'Faculty deleted successfully.' });
    } catch (err) {
        console.error('Error deleting faculty:', err.message);
        res.status(500).json({ error: 'Database error while deleting faculty.' });
    }
});


// =========================================================================
// 3. API Routes for Students (CRUD Operations)
// =========================================================================

// CREATE (Add New Student) POST /api/students
app.post('/api/students', async (req, res) => {
    const { name, email, major, enrollment_year, interest_areas } = req.body; 
    try {
        const result = await pool.query(
            'INSERT INTO students (name, email, major, enrollment_year, interest_areas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, major, enrollment_year, interest_areas] 
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating student:', err.message);
        res.status(500).json({ error: 'Database error while creating student. Check unique email/data types.' });
    }
});

// READ All Students GET /api/students
app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT student_id, name, email, major, enrollment_year, interest_areas FROM students ORDER BY student_id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading students:', err.message);
        res.status(500).json({ error: 'Database error while fetching students.' });
    }
});

// DELETE Student DELETE /api/students/:id
app.delete('/api/students/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM students WHERE student_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        res.status(200).json({ message: 'Student deleted successfully.' });
    } catch (err) {
        console.error('Error deleting student:', err.message);
        res.status(500).json({ error: 'Database error while deleting student.' });
    }
});


// =========================================================================
// 4. API Routes for Notices (CRUD Operations) - Management Dashboard
// =========================================================================

// CREATE (Post New Notice) POST /api/notices
app.post('/api/notices', async (req, res) => {
    const { title, content, target_role } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO notices (title, content, target_role) VALUES ($1, $2, $3) RETURNING *',
            [title, content, target_role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating notice:', err.message);
        res.status(500).json({ error: 'Database error while posting notice.' });
    }
});

// READ All Notices GET /api/notices
app.get('/api/notices', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notices ORDER BY posted_on DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading notices:', err.message);
        res.status(500).json({ error: 'Database error while fetching notices.' });
    }
});

// DELETE Notice DELETE /api/notices/:id
app.delete('/api/notices/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM notices WHERE notice_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notice not found.' });
        }
        res.status(200).json({ message: 'Notice deleted successfully.' });
    } catch (err) {
        console.error('Error deleting notice:', err.message);
        res.status(500).json({ error: 'Database error while deleting notice.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});