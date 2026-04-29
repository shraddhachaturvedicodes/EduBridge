# EduBridge

A full-stack educational management platform that bridges **Students**, **Faculty**, and **Admin/Management** in a single unified system. Built as a project using React + Vite + TailwindCSS, Node.js/Express, and PostgreSQL with an integrated Python sentiment analysis module.

---

## 🚀 Features

### 🔐 Authentication & Role-Based Access

- JWT-based login with bcrypt password hashing
- Three roles: `student`, `faculty`, `admin`
- Protected routes via `ProtectedRoute.jsx` and `RequireAuth.jsx`

### 🎓 Student Portal

- View enrolled courses and timetable
- Submit feedback/ratings (score 0–5 + comment) for faculty
- Direct messaging with faculty (`ChatBox`, `MessageComposer`, `MessageList`)
- View notices from management
- Course recommendations via `RecommendationEngine`

### 👨‍🏫 Faculty Portal

- Manage teacher profile (bio, expertise, qualifications) via `FacultyProfile`
- Upload timetable files (PDF/image via Multer)
- View student feedback with sentiment scores via `FeedbackManager`
- Manage project assignments with students
- Direct messaging with students

### 🛠️ Admin / Management

- Post notices targeted to All / Students / Faculty / Management via `NoticeManager`
- View and manage institution rankings via `RankingAnalytics`
- Manage faculty via `FacultyManager`, students via `StudentManager`

### 💬 Direct Messaging

- Real-time direct messages between users with optional file attachment support

### 📊 Sentiment Analysis

- Python-based sentiment module (`/sentiment_module`) analyses feedback comments
- Sentiment stored as `Positive`, `Neutral`, or `Negative` per feedback entry
- Triggered server-side via Python subprocess

### 📈 Analytics & Recommendations

- Analytics dashboard (`Analytics.jsx`) for institutional insights
- Recommendation engine (`RecommendationEngine.jsx`) for course suggestions based on student interest areas

---

## 🛠️ Tech Stack

| Layer        | Technology                            |
| ------------ | ------------------------------------- |
| Frontend     | React + Vite, TailwindCSS (`/client`) |
| Backend      | Node.js, Express 4 (`/server`)        |
| Database     | PostgreSQL — `edubridge_db`           |
| Auth         | JWT (`jsonwebtoken`) + `bcrypt`       |
| Validation   | `express-validator`                   |
| HTTP Client  | Axios (`axiosInstance.js`)            |
| File Uploads | Multer → `server_uploads/timetables/` |
| Sentiment    | Python 3 (`/sentiment_module`)        |
| Security     | Helmet, CORS                          |
| Dev Tools    | Nodemon, ESLint                       |

---

## 📁 Project Structure

```
EduBridge/
├── client/                          # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                     # API call definitions
│   │   ├── assets/                  # Static assets (images, icons)
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Card.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FacultyList.jsx
│   │   │   ├── FacultyManager.jsx
│   │   │   ├── FacultyProfile.jsx
│   │   │   ├── FeedbackManager.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LeftNav.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── MessageComposer.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoticeManager.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicNavbar.jsx
│   │   │   ├── RankingAnalytics.jsx
│   │   │   ├── RecommendationEngine.jsx
│   │   │   ├── RequireAuth.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StudentManager.jsx
│   │   ├── context/                 # React context (auth, global state)
│   │   ├── pages/                   # Page-level views
│   │   │   ├── About.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Faculty.jsx
│   │   │   ├── FacultyManagement.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── Feedback.jsx
│   │   │   ├── FeedbackManager.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Notices.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── StudentManagement.jsx
│   │   │   ├── Students.jsx
│   │   │   └── Timetable.jsx
│   │   ├── services/                # Frontend service layer
│   │   ├── styles/                  # Global styles
│   │   ├── utils/                   # Frontend utility functions
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── axiosInstance.js         # Axios config with base URL + auth headers
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── tailwind.config.cjs
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── database/                    # DB query helpers
│   ├── middleware/                  # Auth middleware, error handler
│   ├── routes/                      # All API route files
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── rankingRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── timetable.js
│   │   └── uploadRoutes.js
│   ├── server_uploads/
│   │   └── timetables/              # Uploaded timetable files
│   ├── services/                    # Business logic layer
│   ├── uploads/                     # General file uploads
│   ├── utils/                       # Backend utility functions
│   ├── config.js                    # Env config loader
│   ├── db.js                        # PostgreSQL pool (pg)
│   ├── index.js                     # Main server entry point
│   ├── server.js                    # Alternate server bootstrap
│   └── package.json
│
├── sentiment_module/                # Python sentiment analysis
├── venv/                            # Python virtual environment
├── EduBridge_sql.sql                # Full DB migration script
├── .env                             # Environment variables (never commit)
├── .gitignore
├── package.json
└── package-lock.json
```

