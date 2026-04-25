// client/src/pages/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/users');
      // Handle both array and {users: [...]} format
      const allUsers = Array.isArray(res.data)
        ? res.data
        : (res.data?.users || []);
      const studentUsers = allUsers.filter(u => u.role === 'student');
      setStudents(studentUsers);
    } catch (err) {
      setError('Failed to load students. ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(s =>
    !search ||
    s.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  function getInitial(name, email) {
    return (name || email || 'S').charAt(0).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎓 Student Management</h1>
          <p style={styles.subtitle}>All students registered in the EduBridge portal</p>
        </div>
        <div style={styles.statBadge}>{students.length} Total Students</div>
      </div>

      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div style={styles.centered}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎓</div>
          <div style={{ color: '#64748b' }}>Loading students...</div>
        </div>
      )}

      {!loading && error && (
        <div style={styles.errorBox}>{error}</div>
      )}

      {!loading && !error && students.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>📭</div>
          <h3 style={{ color: '#0f2a3d', marginBottom: 8 }}>No Students Yet</h3>
          <p style={{ color: '#64748b' }}>
            Students will appear here once they sign up on EduBridge.
          </p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{students.length}</div>
            <div style={styles.statLabel}>Total Registered</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {students.filter(s => {
                const d = new Date(s.created_on);
                const now = new Date();
                return (now - d) < 7 * 24 * 60 * 60 * 1000;
              }).length}
            </div>
            <div style={styles.statLabel}>Joined This Week</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>
              {students.filter(s => {
                const d = new Date(s.created_on);
                const now = new Date();
                return d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div style={styles.statLabel}>Joined This Month</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{filtered.length}</div>
            <div style={styles.statLabel}>Search Results</div>
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: '#0f2a3d' }}>
                <th style={{ ...styles.th, textAlign: 'left' }}>#</th>
                <th style={{ ...styles.th, textAlign: 'left' }}>Student</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined On</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.user_id} style={{
                  background: i % 2 === 0 ? '#f8fafc' : '#fff'
                }}>
                  <td style={{ ...styles.td, color: '#94a3b8', fontSize: 13 }}>{i + 1}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0
                      }}>
                        {getInitial(s.display_name, s.email)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f2a3d', fontSize: 14 }}>
                          {s.display_name || 'N/A'}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: {s.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', color: '#475569', fontSize: 13 }}>
                    {s.email}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px', background: '#f0fffe',
                      color: '#2dd4bf', borderRadius: 20, fontSize: 12,
                      fontWeight: 700, textTransform: 'capitalize'
                    }}>
                      {s.role}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                    {formatDate(s.created_on)}
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

      {!loading && students.length > 0 && filtered.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ color: '#64748b' }}>No students match your search.</p>
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
  searchBox: { marginBottom: 20 },
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
    borderTop: '4px solid #2dd4bf'
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