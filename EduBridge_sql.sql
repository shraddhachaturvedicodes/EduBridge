-- =========================
-- EduBridge DB Migration
-- Run this in pgAdmin (Query Tool)
-- =========================

BEGIN;

-- 1) FACULTY
CREATE TABLE IF NOT EXISTS faculty (
  faculty_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  department VARCHAR(50) NOT NULL,
  designation VARCHAR(50),
  hire_date DATE DEFAULT CURRENT_DATE,
  workload_hours INT DEFAULT 0,
  availability_status VARCHAR(50) DEFAULT 'Available',
  expertise_areas TEXT[]            -- array of expertise strings
);

-- 2) STUDENTS
CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  major VARCHAR(50) NOT NULL,
  enrollment_year INT,
  interest_areas TEXT[]             -- array of interest strings
);

-- 3) FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(student_id) ON DELETE SET NULL,
  faculty_id INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
  text_content TEXT NOT NULL,
  sentiment VARCHAR(20),
  submitted_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4) NOTICES
CREATE TABLE IF NOT EXISTS notices (
  notice_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(50) NOT NULL DEFAULT 'ALL', -- ALL, STUDENTS, FACULTY, MANAGEMENT
  posted_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5) PROJECT_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS project_assignments (
  assignment_id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
  faculty_id INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
  project_title VARCHAR(255) NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  UNIQUE (student_id, faculty_id)
);

-- 6) RANKINGS
CREATE TABLE IF NOT EXISTS rankings (
  ranking_id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  metric VARCHAR(100) NOT NULL,
  value INT NOT NULL,
  UNIQUE (year, metric)
);

-- 7) USERS (Authentication)
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student', -- student | faculty | admin
  display_name VARCHAR(255),
  created_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8) TIMETABLE FILES (metadata for uploaded PDFs/images)
CREATE TABLE IF NOT EXISTS timetable_files (
  tf_id SERIAL PRIMARY KEY,
  faculty_id INT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  url TEXT,                      -- relative URL to serve the file
  uploaded_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  uploaded_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timetable_files_faculty ON timetable_files(faculty_id);

-- 9) MESSAGES (direct messaging)
CREATE TABLE IF NOT EXISTS messages (
  msg_id SERIAL PRIMARY KEY,
  sender_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  text_content TEXT,
  attachment_url TEXT,
  created_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_user_id);

-- 10) COURSES (optional)
CREATE TABLE IF NOT EXISTS courses (
  course_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  credits INT DEFAULT 0,
  department VARCHAR(100),
  instructors INT[],       -- array of faculty_id integers
  description TEXT,
  created_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11) TIMETABLE (schedule entries)
CREATE TABLE IF NOT EXISTS timetable (
  tt_id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
  faculty_id INT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  day_of_week SMALLINT NOT NULL,  -- 0 = Sunday .. 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(80),
  semester VARCHAR(40),
  created_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_timetable_faculty_id ON timetable(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_course_id ON timetable(course_id);

-- 12) COURSE FILES (course-level uploads)
CREATE TABLE IF NOT EXISTS course_files (
  cf_id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  url TEXT,
  uploaded_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  uploaded_on TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13) Add nullable user_id columns to students and faculty and add FK constraints (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='students' AND column_name='user_id'
  ) THEN
    ALTER TABLE students ADD COLUMN user_id INTEGER UNIQUE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='faculty' AND column_name='user_id'
  ) THEN
    ALTER TABLE faculty ADD COLUMN user_id INTEGER UNIQUE;
  END IF;
END$$;

-- Add FK constraint for students.user_id -> users.user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'students'
      AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE students
      ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
  END IF;
END$$;

-- Add FK constraint for faculty.user_id -> users.user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'faculty'
      AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE faculty
      ADD CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
  END IF;
END$$;

COMMIT;

-- Helpful quick sanity queries (run AFTER migration if you want)
-- SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
-- SELECT * FROM users LIMIT 5;
-- SELECT count(*) FROM faculty;
-- SELECT count(*) FROM students;


INSERT INTO users (email, password_hash, role, display_name)
VALUES ('admin@example.com', '<bcrypt-hash>', 'admin', 'Admin One');

INSERT INTO notices (title, content, target_role) VALUES ('Direct DB test', 'This is inserted directly via SQL', 'ALL');
SELECT notice_id, title, target_role, posted_on FROM notices ORDER BY posted_on DESC LIMIT 5;

UPDATE users
SET password_hash = '$2b$10$ilAIJZmvG4MCX1Pm/Ppfa.TosdbJyV5uRKWwuTV92.W7r1Tz/LcbK'
WHERE lower(email) = lower('admin@example.com');
SELECT user_id, email FROM users WHERE lower(email) = lower('admin@example.com');