---

## 🗄️ Database Schema

13 tables in PostgreSQL (`edubridge_db`):

| Table                 | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `users`               | Auth table for all roles (student, faculty, admin)         |
| `students`            | Student profiles linked to users by email                  |
| `faculty`             | Faculty profiles with workload & availability              |
| `courses`             | Course catalog with credits and department                 |
| `timetable`           | Schedule entries (day, time, room, semester)               |
| `timetable_files`     | Uploaded timetable PDFs/images per faculty                 |
| `course_files`        | Course-level file uploads                                  |
| `feedback`            | Student-to-faculty ratings (0–5) with comments & sentiment |
| `messages`            | Direct messages between users                              |
| `notices`             | Announcements targeted by role                             |
| `project_assignments` | Student–faculty project mappings                           |
| `teacher_profiles`    | Faculty bio, expertise, rating                             |
| `rankings`            | Institutional ranking metrics by year                      |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- Python 3.x
- npm

---

### 1. Clone the repository

```bash
git clone https://github.com/shraddhachaturvedicodes/EduBridge.git
cd EduBridge
```

---

### 2. Set up environment variables

Create a `.env` file in the **project root** (`EduBridge/.env`):

```env
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=your_postgres_password
PG_DATABASE=edubridge_db
PG_PORT=5432
JWT_SECRET=your_strong_secret_here
JWT_EXP=8h
PORT=5000
PYTHON_BIN=python3
```

> ⚠️ Never commit `.env` — it is already listed in `.gitignore`

---

### 3. Set up the database

Open **pgAdmin** and paste `EduBridge_sql.sql` into the Query Tool, or run:

```bash
psql -U postgres -d edubridge_db -f EduBridge_sql.sql
```

---

### 4. Install backend dependencies

```bash
# From project root
npm install

# Server-specific
cd server && npm install && cd ..
```

---

### 5. Set up the Python sentiment module

**Windows (PowerShell):**

```powershell
python -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
venv\Scripts\activate

cd sentiment_module
pip install -r requirements.txt
cd ..
```

**macOS / Linux:**

```bash
python3 -m venv venv
source venv/bin/activate

cd sentiment_module
pip install -r requirements.txt
cd ..
```

---

### 6. Run the backend

```bash
# From project root (with venv active)
node server/index.js
```

> Backend runs at: `http://localhost:5000`

---

### 7. Run the frontend

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

> Frontend runs at: `http://localhost:5173`

---

## 🌐 API Routes

All routes are prefixed with `/api`:

| Method   | Route                      | Description            |
| -------- | -------------------------- | ---------------------- |
| POST     | `/api/auth/...`            | Login / Register       |
| GET/POST | `/api/faculty/...`         | Faculty management     |
| GET/POST | `/api/students/...`        | Student management     |
| GET/POST | `/api/courses/...`         | Course catalog         |
| GET/POST | `/api/timetable/...`       | Timetable entries      |
| GET/POST | `/api/notices/...`         | Notices                |
| GET/POST | `/api/feedback/...`        | Feedback & sentiment   |
| GET/POST | `/api/messages/...`        | Direct messaging       |
| GET/POST | `/api/uploads/...`         | File uploads           |
| GET      | `/api/recommendations/...` | Course recommendations |
| GET      | `/api/rankings/...`        | Institution rankings   |
| GET      | `/health`                  | Server health check    |

---

## 🔑 Environment Variables Reference

| Variable      | Description           | Default        |
| ------------- | --------------------- | -------------- |
| `PG_HOST`     | PostgreSQL host       | `localhost`    |
| `PG_USER`     | PostgreSQL username   | —              |
| `PG_PASSWORD` | PostgreSQL password   | —              |
| `PG_DATABASE` | Database name         | `edubridge_db` |
| `PG_PORT`     | PostgreSQL port       | `5432`         |
| `JWT_SECRET`  | JWT signing secret    | —              |
| `JWT_EXP`     | JWT token expiry      | `8h`           |
| `PORT`        | Backend server port   | `5000`         |
| `PYTHON_BIN`  | Path to Python binary | `python3`      |

---

## 👤 Default Admin Setup

After running the SQL migration, insert an admin user via pgAdmin:

```sql
INSERT INTO users (email, password_hash, role, display_name)
VALUES ('admin@edubridge.com', '<bcrypt-hash>', 'admin', 'EduBridge Admin');
```

---

## 📝 Notes

- Frontend (Vite) runs on port **5173**, backend on port **5000**
- Uploaded timetable files are served statically at `/uploads/timetables/`
- The Python sentiment module is invoked as a subprocess from Node.js when feedback is submitted
- Developed on **Windows** — cross-platform users should set `PYTHON_BIN=python3` in `.env`
- `DEBUG_CFG=1` can be added to `.env` to log DB config on server startup

---
