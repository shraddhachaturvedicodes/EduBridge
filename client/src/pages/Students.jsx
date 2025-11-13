// src/pages/Students.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

/* Simple Modal reused locally */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(2,6,23,0.5)'
    }}>
      <div style={{
        width: 760, maxWidth: '95%', borderRadius: 12, background: '#fff',
        boxShadow: '0 12px 50px rgba(2,6,23,0.25)', overflow: 'hidden'
      }}>
        <div style={{ padding: 14, borderBottom: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    major: '',
    enrollment_year: new Date().getFullYear(),
    interest_areas: '' // comma-separated string
  });
  const [formError, setFormError] = useState('');

  // edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/students`);
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
      setError(err?.response?.data?.error || err.message || 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }

  function onFormChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validateStudentForm(data) {
    if (!data.name || !data.name.trim()) return 'Name is required';
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email.trim())) return 'Valid email is required';
    return null;
  }

  async function handleAdd(e) {
    e && e.preventDefault && e.preventDefault();
    setFormError('');
    const v = validateStudentForm(form);
    if (v) { setFormError(v); return; }

    // simple duplication prevention (client-side)
    try {
      const emailLower = (form.email || '').trim().toLowerCase();
      if (Array.isArray(students) && students.some(s => (s.email || '').toLowerCase() === emailLower)) {
        setFormError('A student with this email already exists.');
        return;
      }
    } catch (err) {
      console.warn('Dup check failed, continuing to POST', err);
    }

    setAddLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        major: form.major.trim() || null,
        enrollment_year: form.enrollment_year || null,
        interest_areas: form.interest_areas ? form.interest_areas.split(',').map(x => x.trim()).filter(Boolean) : null
      };
      const res = await axios.post(`${API_BASE}/api/students`, payload);
      const created = res.data;
      if (created) {
        setStudents(prev => Array.isArray(prev) ? [created, ...prev] : [created]);
      } else {
        await fetchStudents();
      }
      setIsAddOpen(false);
    } catch (err) {
      console.error('Add student failed', err);
      const msg = err?.response?.data?.error || err?.message || 'Add failed';
      setFormError(msg);
      alert('Add failed: ' + msg);
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`${API_BASE}/api/students/${id}`);
      setStudents(prev => prev.filter(s => (s.student_id ?? s.id) !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed: ' + (err?.response?.data?.error || err.message));
    }
  }

  // open edit modal and prefill
  function openEdit(record) {
    setEditRecord(record);
    setIsEditOpen(true);
  }

  function onEditChange(e) {
    const { name, value } = e.target;
    setEditRecord(prev => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!editRecord) return;
    const v = validateStudentForm(editRecord);
    if (v) { setFormError(v); return; }

    setEditLoading(true);
    try {
      // If your server supports PUT /api/students/:id (see optional backend route), this will update
      const id = editRecord.student_id ?? editRecord.id;
      const payload = {
        name: editRecord.name,
        email: editRecord.email,
        major: editRecord.major,
        enrollment_year: editRecord.enrollment_year,
        interest_areas: Array.isArray(editRecord.interest_areas) ? editRecord.interest_areas : (typeof editRecord.interest_areas === 'string' ? editRecord.interest_areas.split(',').map(x => x.trim()).filter(Boolean) : null)
      };
      const res = await axios.put(`${API_BASE}/api/students/${id}`, payload);
      const updated = res.data;
      if (updated) {
        setStudents(prev => prev.map(s => ((s.student_id ?? s.id) === id ? updated : s)));
      } else {
        await fetchStudents();
      }
      setIsEditOpen(false);
      setEditRecord(null);
    } catch (err) {
      console.error('Edit failed', err);
      const msg = err?.response?.data?.error || err?.message || 'Edit failed';
      setFormError(msg);
      alert('Update failed: ' + msg);
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <h2 style={{ marginBottom: 12 }}>Student Management</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="small-muted">Students registered in the system</div>
          <div>
            <button className="btn" onClick={fetchStudents} style={{ marginRight: 8 }}>Refresh</button>
            <button className="btn" onClick={() => setIsAddOpen(true)} style={{ background: '#06b6d4', color: '#fff' }}>Add Student</button>
          </div>
        </div>

        {loading && <div>Loading students...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}

        {!loading && !error && Array.isArray(students) && students.length === 0 && <div>No students found.</div>}

        {!loading && !error && Array.isArray(students) && students.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                  <th style={{ padding: '10px 8px' }}>ID</th>
                  <th style={{ padding: '10px 8px' }}>Name</th>
                  <th style={{ padding: '10px 8px' }}>Email</th>
                  <th style={{ padding: '10px 8px' }}>Major</th>
                  <th style={{ padding: '10px 8px' }}>Enrolled</th>
                  <th style={{ padding: '10px 8px' }}>Interests</th>
                  <th style={{ padding: '10px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const id = s.student_id ?? s.id ?? i;
                  const interests = Array.isArray(s.interest_areas) ? s.interest_areas.join(', ') : (s.interest_areas || '-');
                  return (
                    <tr key={id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px' }}>{id}</td>
                      <td style={{ padding: '10px 8px' }}>{s.name}</td>
                      <td style={{ padding: '10px 8px' }}>{s.email}</td>
                      <td style={{ padding: '10px 8px' }}>{s.major || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{s.enrollment_year || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>{interests}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <button className="btn" onClick={() => openEdit(s)} style={{ marginRight: 8 }}>Edit</button>
                        <button className="btn" onClick={() => handleDelete(id)} style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={isAddOpen} title="Add New Student" onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label className="small-muted">Name *</label>
              <input name="name" value={form.name} onChange={onFormChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
            </div>
            <div>
              <label className="small-muted">Email *</label>
              <input name="email" value={form.email} onChange={onFormChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label className="small-muted">Major</label>
              <input name="major" value={form.major} onChange={onFormChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
            </div>
            <div>
              <label className="small-muted">Enrollment Year</label>
              <input name="enrollment_year" value={form.enrollment_year} onChange={onFormChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
            </div>
          </div>

          <div>
            <label className="small-muted">Interest Areas (comma separated)</label>
            <input name="interest_areas" value={form.interest_areas} onChange={onFormChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
          </div>

          {formError && <div style={{ color: 'red' }}>{formError}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn" onClick={() => setIsAddOpen(false)}>Cancel</button>
            <button type="submit" className="btn" style={{ background: '#06b6d4', color: '#fff' }} disabled={addLoading}>
              {addLoading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={isEditOpen} title="Edit Student" onClose={() => { setIsEditOpen(false); setEditRecord(null); setFormError(''); }}>
        {editRecord ? (
          <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="small-muted">Name *</label>
                <input name="name" value={editRecord.name || ''} onChange={onEditChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
              <div>
                <label className="small-muted">Email *</label>
                <input name="email" value={editRecord.email || ''} onChange={onEditChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="small-muted">Major</label>
                <input name="major" value={editRecord.major || ''} onChange={onEditChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
              <div>
                <label className="small-muted">Enrollment Year</label>
                <input name="enrollment_year" value={editRecord.enrollment_year || ''} onChange={onEditChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
              </div>
            </div>

            <div>
              <label className="small-muted">Interest Areas (comma separated)</label>
              <input name="interest_areas" value={Array.isArray(editRecord.interest_areas) ? editRecord.interest_areas.join(', ') : (editRecord.interest_areas || '')} onChange={onEditChange} style={{ width: '100%', padding: 8, marginTop: 6 }} />
            </div>

            {formError && <div style={{ color: 'red' }}>{formError}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn" onClick={() => { setIsEditOpen(false); setEditRecord(null); }}>Cancel</button>
              <button type="submit" className="btn" style={{ background: '#06b6d4', color: '#fff' }} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : <div>Loading...</div>}
      </Modal>
    </div>
  );
}
