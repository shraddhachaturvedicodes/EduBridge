// src/pages/Feedback.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Feedback() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [form, setForm] = useState({
    student_id: "",
    faculty_id: "",
    text_content: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sentimentResult, setSentimentResult] = useState(null);

  useEffect(() => {
    fetchAllLists();
    fetchRecent();
  }, []);

  async function fetchAllLists() {
    setLoadingLists(true);
    try {
      const [sRes, fRes] = await Promise.all([
        axios.get(`${API_BASE}/api/students`),
        axios.get(`${API_BASE}/api/faculty`)
      ]);
      setStudents(Array.isArray(sRes.data) ? sRes.data : []);
      setFaculty(Array.isArray(fRes.data) ? fRes.data : []);
    } catch (err) {
      console.error("Failed to load lists:", err);
      // still allow page to render; individual endpoints may be down
    } finally {
      setLoadingLists(false);
    }
  }

  async function fetchRecent() {
    try {
      const res = await axios.get(`${API_BASE}/api/feedback`);
      setRecent(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load recent feedback:", err);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.student_id) return "Select a student";
    if (!form.faculty_id) return "Select a faculty";
    if (!form.text_content || !form.text_content.trim()) return "Enter feedback text";
    return null;
  }

  async function handleSubmit(e) {
    e && e.preventDefault && e.preventDefault();
    setSubmitError("");
    setSentimentResult(null);

    const v = validate();
    if (v) { setSubmitError(v); return; }

    setSubmitting(true);
    try {
      // send to backend
      const payload = {
        student_id: Number(form.student_id),
        faculty_id: Number(form.faculty_id),
        text_content: form.text_content.trim()
      };
      const res = await axios.post(`${API_BASE}/api/feedback`, payload, { timeout: 120000 }); // python may take a moment
      // expect created feedback object with 'sentiment' (server returns created row)
      const created = res.data;
      setSentimentResult(created?.sentiment ?? "Unknown");
      // add to recent list on top
      setRecent(prev => (Array.isArray(prev) ? [created, ...prev] : [created]));
      // clear text only (keep student/faculty selection for convenience)
      setForm(prev => ({ ...prev, text_content: "" }));
    } catch (err) {
      console.error("Submit feedback failed:", err);
      // Prefer structured server message if present
      const serverMsg = err?.response?.data?.error || err?.response?.data || err?.message || "Submission failed";
      setSubmitError(typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <h2 style={{ marginBottom: 12 }}>Submit Feedback</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="small-muted">Student</label>
                <select name="student_id" value={form.student_id} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }}>
                  <option value="">-- select student --</option>
                  {students.map(s => (
                    <option key={s.student_id ?? s.id} value={s.student_id ?? s.id}>
                      {s.name} {s.email ? `(${s.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label className="small-muted">Faculty</label>
                <select name="faculty_id" value={form.faculty_id} onChange={onChange} style={{ width: "100%", padding: 8, marginTop: 6 }}>
                  <option value="">-- select faculty --</option>
                  {faculty.map(f => (
                    <option key={f.faculty_id ?? f.id} value={f.faculty_id ?? f.id}>
                      {f.name} {f.email ? `(${f.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="small-muted">Feedback text</label>
              <textarea
                name="text_content"
                value={form.text_content}
                onChange={onChange}
                rows={5}
                style={{ width: "100%", padding: 10, marginTop: 6 }}
                placeholder="Type student feedback about lecture / faculty / materials..."
              />
            </div>

            {submitError && <div style={{ color: "red" }}>{submitError}</div>}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" className="btn" style={{ background: "#06b6d4", color: "#fff" }} disabled={submitting}>
                {submitting ? "Submitting (analyzing...)" : "Submit Feedback"}
              </button>

              <button type="button" className="btn" onClick={() => { setForm({ student_id: "", faculty_id: "", text_content: "" }); setSubmitError(""); }}>
                Reset
              </button>

              <div style={{ marginLeft: "auto", color: "#6b7280", fontSize: 13 }}>
                {submitting ? "Running sentiment analysis (may take a few seconds)..." : ""}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Sentiment result */}
      {sentimentResult && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>Sentiment Result</div>
          <div style={{ marginTop: 8 }}>Detected sentiment: <strong>{sentimentResult}</strong></div>
        </div>
      )}

      {/* Recent feedback */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>Recent Feedback</div>
          <div style={{ color: "#6b7280" }}>{recent.length} items</div>
        </div>

        {recent.length === 0 ? (
          <div>No feedback yet (submit one above).</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {recent.map((r, i) => (
              <div key={r.feedback_id ?? i} style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>{r.student_name || r.student || "Student"}</div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>{r.sentiment ?? "Unknown"}</div>
                </div>
                <div style={{ marginTop: 6, color: "#374151" }}>{r.text_content}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>{r.submitted_on ? new Date(r.submitted_on).toLocaleString() : ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
