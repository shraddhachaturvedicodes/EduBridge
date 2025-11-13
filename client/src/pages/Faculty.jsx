// src/pages/Faculty.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/**
 * Simple modal component (no external libs)
 */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(2,6,23,0.6)"
    }}>
      <div style={{
        width: 720, maxWidth: "95%", borderRadius: 12, background: "#fff",
        boxShadow: "0 12px 50px rgba(2,6,23,0.3)", overflow: "hidden"
      }}>
        <div style={{ padding: 16, borderBottom: "1px solid #eef2f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Faculty() {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal state & form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department: "",
    designation: "",
    email: "",
    status: "Available"
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchFaculty();
    // eslint-disable-next-line
  }, []);

  async function fetchFaculty() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/faculty`);
      setList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch faculty", err);
      setError(err?.response?.data?.message || err.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setForm({ name: "", department: "", designation: "", email: "", status: "Available" });
    setFormError("");
    setIsModalOpen(true);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!form.name.trim()) return "Name is required";
    if (!form.department.trim()) return "Department is required";
    if (!form.email.trim()) return "Email is required";
    // simple email check
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address";
    return null;
  }

  async function handleAdd(e) {
  e.preventDefault();
  setFormError("");
  const v = validateForm();
  if (v) {
    setFormError(v);
    return;
  }

  // --- Client-side uniqueness check ---
  try {
    const emailLower = form.email.trim().toLowerCase();
    if (Array.isArray(list) && list.some(f => (f.email || f.email_address || '').toLowerCase() === emailLower)) {
      setFormError("A faculty member with this email already exists.");
      return;
    }
  } catch (errCheck) {
    // If something odd happens here, we continue and let server validate
    console.warn('Uniqueness check failed, continuing to POST', errCheck);
  }

  setSubmitting(true);
  try {
    const payload = {
      name: form.name.trim(),
      dept: form.department.trim(),
      designation: form.designation.trim(),
      email: form.email.trim(),
      status: form.status
    };
    const res = await axios.post(`${API_BASE}/api/faculty`, payload);
    const created = res.data;
    if (created && (Array.isArray(list) || list === null)) {
      setList(prev => (Array.isArray(prev) ? [created, ...prev] : [created]));
    } else {
      await fetchFaculty();
    }
    setIsModalOpen(false);
  } catch (err) {
    console.error("Add faculty failed", err);
    // show detailed server error (if available)
    const serverMsg = err?.response?.data
      ? (typeof err.response.data === 'string' ? err.response.data : (err.response.data.error || JSON.stringify(err.response.data)))
      : (err.message || 'Add failed');
    setFormError(serverMsg);
    alert('Add failed: ' + serverMsg);
  } finally {
    setSubmitting(false);
  }
}


  async function handleDelete(id) {
    if (!window.confirm("Delete this faculty member?")) return;
    try {
      await axios.delete(`${API_BASE}/api/faculty/${id}`);
      setList(prev => prev.filter(x => (x.id ?? x.faculty_id ?? x.facultyId) !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed: " + (err?.response?.data?.message || err.message));
    }
  }

  async function toggleAvailability(record) {
  const id = record.faculty_id ?? record.id ?? record.facultyId;
  if (!id) {
    alert('Cannot determine faculty id for update.');
    return;
  }
  const current = record.availability_status ?? record.status ?? record.availability ?? 'Unknown';
  const newStatus = current === 'Available' ? 'Unavailable' : 'Available';
  try {
    // PUT to server's new update route
    const payload = { availability_status: newStatus };
    const res = await axios.put(`${API_BASE}/api/faculty/${id}`, payload);
    // update local list with returned row if possible
    setList(prev => prev.map(r => {
      const rid = r.faculty_id ?? r.id ?? r.facultyId;
      if (rid === id) return res.data || { ...r, availability_status: newStatus };
      return r;
    }));
  } catch (err) {
    console.error('Update failed', err);
    const serverMsg = err?.response?.data?.error || err?.message || 'Update failed';
    alert('Update failed: ' + serverMsg);
  }
}


  return (
    <div style={{ paddingBottom: 40 }}>
      <h2 style={{ marginBottom: 12 }}>Faculty Management</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="small-muted">List of faculty members (fetched from backend)</div>
          <div>
            <button className="btn" onClick={fetchFaculty} style={{ marginRight: 8 }}>Refresh</button>
            <button className="btn" onClick={openAddModal} style={{ background: "#06b6d4", color: "#fff" }}>Add Faculty</button>
          </div>
        </div>

        {loading && <div>Loading faculty...</div>}
        {error && <div style={{ color: "red" }}>Error: {error}</div>}

        {!loading && !error && (Array.isArray(list) && list.length === 0) && (
          <div>No faculty records found.</div>
        )}

        {!loading && !error && Array.isArray(list) && list.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#6b7280" }}>
                  <th style={{ padding: "10px 8px" }}>ID</th>
                  <th style={{ padding: "10px 8px" }}>Name</th>
                  <th style={{ padding: "10px 8px" }}>Department</th>
                  <th style={{ padding: "10px 8px" }}>Designation</th>
                  <th style={{ padding: "10px 8px" }}>Email</th>
                  <th style={{ padding: "10px 8px" }}>Status</th>
                  <th style={{ padding: "10px 8px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((f, idx) => {
                  const id = f.id ?? f.faculty_id ?? f.facultyId ?? idx;
                  return (
                    <tr key={id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 8px" }}>{id}</td>
                      <td style={{ padding: "10px 8px" }}>{f.name || f.full_name || f.faculty_name}</td>
                      <td style={{ padding: "10px 8px" }}>{f.dept || f.department}</td>
                      <td style={{ padding: "10px 8px" }}>{f.designation || "-"}</td>
                      <td style={{ padding: "10px 8px" }}>{f.email || "-"}</td>
                      <td style={{ padding: '10px 8px' }}>{f.availability_status ?? f.status ?? f.availability ?? 'Unknown'}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <button className="btn" onClick={() => toggleAvailability(f)} style={{ marginRight: 8 }}>Toggle Status</button>
                        <button className="btn" onClick={() => handleDelete(id)} style={{ background: "#ef4444", color: "#fff" }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add Faculty */}
      <Modal open={isModalOpen} title="Add New Faculty" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleAdd} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label className="small-muted">Name *</label>
              <input name="name" value={form.name} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }} />
            </div>
            <div>
              <label className="small-muted">Department *</label>
              <input name="department" value={form.department} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label className="small-muted">Designation</label>
              <input name="designation" value={form.designation} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }} />
            </div>
            <div>
              <label className="small-muted">Email *</label>
              <input name="email" value={form.email} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }} />
            </div>
          </div>

          <div>
            <label className="small-muted">Status</label>
            <select name="status" value={form.status} onChange={onChange} style={{ width: "160px", padding: 8, marginTop: 6 }}>
              <option>Available</option>
              <option>Unavailable</option>
            </select>
          </div>

          {formError && <div style={{ color: "red" }}>{formError}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn" style={{ background: "#06b6d4", color: "#fff" }} disabled={submitting}>
              {submitting ? "Adding..." : "Add Faculty"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
