// client/src/pages/Courses.jsx
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  teal: '#2dd4bf',
  navy: '#0f2a3d',
  green: '#10b981',
  purple: '#6366f1',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

const DEPT_COLORS = {
  'CSE': '#2dd4bf',
  'Mathematics': '#6366f1',
  'Physics': '#f59e0b',
  'Electronics': '#10b981',
  'Management': '#f43f5e',
  'default': '#3b82f6'
};

function getDeptColor(dept) {
  return DEPT_COLORS[dept] || DEPT_COLORS['default'];
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [form, setForm] = useState({
    code: '',
    title: '',
    credits: '',
    department: '',
    description: ''
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'management';

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    setErr("");
    setLoading(true);
    try {
      const resp = await api.get("/api/courses");
      const data = resp?.data;
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.courses)) list = data.courses;
      else if (Array.isArray(data?.rows)) list = data.rows;
      setCourses(list);
    } catch (error) {
      setErr(error?.response?.data?.error || error.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCourse(e) {
    e.preventDefault();
    if (!form.code || !form.title || !form.department) {
      alert('Please fill Code, Title and Department!');
      return;
    }
    setAdding(true);
    try {
      await api.post('/api/courses', {
        code: form.code.toUpperCase(),
        title: form.title,
        credits: parseInt(form.credits) || 0,
        department: form.department,
        description: form.description
      });
      setAddSuccess(true);
      setForm({ code: '', title: '', credits: '', department: '', description: '' });
      fetchCourses();
      setTimeout(() => {
        setAddSuccess(false);
        setShowAddForm(false);
      }, 2000);
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to add course');
    } finally {
      setAdding(false);
    }
  }

  // Get unique departments for filter
  const departments = ['ALL', ...Array.from(new Set(courses.map(c => c.department).filter(Boolean)))];

  // Filter courses
  const filtered = courses.filter(c => {
    const matchSearch = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.department?.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'ALL' || c.department === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📚 Courses</h1>
          <p style={styles.subtitle}>
            {isAdmin
              ? 'Manage all courses — add, view and organize'
              : 'Browse all available courses and their details'}
          </p>
        </div>
        {isAdmin && (
          <button
            style={styles.addBtn}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Course'}
          </button>
        )}
      </div>

      {/* Add Course Form — admin only */}
      {showAddForm && isAdmin && (
        <div style={styles.formBox}>
          <h3 style={styles.formTitle}>➕ Add New Course</h3>

          {addSuccess && (
            <div style={styles.successMsg}>
              ✅ Course added successfully!
            </div>
          )}

          <form onSubmit={handleAddCourse} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Course Code *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. CS301"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Credits</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="e.g. 4"
                  min="0"
                  max="10"
                  value={form.credits}
                  onChange={e => setForm({ ...form, credits: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Course Title *</label>
              <input
                style={styles.input}
                placeholder="e.g. Machine Learning"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Department *</label>
              <select
                style={styles.input}
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                <option value="">Select Department</option>
                <option>CSE</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Electronics</option>
                <option>Management</option>
                <option>Civil</option>
                <option>Mechanical</option>
                <option>Chemical</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, height: 80, resize: 'vertical' }}
                placeholder="Brief description of the course..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              style={{
                ...styles.submitBtn,
                opacity: adding ? 0.7 : 1
              }}
            >
              {adding ? 'Adding...' : '✅ Add Course'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Row */}
      {!loading && courses.length > 0 && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{courses.length}</div>
            <div style={styles.statLabel}>Total Courses</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {departments.length - 1}
            </div>
            <div style={styles.statLabel}>Departments</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {courses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0)}
            </div>
            <div style={styles.statLabel}>Total Credits</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {Math.round(courses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0) / (courses.length || 1))}
            </div>
            <div style={styles.statLabel}>Avg Credits</div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div style={styles.filterRow}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search by title, code or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={styles.deptFilters}>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              style={{
                ...styles.filterBtn,
                ...(filterDept === dept ? styles.filterBtnActive : {})
              }}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.centered}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
          <div style={{ color: '#64748b' }}>Loading courses...</div>
        </div>
      )}

      {/* Error */}
      {!loading && err && (
        <div style={styles.errorBox}>{err}</div>
      )}

      {/* Empty */}
      {!loading && !err && courses.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>📭</div>
          <h3 style={{ color: COLORS.navy, marginBottom: 8 }}>No Courses Yet</h3>
          <p style={{ color: '#64748b' }}>
            {isAdmin
              ? 'Click "Add Course" to add your first course!'
              : 'No courses available yet. Check back later.'}
          </p>
        </div>
      )}

      {/* Course Cards Grid */}
      {!loading && filtered.length > 0 && (
        <div style={styles.grid}>
          {filtered.map(c => (
            <div key={c.course_id || c.code} style={styles.card}>
              {/* Card Top Color Bar */}
              <div style={{
                height: 6,
                background: getDeptColor(c.department),
                borderRadius: '12px 12px 0 0',
                margin: '-20px -20px 16px -20px'
              }} />

              {/* Course Code Badge */}
              <div style={{
                display: 'inline-block',
                padding: '4px 10px',
                background: getDeptColor(c.department) + '20',
                color: getDeptColor(c.department),
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10
              }}>
                {c.code || 'N/A'}
              </div>

              {/* Course Title */}
              <h3 style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.navy,
                margin: '0 0 8px 0',
                lineHeight: 1.3
              }}>
                {c.title || 'Untitled Course'}
              </h3>

              {/* Description */}
              {c.description && (
                <p style={{
                  fontSize: 13,
                  color: '#64748b',
                  margin: '0 0 14px 0',
                  lineHeight: 1.5
                }}>
                  {c.description.length > 80
                    ? c.description.substring(0, 80) + '...'
                    : c.description}
                </p>
              )}

              {/* Footer Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: 12,
                borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span style={{
                    fontSize: 12,
                    background: '#f1f5f9',
                    padding: '3px 8px',
                    borderRadius: 6,
                    color: '#475569',
                    fontWeight: 600
                  }}>
                    🏫 {c.department || 'N/A'}
                  </span>
                  <span style={{
                    fontSize: 12,
                    background: '#f0fffe',
                    padding: '3px 8px',
                    borderRadius: 6,
                    color: COLORS.teal,
                    fontWeight: 600
                  }}>
                    ⭐ {c.credits || 0} Credits
                  </span>
                </div>
                <div style={{
                  fontSize: 11,
                  color: '#94a3b8'
                }}>
                  {c.created_on
                    ? new Date(c.created_on).toLocaleDateString()
                    : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results from search */}
      {!loading && courses.length > 0 && filtered.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ color: '#64748b' }}>
            No courses match your search. Try a different keyword!
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 28,
    background: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0f2a3d',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    margin: 0,
  },
  addBtn: {
    padding: '12px 20px',
    background: '#2dd4bf',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  formBox: {
    background: '#fff',
    borderRadius: 14,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  formTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#0f2a3d',
    marginTop: 0,
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#0f2a3d',
  },
  input: {
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitBtn: {
    padding: '14px',
    background: '#2dd4bf',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  successMsg: {
    background: '#f0fff8',
    border: '1px solid #2dd4bf',
    color: '#0f766e',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statNum: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0f2a3d',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: 600,
  },
  filterRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  deptFilters: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },
  filterBtnActive: {
    background: '#2dd4bf',
    color: '#fff',
    border: '1px solid #2dd4bf',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s',
    cursor: 'default',
  },
  centered: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
  },
  emptyBox: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
};