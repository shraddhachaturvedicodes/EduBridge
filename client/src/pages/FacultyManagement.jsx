// client/src/pages/FacultyManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('faculty');

  useEffect(() => {
    fetchFaculty();
    fetchFeedback();
  }, []);

  async function fetchFaculty() {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      // Handle both array and {users: [...]} format
      const allUsers = Array.isArray(res.data)
        ? res.data
        : (res.data?.users || []);
      const facultyUsers = allUsers.filter(u => u.role === 'faculty');
      setFaculty(facultyUsers);
    } catch (err) {
      setError('Failed to load faculty. ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeedback() {
    try {
      const res = await api.get('/api/feedback/all');
      const data = res.data?.feedback || [];
      setFeedback(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Feedback fetch error:', err);
    }
  }

  const filtered = faculty.filter(f =>
    !search ||
    f.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  function getInitial(name, email) {
    return (name || email || 'F').charAt(0).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  function getSentimentColor(sentiment) {
    if (!sentiment) return '#64748b';
    const s = sentiment.toLowerCase();
    if (s === 'positive') return '#10b981';
    if (s === 'negative') return '#ef4444';
    return '#f59e0b';
  }

  const tabs = [
    { id: 'faculty', label: '👥 Faculty List' },
    { id: 'feedback', label: '📊 All Feedback' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Faculty Management</h1>
          <p style={styles.subtitle}>Manage faculty members and view all student feedback</p>
        </div>
        <div style={styles.statBadge}>{faculty.length} Faculty Members</div>
      </div>

      <div style={styles.tabRow}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FACULTY LIST TAB */}
      {activeTab === 'faculty' && (
        <>
          <div style={{ marginBottom: 20 }}>
            <input
              style={styles.searchInput}
              placeholder="🔍 Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {!loading && faculty.length > 0 && (
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{faculty.length}</div>
                <div style={styles.statLabel}>Total Faculty</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>
                  {faculty.filter(f => {
                    const d = new Date(f.created_on);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() &&
                      d.getFullYear() === now.getFullYear();
                  }).length}
                </div>
                <div style={styles.statLabel}>Joined This Month</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{feedback.length}</div>
                <div style={styles.statLabel}>Total Feedback</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{filtered.length}</div>
                <div style={styles.statLabel}>Search Results</div>
              </div>
            </div>
          )}

          {loading && (
            <div style={styles.centered}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              <div style={{ color: '#64748b' }}>Loading faculty...</div>
            </div>
          )}

          {!loading && error && (
            <div style={styles.errorBox}>{error}</div>
          )}

          {!loading && faculty.length === 0 && (
            <div style={styles.emptyBox}>
              <div style={{ fontSize: 50, marginBottom: 12 }}>👨‍🏫</div>
              <h3 style={{ color: '#0f2a3d', marginBottom: 8 }}>No Faculty Yet</h3>
              <p style={{ color: '#64748b' }}>
                Faculty members will appear here once they sign up on EduBridge.
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={styles.tableBox}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: '#0f2a3d' }}>
                    <th style={{ ...styles.th, textAlign: 'left' }}>#</th>
                    <th style={{ ...styles.th, textAlign: 'left' }}>Faculty Member</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Joined On</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f, i) => (
                    <tr key={f.user_id} style={{
                      background: i % 2 === 0 ? '#f8fafc' : '#fff'
                    }}>
                      <td style={{ ...styles.td, color: '#94a3b8', fontSize: 13 }}>{i + 1}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0
                          }}>
                            {getInitial(f.display_name, f.email)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f2a3d', fontSize: 14 }}>
                              {f.display_name || 'N/A'}
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: {f.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center', color: '#475569', fontSize: 13 }}>
                        {f.email}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px', background: '#ede9fe',
                          color: '#6366f1', borderRadius: 20, fontSize: 12,
                          fontWeight: 700, textTransform: 'capitalize'
                        }}>
                          {f.role}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                        {formatDate(f.created_on)}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px', background: '#f0fff8',
                          color: '#10b981', borderRadius: 20, fontSize: 12, fontWeight: 700
                        }}>
                          ✅ Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div>
          {feedback.length === 0 ? (
            <div style={styles.emptyBox}>
              <div style={{ fontSize: 50, marginBottom: 12 }}>📭</div>
              <h3 style={{ color: '#0f2a3d', marginBottom: 8 }}>No Feedback Yet</h3>
              <p style={{ color: '#64748b' }}>Student feedback will appear here once submitted.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {feedback.map((f, i) => (
                <div key={f.id || i} style={{
                  background: '#fff', borderRadius: 12, padding: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${getSentimentColor(f.sentiment)}`
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 12,
                    flexWrap: 'wrap', gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{
                          fontSize: 18,
                          color: star <= (f.score || 0) ? '#fbbf24' : '#e5e7eb'
                        }}>★</span>
                      ))}
                      <span style={{ fontWeight: 700, color: '#0f2a3d', fontSize: 14 }}>
                        {f.score}/5
                      </span>
                    </div>
                    {f.sentiment && (
                      <span style={{
                        padding: '4px 12px',
                        background: getSentimentColor(f.sentiment) + '20',
                        color: getSentimentColor(f.sentiment),
                        borderRadius: 20, fontSize: 12, fontWeight: 700
                      }}>
                        {f.sentiment}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 14, color: '#475569', lineHeight: 1.7,
                    marginBottom: 12, fontStyle: 'italic'
                  }}>
                    "{f.comment || 'No comment provided'}"
                  </p>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: '#94a3b8', flexWrap: 'wrap', gap: 8
                  }}>
                    <span>To: <strong>{f.receiver_name || 'Faculty'}</strong></span>
                    <span>{formatDate(f.created_on)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 28, background: '#f8fafc', minHeight: '100vh' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12
  },
  title: { fontSize: 28, fontWeight: 700, color: '#0f2a3d', margin: '0 0 6px 0' },
  subtitle: { color: '#64748b', fontSize: 14, margin: 0 },
  statBadge: {
    padding: '10px 20px', background: '#0f2a3d',
    color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600
  },
  tabRow: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: {
    padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer'
  },
  tabActive: { background: '#2dd4bf', color: '#fff', border: '1px solid #2dd4bf' },
  searchInput: {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
    background: '#fff', boxSizing: 'border-box',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12, marginBottom: 20
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: 16,
    textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderTop: '4px solid #6366f1'
  },
  statNum: { fontSize: 28, fontWeight: 700, color: '#0f2a3d' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 },
  tableBox: {
    background: '#fff', borderRadius: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '14px 16px', color: '#fff', fontWeight: 600, fontSize: 13, textAlign: 'center' },
  td: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
  centered: { textAlign: 'center', padding: '60px 20px' },
  errorBox: {
    background: '#fee2e2', color: '#dc2626',
    padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16
  },
  emptyBox: {
    textAlign: 'center', padding: '60px 20px',
    background: '#fff', borderRadius: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
};