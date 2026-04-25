// client/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axiosInstance";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

const COLORS = {
  teal: '#2dd4bf',
  navy: '#0f2a3d',
  purple: '#6366f1',
  amber: '#f59e0b',
  rose: '#f43f5e',
  green: '#10b981',
  blue: '#3b82f6'
};

function StatCard({ title, value, icon, color, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderTop: `4px solid ${color || COLORS.teal}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        flex: 1,
        minWidth: 140
      }}
      onMouseOver={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: (color || COLORS.teal) + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
        }}>{icon}</div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.navy }}>{value}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

function QuickActionBtn({ icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: '#f8fafc',
        border: '1px solid #e2e8f0', borderRadius: 10,
        cursor: 'pointer', width: '100%', textAlign: 'left',
        fontSize: 14, fontWeight: 600, color: COLORS.navy,
        transition: 'all 0.2s'
      }}
      onMouseOver={e => { e.currentTarget.style.background = (color || COLORS.teal) + '15'; e.currentTarget.style.borderColor = color || COLORS.teal; }}
      onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } catch { return ts; }
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role || 'student').toLowerCase();

  const [studentsCount, setStudentsCount] = useState(null);
  const [facultyCount, setFacultyCount] = useState(null);
  const [coursesCount, setCoursesCount] = useState(null);
  const [avgFeedback, setAvgFeedback] = useState(null);
  const [feedbackCount, setFeedbackCount] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [notices, setNotices] = useState([]);
  const [noticeQuery, setNoticeQuery] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [showPost, setShowPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTarget, setPostTarget] = useState('ALL');
  const [posting, setPosting] = useState(false);

  const canPostNotice = ['faculty', 'management', 'admin'].includes(role);
  const isAdmin = role === 'admin' || role === 'management';
  const isFaculty = role === 'faculty';
  const isStudent = role === 'student';

  const teacherId = useMemo(() => {
    if (!user) return null;
    if (isFaculty) return user.user_id ?? user.id ?? null;
    return null;
  }, [user, isFaculty]);

  useEffect(() => {
    if (authLoading) return;
    loadStats();
    loadNotices();
    loadFeedback();
  }, [authLoading, teacherId]);

  async function loadStats() {
    setLoadingStats(true);
    try {
      // Students count
      try {
        const r = await api.get('/api/users', { params: { roles: 'student' } });
        const arr = Array.isArray(r.data) ? r.data : (r.data?.users || []);
        setStudentsCount(arr.length);
      } catch { setStudentsCount('—'); }

      // Faculty count
      try {
        const r = await api.get('/api/users', { params: { roles: 'faculty' } });
        const arr = Array.isArray(r.data) ? r.data : (r.data?.users || []);
        setFacultyCount(arr.length);
      } catch { setFacultyCount('—'); }

      // Courses count
      try {
        const r = await api.get('/api/courses');
        const arr = Array.isArray(r.data) ? r.data : (r.data?.courses || []);
        setCoursesCount(arr.length);
      } catch { setCoursesCount('—'); }

      // Feedback stats
      if (teacherId) {
        try {
          const r = await api.get('/api/feedback/summary', { params: { teacher_id: teacherId } });
          setAvgFeedback(r.data?.avg ? Number(r.data.avg).toFixed(1) : '—');
          setFeedbackCount(r.data?.count ?? '—');
        } catch { setAvgFeedback('—'); }
      } else if (isAdmin) {
        try {
          const r = await api.get('/api/feedback/all');
          const arr = r.data?.feedback || [];
          setFeedbackCount(arr.length);
          if (arr.length > 0) {
            const avg = arr.reduce((s, f) => s + (Number(f.score) || 0), 0) / arr.length;
            setAvgFeedback(avg.toFixed(1));
          }
        } catch { setAvgFeedback('—'); }
      } else {
        setAvgFeedback('—');
      }
    } finally {
      setLoadingStats(false);
    }
  }

  async function loadNotices() {
    try {
      const r = await api.get('/api/notices');
      const data = r.data?.notices || r.data?.rows || r.data || [];
      setNotices(Array.isArray(data) ? data : []);
    } catch { setNotices([]); }
  }

  async function loadFeedback() {
    try {
      if (teacherId) {
        const r = await api.get('/api/feedback', { params: { teacher_id: teacherId } });
        const arr = r.data?.feedback || [];
        setFeedbackList(arr.slice(0, 5));
      } else if (isAdmin) {
        const r = await api.get('/api/feedback/all');
        const arr = r.data?.feedback || [];
        setFeedbackList(arr.slice(0, 5));
      }
    } catch { setFeedbackList([]); }
  }

  async function postNotice(e) {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      alert('Title and content required'); return;
    }
    setPosting(true);
    try {
      await api.post('/api/notices', {
        title: postTitle,
        content: postContent,
        target_role: postTarget
      });
      setPostTitle(''); setPostContent(''); setPostTarget('ALL');
      setShowPost(false);
      loadNotices();
    } catch { alert('Failed to post notice'); }
    finally { setPosting(false); }
  }

  const filteredNotices = useMemo(() => {
    if (!noticeQuery.trim()) return notices;
    const q = noticeQuery.toLowerCase();
    return notices.filter(n =>
      ((n.title || '') + ' ' + (n.content || '')).toLowerCase().includes(q)
    );
  }, [notices, noticeQuery]);

  if (authLoading) return <div style={{ padding: 40 }}><Loading /></div>;

  // ---- STUDENT DASHBOARD ----
  const StudentDashboard = () => (
    <>
      {/* Stats */}
      <div style={styles.statsRow}>
        <StatCard title="Total Courses" value={loadingStats ? '...' : coursesCount} icon="📚" color={COLORS.teal} subtitle="Enrolled courses" onClick={() => navigate('/courses')} />
        <StatCard title="Faculty Members" value={loadingStats ? '...' : facultyCount} icon="👨‍🏫" color={COLORS.purple} subtitle="Available mentors" onClick={() => navigate('/recommendations')} />
        <StatCard title="Notices" value={notices.length} icon="📢" color={COLORS.amber} subtitle="Active announcements" />
        <StatCard title="Messages" value="—" icon="💬" color={COLORS.blue} subtitle="Check inbox" onClick={() => navigate('/messages')} />
      </div>

      <div style={styles.gridTwo}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <QuickActionBtn icon="🎯" label="Find a Mentor" onClick={() => navigate('/recommendations')} color={COLORS.teal} />
              <QuickActionBtn icon="💬" label="Submit Feedback" onClick={() => navigate('/feedback')} color={COLORS.purple} />
              <QuickActionBtn icon="📅" label="View Timetable" onClick={() => navigate('/timetable')} color={COLORS.amber} />
              <QuickActionBtn icon="📚" label="Browse Courses" onClick={() => navigate('/courses')} color={COLORS.blue} />
              <QuickActionBtn icon="💌" label="Send Message" onClick={() => navigate('/messages')} color={COLORS.green} />
              <QuickActionBtn icon="📊" label="View Rankings" onClick={() => navigate('/analytics')} color={COLORS.rose} />
            </div>
          </div>

          {/* My Courses */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📚 Available Courses</h3>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 12px 0' }}>
              Browse all courses available this semester
            </p>
            <button
              onClick={() => navigate('/courses')}
              style={styles.actionBtn}
            >
              View All Courses →
            </button>
          </div>
        </div>

        {/* Right Column — Notices */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardTitle, margin: 0 }}>📢 Notices</h3>
            <input
              placeholder="Filter notices..."
              value={noticeQuery}
              onChange={e => setNoticeQuery(e.target.value)}
              style={styles.filterInput}
            />
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {filteredNotices.length === 0 && (
              <div style={styles.emptyMsg}>No notices found.</div>
            )}
            {filteredNotices.map(n => (
              <div key={n.notice_id} style={styles.noticeItem}>
                <div style={styles.noticeTitle}>{n.title}</div>
                <div style={styles.noticeContent}>{n.content}</div>
                <div style={styles.noticeMeta}>
                  <span style={{
                    background: '#f0fffe', color: COLORS.teal,
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600
                  }}>
                    {n.target_role || 'ALL'}
                  </span>
                  <span>{formatTime(n.posted_on)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ---- FACULTY DASHBOARD ----
  const FacultyDashboard = () => (
    <>
      {/* Stats */}
      <div style={styles.statsRow}>
        <StatCard title="My Feedback" value={loadingStats ? '...' : (feedbackCount ?? '—')} icon="💬" color={COLORS.teal} subtitle="Total received" />
        <StatCard title="Avg Rating" value={loadingStats ? '...' : (avgFeedback ?? '—')} icon="⭐" color={COLORS.amber} subtitle="Out of 5.0" />
        <StatCard title="Courses" value={loadingStats ? '...' : coursesCount} icon="📚" color={COLORS.purple} subtitle="Total courses" onClick={() => navigate('/courses')} />
        <StatCard title="Students" value={loadingStats ? '...' : studentsCount} icon="🎓" color={COLORS.green} subtitle="Registered students" />
      </div>

      <div style={styles.gridTwo}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <QuickActionBtn icon="📢" label="Post a Notice" onClick={() => setShowPost(true)} color={COLORS.teal} />
              <QuickActionBtn icon="📅" label="Manage Timetable" onClick={() => navigate('/timetable')} color={COLORS.purple} />
              <QuickActionBtn icon="📚" label="View Courses" onClick={() => navigate('/courses')} color={COLORS.amber} />
              <QuickActionBtn icon="💌" label="Messages" onClick={() => navigate('/messages')} color={COLORS.blue} />
              <QuickActionBtn icon="📊" label="View Analytics" onClick={() => navigate('/analytics')} color={COLORS.green} />
            </div>
          </div>

          {/* Recent Feedback */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💬 Recent Feedback from Students</h3>
            {feedbackList.length === 0 ? (
              <div style={styles.emptyMsg}>No feedback received yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {feedbackList.map((f, i) => (
                  <div key={f.id || i} style={{
                    padding: 12, background: '#f8fafc', borderRadius: 10,
                    borderLeft: `3px solid ${COLORS.teal}`
                  }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= (f.score || 0) ? '#fbbf24' : '#e5e7eb', fontSize: 14 }}>★</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
                      "{f.comment || 'No comment'}"
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                      {formatTime(f.created_on)}
                      {f.sentiment && (
                        <span style={{
                          marginLeft: 8, padding: '2px 8px',
                          background: f.sentiment === 'Positive' ? '#d1fae5' : f.sentiment === 'Negative' ? '#fee2e2' : '#fef3c7',
                          color: f.sentiment === 'Positive' ? '#065f46' : f.sentiment === 'Negative' ? '#991b1b' : '#92400e',
                          borderRadius: 10, fontSize: 10, fontWeight: 600
                        }}>
                          {f.sentiment}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Notices */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardTitle, margin: 0 }}>📢 Notices</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Filter..."
                value={noticeQuery}
                onChange={e => setNoticeQuery(e.target.value)}
                style={styles.filterInput}
              />
              <button onClick={() => setShowPost(true)} style={styles.postBtn}>
                + Post
              </button>
            </div>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {filteredNotices.length === 0 && <div style={styles.emptyMsg}>No notices found.</div>}
            {filteredNotices.map(n => (
              <div key={n.notice_id} style={styles.noticeItem}>
                <div style={styles.noticeTitle}>{n.title}</div>
                <div style={styles.noticeContent}>{n.content}</div>
                <div style={styles.noticeMeta}>
                  <span style={{
                    background: '#f0fffe', color: COLORS.teal,
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600
                  }}>
                    {n.target_role || 'ALL'}
                  </span>
                  <span>{formatTime(n.posted_on)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ---- ADMIN DASHBOARD ----
  const AdminDashboard = () => (
    <>
      {/* Stats */}
      <div style={styles.statsRow}>
        <StatCard title="Total Students" value={loadingStats ? '...' : studentsCount} icon="🎓" color={COLORS.teal} subtitle="Registered users" onClick={() => navigate('/student-management')} />
        <StatCard title="Total Faculty" value={loadingStats ? '...' : facultyCount} icon="👨‍🏫" color={COLORS.purple} subtitle="Active faculty" onClick={() => navigate('/faculty-management')} />
        <StatCard title="Total Courses" value={loadingStats ? '...' : coursesCount} icon="📚" color={COLORS.amber} subtitle="Available courses" onClick={() => navigate('/courses')} />
        <StatCard title="Total Feedback" value={loadingStats ? '...' : (feedbackCount ?? '—')} icon="💬" color={COLORS.green} subtitle={`Avg: ${avgFeedback ?? '—'}/5`} onClick={() => navigate('/faculty-management')} />
      </div>

      <div style={styles.gridThree}>
        {/* Quick Actions */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <QuickActionBtn icon="📢" label="Post Notice" onClick={() => setShowPost(true)} color={COLORS.teal} />
            <QuickActionBtn icon="🎓" label="Manage Students" onClick={() => navigate('/student-management')} color={COLORS.purple} />
            <QuickActionBtn icon="👨‍🏫" label="Manage Faculty" onClick={() => navigate('/faculty-management')} color={COLORS.amber} />
            <QuickActionBtn icon="📚" label="Add Course" onClick={() => navigate('/courses')} color={COLORS.blue} />
            <QuickActionBtn icon="📊" label="View Analytics" onClick={() => navigate('/analytics')} color={COLORS.green} />
            <QuickActionBtn icon="📅" label="Timetable" onClick={() => navigate('/timetable')} color={COLORS.rose} />
          </div>
        </div>

        {/* Recent Feedback */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💬 Recent Feedback</h3>
          {feedbackList.length === 0 ? (
            <div style={styles.emptyMsg}>No feedback yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {feedbackList.map((f, i) => (
                <div key={f.id || i} style={{
                  padding: 12, background: '#f8fafc', borderRadius: 10,
                  borderLeft: `3px solid ${f.sentiment === 'Positive' ? COLORS.green : f.sentiment === 'Negative' ? COLORS.rose : COLORS.amber}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= (f.score || 0) ? '#fbbf24' : '#e5e7eb', fontSize: 13 }}>★</span>
                      ))}
                    </div>
                    {f.sentiment && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                        background: f.sentiment === 'Positive' ? '#d1fae5' : f.sentiment === 'Negative' ? '#fee2e2' : '#fef3c7',
                        color: f.sentiment === 'Positive' ? '#065f46' : f.sentiment === 'Negative' ? '#991b1b' : '#92400e'
                      }}>
                        {f.sentiment}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', marginBottom: 6 }}>
                    "{f.comment || 'No comment'}"
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    To: <strong>{f.receiver_name || f.faculty_name || 'Faculty'}</strong> • {formatTime(f.created_on)}
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/faculty-management')} style={styles.actionBtn}>
                View All Feedback →
              </button>
            </div>
          )}
        </div>

        {/* Notices */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardTitle, margin: 0 }}>📢 Notices</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Filter..."
                value={noticeQuery}
                onChange={e => setNoticeQuery(e.target.value)}
                style={styles.filterInput}
              />
              <button onClick={() => setShowPost(true)} style={styles.postBtn}>+ Post</button>
            </div>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {filteredNotices.length === 0 && <div style={styles.emptyMsg}>No notices found.</div>}
            {filteredNotices.map(n => (
              <div key={n.notice_id} style={styles.noticeItem}>
                <div style={styles.noticeTitle}>{n.title}</div>
                <div style={styles.noticeContent}>{n.content}</div>
                <div style={styles.noticeMeta}>
                  <span style={{
                    background: '#f0fffe', color: COLORS.teal,
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600
                  }}>
                    {n.target_role || 'ALL'}
                  </span>
                  <span>{formatTime(n.posted_on)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {isAdmin ? '🏛️' : isFaculty ? '👨‍🏫' : '🎓'} Dashboard
          </h1>
          <p style={styles.subtitle}>
            Welcome back, <strong>{user?.display_name || user?.email || 'User'}</strong>!
            {isAdmin && ' You have full admin access.'}
            {isFaculty && ' Manage your courses and view student feedback.'}
            {isStudent && ' Track your academic progress and stay updated.'}
          </p>
        </div>
        <div style={{
          padding: '8px 16px', background: COLORS.navy,
          color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600,
          textTransform: 'capitalize'
        }}>
          {role} Portal
        </div>
      </div>

      {/* Role based dashboard */}
      {isStudent && <StudentDashboard />}
      {isFaculty && <FacultyDashboard />}
      {isAdmin && <AdminDashboard />}

      {/* Post Notice Modal */}
      {showPost && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ margin: '0 0 20px 0', color: COLORS.navy }}>📢 Post New Notice</h3>
            <form onSubmit={postNotice}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  style={styles.input}
                  placeholder="Notice title"
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Content *</label>
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
                  placeholder="Write your notice here..."
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Target Audience</label>
                <select
                  value={postTarget}
                  onChange={e => setPostTarget(e.target.value)}
                  style={styles.input}
                >
                  <option value="ALL">Everyone</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                  <option value="MANAGEMENT">Management Only</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowPost(false)}
                  style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  style={{ padding: '10px 24px', background: COLORS.teal, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: posting ? 0.7 : 1 }}
                >
                  {posting ? 'Posting...' : '📢 Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 28, background: '#f8fafc', minHeight: '100vh' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28,
    flexWrap: 'wrap', gap: 12
  },
  title: { fontSize: 28, fontWeight: 700, color: '#0f2a3d', margin: '0 0 6px 0' },
  subtitle: { color: '#64748b', fontSize: 14, margin: 0 },
  statsRow: {
    display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap'
  },
  gridTwo: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20
  },
  gridThree: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20
  },
  card: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  cardTitle: {
    fontSize: 15, fontWeight: 700, color: '#0f2a3d',
    margin: '0 0 16px 0'
  },
  noticeItem: {
    padding: '12px 0', borderBottom: '1px solid #f1f5f9'
  },
  noticeTitle: { fontWeight: 700, fontSize: 14, color: '#0f2a3d', marginBottom: 4 },
  noticeContent: { fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 6 },
  noticeMeta: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, color: '#94a3b8', alignItems: 'center'
  },
  filterInput: {
    padding: '7px 10px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', width: 120
  },
  postBtn: {
    padding: '7px 12px', background: '#2dd4bf', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 600,
    fontSize: 13, cursor: 'pointer'
  },
  actionBtn: {
    padding: '10px 16px', background: '#f0fffe',
    color: '#2dd4bf', border: '1px solid #2dd4bf',
    borderRadius: 8, fontWeight: 600, fontSize: 13,
    cursor: 'pointer', width: '100%', marginTop: 8
  },
  emptyMsg: { color: '#94a3b8', textAlign: 'center', padding: '20px 0', fontSize: 14 },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 32,
    width: '100%', maxWidth: 520,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 600, color: '#0f2a3d' },
  input: {
    padding: '12px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 14,
    outline: 'none', width: '100%', boxSizing: 'border-box'
  },
};