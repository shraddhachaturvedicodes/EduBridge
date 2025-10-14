// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg'); 
const cors = require('cors'); 
const { spawn } = require('child_process'); 

const app = express();
const port = 5000; 

// --- 1. PostgreSQL Database Setup ---
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

// --- Middleware Setup ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Added for robustness

// =========================================================================
// Helper Function: Execute Python Script for Sentiment Analysis
// =========================================================================

const runPythonAnalysis = (text) => {
    return new Promise((resolve, reject) => {
        // Runs Python script from the project root (EduBridge/)
        const pythonProcess = spawn('python', ['sentiment_module/analyze.py', text], {
            cwd: process.cwd() 
        });

        let data = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (chunk) => { data += chunk.toString(); });
        pythonProcess.stderr.on('data', (chunk) => { errorData += chunk.toString(); });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script failed. Code: ${code}. Stderr: ${errorData}`);
                return reject(new Error('Python script execution failed.'));
            }
            try {
                const result = JSON.parse(data);
                resolve(result.sentiment);
            } catch (e) {
                reject(new Error('Invalid output from Python script.'));
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('Failed to start Python process:', err);
            reject(new Error(`Failed to start Python. Is Python installed and in PATH? Error: ${err.message}`));
        });
    });
};


// =========================================================================
// 2. API Routes for Faculty (CRUD Operations)
// =========================================================================

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

app.get('/api/faculty', async (req, res) => {
    try {
        const result = await pool.query('SELECT faculty_id, name, email, department, designation, expertise_areas, availability_status FROM faculty ORDER BY faculty_id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading faculty:', err.message);
        res.status(500).json({ error: 'Database error while fetching faculty.' });
    }
});

app.delete('/api/faculty/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM faculty WHERE faculty_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) { return res.status(404).json({ error: 'Faculty member not found.' }); }
        res.status(200).json({ message: 'Faculty deleted successfully.' });
    } catch (err) {
        console.error('Error deleting faculty:', err.message);
        res.status(500).json({ error: 'Database error while deleting faculty.' });
    }
});


// =========================================================================
// 3. API Routes for Students (CRUD Operations)
// =========================================================================

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

app.get('/api/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT student_id, name, email, major, enrollment_year, interest_areas FROM students ORDER BY student_id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading students:', err.message);
        res.status(500).json({ error: 'Database error while fetching students.' });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM students WHERE student_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) { return res.status(404).json({ error: 'Student not found.' }); }
        res.status(200).json({ message: 'Student deleted successfully.' });
    } catch (err) {
        console.error('Error deleting student:', err.message);
        res.status(500).json({ error: 'Database error while deleting student.' });
    }
});


// =========================================================================
// 4. API Routes for Notices (CRUD Operations)
// =========================================================================

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

app.get('/api/notices', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notices ORDER BY posted_on DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading notices:', err.message);
        res.status(500).json({ error: 'Database error while fetching notices.' });
    }
});

app.delete('/api/notices/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM notices WHERE notice_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) { return res.status(404).json({ error: 'Notice not found.' }); }
        res.status(200).json({ message: 'Notice deleted successfully.' });
    } catch (err) {
        console.error('Error deleting notice:', err.message);
        res.status(500).json({ error: 'Database error while deleting notice.' });
    }
});

// =========================================================================
// 5. API Routes for Recommendation Engine
// =========================================================================

app.get('/api/recommendations/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    try {
        const studentResult = await pool.query('SELECT interest_areas FROM students WHERE student_id = $1', [studentId]);
        if (studentResult.rows.length === 0) { return res.status(404).json({ error: 'Student not found.' }); }
        const studentInterests = studentResult.rows[0].interest_areas;

        if (!studentInterests || studentInterests.length === 0) { 
            return res.status(200).json({ recommendations: [], message: "Student has no defined interests." }); 
        }

        const recommendationQuery = `
            SELECT 
                faculty_id, name, email, department, designation, availability_status, expertise_areas
            FROM 
                faculty 
            WHERE 
                expertise_areas && $1::TEXT[]
        `;

        const facultyResult = await pool.query(recommendationQuery, [studentInterests]);
        res.status(200).json(facultyResult.rows);

    } catch (err) {
        console.error('Error generating recommendations:', err.stack);
        res.status(500).json({ error: 'Database error while generating recommendations.' });
    }
});


// =========================================================================
// 6. API Routes for Feedback (Sentiment Analysis)
// =========================================================================

app.post('/api/feedback', async (req, res) => {
    const { student_id, faculty_id, text_content } = req.body;
    if (!student_id || !faculty_id || !text_content) {
        return res.status(400).json({ error: 'Missing required fields: student, faculty, and content.' });
    }

    try {
        const sentimentResult = await runPythonAnalysis(text_content);

        const result = await pool.query(
            'INSERT INTO feedback (student_id, faculty_id, text_content, sentiment) VALUES ($1, $2, $3, $4) RETURNING *',
            [student_id, faculty_id, text_content, sentimentResult]
        );
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Error processing feedback:', err.message);
        res.status(500).json({ error: `Feedback processing failed: ${err.message}` });
    }
});

app.get('/api/feedback', async (req, res) => {
    try {
        const query = `
            SELECT 
                f.feedback_id, s.name AS student_name, fa.name AS faculty_name, 
                f.text_content, f.sentiment, f.submitted_on
            FROM feedback f
            JOIN students s ON f.student_id = s.student_id
            JOIN faculty fa ON f.faculty_id = fa.faculty_id
            ORDER BY f.submitted_on DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading feedback:', err.message);
        res.status(500).json({ error: 'Database error while fetching feedback.' });
    }
});


// =========================================================================
// 7. API Routes for Ranking Analytics
// =========================================================================

app.get('/api/rankings', async (req, res) => {
    try {
        const query = `
            SELECT year, metric, value 
            FROM rankings 
            ORDER BY metric, year ASC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error reading rankings:', err.message);
        res.status(500).json({ error: 'Database error while fetching rankings data.' });
    }
});

app.post('/api/rankings/generate-mock', async (req, res) => {
    try {
        const metrics = ['NIRF Overall Rank', 'UGC Score (Quality)', 'Research Output Score'];
        const years = [2021, 2022, 2023, 2024, 2025];
        const rows = [];
        metrics.forEach(metric => {
            let baseValue = 50; 
            years.forEach(year => {
                const fluctuation = Math.floor(Math.random() * 21) - 10; 
                let value = Math.max(1, baseValue + fluctuation); 
                rows.push(pool.query(
                    'INSERT INTO rankings (year, metric, value) VALUES ($1, $2, $3) ON CONFLICT (year, metric) DO NOTHING',
                    [year, metric, value]
                ));
                baseValue = value; 
            });
        });
        await Promise.all(rows);
        res.status(201).json({ message: `Successfully generated ${metrics.length * years.length} ranking records.` });
    } catch (err) {
        console.error('Error generating mock data:', err.message);
        res.status(500).json({ error: 'Database error while generating mock data.' });
    }
});


// =========================================================================
// 8. Error Catching and Server Start
// =========================================================================

// Global error handler for 404 (must be defined last)
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
        console.error(`404 Error: API Route not found for ${req.originalUrl}`);
        return res.status(404).json({ error: "API Route Not Found." });
    }
    // If it's not an API call, let it pass (React routing handles it)
    next();
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});