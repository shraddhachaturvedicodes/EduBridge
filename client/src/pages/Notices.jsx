// client/src/pages/Notices.jsx
import React, { useEffect, useState } from 'react';
import api from '../axiosInstance';
import { useAuth } from '../context/AuthContext';

function NoticeRow({ n, onDelete, canDelete }) {
  return (
    <div style={{
      padding: 12, borderBottom: '1px solid #eee', background: '#fff', marginBottom: 8, borderRadius: 6
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700 }}>{n.title}</div>
        <div style={{ color: '#888', fontSize: 12 }}>{new Date(n.posted_on).toLocaleString()}</div>
      </div>
      <div style={{ marginTop: 8, color: '#333' }}>{n.content}</div>
      <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>Target: {n.target_role}</div>
      {canDelete && <div style={{ marginTop: 8 }}><button onClick={() => onDelete(n.notice_id)}>Delete</button></div>}
    </div>
  );
}

export default function Notices() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [busy, setBusy] = useState(false);

  const canPost = user && ['faculty', 'admin', 'management'].includes((user.role || '').toLowerCase());
  const canDelete = user && (user.role || '').toLowerCase() === 'admin';

  async function load() {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/api/notices?limit=100');
      setList(r.data.notices || []);
    } catch (err) {
      console.error('Failed to load notices', err);
      setError('Failed to load notices');
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handlePost(e) {
    e.preventDefault();
    if (!title || !content) return alert('Title and content required');
    setBusy(true);
    try {
      const r = await api.post('/api/notices', { title, content, target_role: targetRole });
      // prepend
      setList(prev => [r.data, ...prev]);
      setTitle(''); setContent(''); setTargetRole('ALL');
    } catch (err) {
      console.error('Post failed', err);
      alert(err.response?.data?.error || 'Failed to create notice');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.delete(`/api/notices/${id}`);
      setList(prev => prev.filter(p => p.notice_id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert(err.response?.data?.error || 'Failed to delete');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 12 }}>
      <h2>Notice Board</h2>

      {canPost && (
        <div style={{ marginBottom: 16, padding: 12, border: '1px solid #e6e6e6', borderRadius: 8, background: '#fafafa' }}>
          <h4 style={{ marginTop: 0 }}>Create Notice</h4>
          <form onSubmit={handlePost}>
            <div style={{ marginBottom: 8 }}>
              <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', padding: 8 }} rows={4} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Target role:&nbsp;</label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                <option value="ALL">ALL</option>
                <option value="STUDENTS">STUDENTS</option>
                <option value="FACULTY">FACULTY</option>
                <option value="MANAGEMENT">MANAGEMENT</option>
              </select>
            </div>
            <div>
              <button type="submit" disabled={busy}>{busy ? 'Posting...' : 'Post Notice'}</button>
            </div>
          </form>
        </div>
      )}

      <div>
        {loading && <div>Loading notices...</div>}
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {!loading && list.length === 0 && <div style={{ color: '#666' }}>No notices available.</div>}
        <div>
          {list.map(n => (
            <NoticeRow key={n.notice_id} n={n} onDelete={handleDelete} canDelete={canDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