INSERT INTO courses (code, title, credits, department, description)
VALUES
  ('CS101', 'Introduction to Programming', 3, 'CSE', 'Basic programming concepts using Java/JS'),
  ('CS201', 'Data Structures', 4, 'CSE', 'Arrays, Linked Lists, Trees, Graphs'),
  ('MA101', 'Calculus I', 3, 'Mathematics', 'Differential and Integral Calculus');


SELECT tf_id, faculty_id, filename, original_name, url, uploaded_on
FROM timetable_files
ORDER BY uploaded_on DESC
LIMIT 10;

drop table feedback;

CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  sender_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  receiver_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_on TIMESTAMP DEFAULT NOW()
);

-- server/sql/2025_add_teacher_profiles.sql

INSERT INTO users (email, password_hash, role, display_name)
VALUES ('teacher5@example.com', 'dummy', 'faculty', 'Teacher Five')
RETURNING user_id;


CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  bio TEXT,
  expertise TEXT,            -- comma-separated tags OR plain text ("nlp,ml,deep learning,...")
  updated_on TIMESTAMP DEFAULT now()
);

-- optional sample seed (run AFTER your users exist and teacher users have user_id 3,4,...)
INSERT INTO teacher_profiles (user_id, bio, expertise)
VALUES
  (3, 'Assistant professor in CS, specializes in machine learning and NLP. PhD in AI.', 'machine learning,nlp,deep learning,python'),
  (4, 'Senior lecturer: databases, distributed systems, and cloud computing.', 'databases,distributed systems,sql,cloud'),
  (5, 'Lecturer: machine learning, computer vision and deep learning projects.', 'computer vision,deep learning,opencv,python');


--- 1) Ensure users table has essential columns (if already present this does nothing)
-- Adjust column names if your users table already differs (I inspected code that expects user_id, email, password)
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2) Create feedback table (safe if does not exist)
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  sender_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score NUMERIC(3,2) CHECK (score >= 0 AND score <= 5),
  comment TEXT,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Ensure teacher_profiles exists and has basic columns (if not exists)
-- This block will create a lightweight teacher_profiles if you don't already have one.
-- If you do already have a table named teacher_profiles, this CREATE will fail; in that case skip this section.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='teacher_profiles'
  ) THEN
    CREATE TABLE public.teacher_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
      expertise TEXT,
      education TEXT,
      bio TEXT,
      qualifications TEXT,
      areas TEXT,
      skills TEXT,
      rating NUMERIC(3,2) DEFAULT 0,
      created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END$$;

-- 4) Speed: index on feedback.receiver_user_id
CREATE INDEX IF NOT EXISTS idx_feedback_receiver ON feedback(receiver_user_id);

-- 2025_add_feedback_and_cols.sql
-- 1) Ensure password_hash + role columns exist on users (no overwrite)
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2) Create feedback table if not exists
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  sender_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score NUMERIC(3,2) CHECK (score >= 0 AND score <= 5),
  comment TEXT,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_feedback_receiver ON feedback(receiver_user_id);

-- 4) Ensure teacher_profiles rating column exists (non-destructive)
ALTER TABLE IF EXISTS teacher_profiles
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;

SELECT * FROM users;

UPDATE users
SET passw
SET password = '$2a$10$XREAedEdiyMFATU/i2SHU.uonQ415QMVI8TUAuzxIwJhRB5HVBOae'
WHERE email = 'admin2@example.com';

--5) Check if feedback table exists
SELECT * FROM feedback LIMIT 1;

SELECT * FROM feedback ORDER BY created_on DESC LIMIT 5;

-- Add sentiment column
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) DEFAULT 'Neutral';

-- Verify it was added (use SELECT, not \d)
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'feedback';

SELECT * FROM feedback ORDER BY created_on DESC LIMIT 5;

-- ✅ Correct for pgAdmin
SELECT column_name FROM information_schema.columns WHERE table_name = 'feedback';
SELECT * FROM feedback;

-- Check if sentiment column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'feedback' AND column_name = 'sentiment';

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'feedback';

-- Check current students table
SELECT student_id, user_id, name, email FROM students;

-- Link students to users by email
UPDATE students s
SET user_id = u.user_id
FROM users u
WHERE s.email = u.email;

-- Verify
SELECT s.student_id, s.user_id, s.name, s.email 
FROM students s
WHERE s.user_id IS NOT NULL;

SELECT user_id, email, role, display_name FROM users ORDER BY user_id;

-- Delete old broken admin if exists
DELETE FROM users WHERE email = 'admin@edubridge.com';

-- Insert fresh admin
INSERT INTO users (email, password_hash, role, display_name)
VALUES (
  'admin@edubridge.com',
  'PA',
  'admin',
  'EduBridge Admin'
);

-- Verify
SELECT user_id, email, role, display_name FROM users WHERE role = 'admin';


-- Remove any self-messages (where sender = receiver)
DELETE FROM messages WHERE sender_user_id = receiver_user_id;

-- Check conversations are clean
SELECT sender_user_id, receiver_user_id, text_content FROM messages ORDER BY created_on DESC LIMIT 10;