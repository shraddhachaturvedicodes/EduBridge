// client/src/components/FacultyProfile.jsx
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import Loading from "./Loading";

function StarRating({ v }) {
  const stars = [];
  const r = Math.round(v || 0);
  for (let i = 1; i <= 5; i++) stars.push(<span key={i} style={{ color: i <= r ? "#f6b26b" : "#ddd" }}>★</span>);
  return <span>{stars}</span>;
}

export default function FacultyProfile({ facultyId, onFeedbackSubmit }) {
  const [profile, setProfile] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [avg, setAvg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!facultyId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        let p;
        try { p = await api.get(`/users/${facultyId}`); } catch (e) { p = await api.get(`/faculty/${facultyId}`); }
        const profileObj = p.data.user ?? p.data.profile ?? p.data ?? p.data.result ?? null;
        setProfile(profileObj);

        let f;
        try { f = await api.get(`/feedback`, { params: { teacher_id: facultyId } }); } catch (_) {
          try { f = await api.get(`/feedback`, { params: { faculty_id: facultyId } }); } catch (_) {
            f = await api.get(`/feedback?teacher_id=${facultyId}`).catch(() => ({ data: [] }));
          }
        }
        const rows = f.data?.feedback ?? f.data?.rows ?? f.data?.data ?? f.data ?? [];
        const feedback = Array.isArray(rows) ? rows : [];
        setFeedbackList(feedback);

        if (feedback.length) {
          const avgv = feedback.reduce((s, it) => s + (Number(it.score ?? it.score_value ?? 0)), 0) / feedback.length;
          setAvg(Number(avgv.toFixed(2)));
        } else {
          try {
            const summ = await api.get('/feedback/summary', { params: { teacher_id: facultyId } });
            if (summ?.data?.count) {
              setAvg(Number(summ.data.avg || summ.data.avg_rating || 0));
            } else setAvg(null);
          } catch (e) {
            setAvg(null);
          }
        }
      } catch (e) {
        console.error("Failed loading profile/feedback", e);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [facultyId]);

  async function submitFeedback(e) {
    e?.preventDefault?.();
    if (!facultyId) return;
    setSending(true);
    try {
      await api.post("/feedback", { receiver_user_id: facultyId, score, comment });
      setComment("");
      setScore(5);
      const r = await api.get(`/feedback`, { params: { teacher_id: facultyId } }).catch(() => ({ data: [] }));
      const rows = r.data?.feedback ?? r.data ?? [];
      setFeedbackList(Array.isArray(rows) ? rows : []);
      if (onFeedbackSubmit) onFeedbackSubmit();
      alert("Feedback submitted, thank you!");
    } catch (err) {
      console.error("Feedback submit failed", err);
      alert("Failed to submit feedback");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading />;

  if (error) return <div style={{ color: "crimson" }}>{error}</div>;
  if (!profile) return <div style={{ color: "#666" }}>Profile not found.</div>;

  return (
    <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 88, height: 88, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          {profile.display_name ? profile.display_name.split(" ").map(n => n[0]).slice(0,2).join("") : (profile.email && profile.email[0]?.toUpperCase())}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{profile.display_name || profile.email}</div>
          <div style={{ color: "#666", marginTop: 6 }}>{profile.email}</div>
          <div style={{ marginTop: 8 }}>{profile.education || "Education: N/A"}</div>
          <div style={{ marginTop: 6 }}>{profile.expertise ? `Expertise: ${profile.expertise}` : "Expertise: N/A"}</div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <strong>Rating:</strong>
            <div>
              <StarRating v={avg || profile.avg_rating || 0} />
              <span style={{ marginLeft: 8, color: "#666" }}>{avg ? `${avg} / 5` : (profile.avg_rating ? `${profile.avg_rating} / 5` : "No ratings")}</span>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div>
        <h4 style={{ margin: "6px 0" }}>Leave feedback</h4>
        <form onSubmit={submitFeedback}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 13 }}>Score:</label>
            <select value={score} onChange={e => setScore(Number(e.target.value))}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </div>
          <div style={{ marginTop: 8 }}>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write an optional comment..." style={{ width: "100%", minHeight: 100, padding: 8 }} />
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button type="submit" disabled={sending} style={{ padding: "8px 12px" }}>{sending ? "Sending..." : "Submit Feedback"}</button>
            <button type="button" onClick={() => { setComment(""); setScore(5); }} style={{ padding: "8px 12px" }}>Clear</button>
          </div>
        </form>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div>
        <h4 style={{ margin: "6px 0" }}>Recent feedback</h4>
        {feedbackList.length === 0 && <div style={{ color: "#666" }}>No feedback yet.</div>}
        {feedbackList.map((f) => (
          <div key={f.id || `${f.sender_user_id}-${f.created_on}`} style={{ padding: 8, borderBottom: "1px solid #f1f1f1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>{f.sender_name || (f.sender_user_id ? `User ${f.sender_user_id}` : "Anonymous")}</div>
              <div style={{ color: "#666", fontSize: 12 }}>{new Date(f.created_on || f.created_at || f.created).toLocaleString()}</div>
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontWeight: 700 }}>{f.score}</span> — <span style={{ color: "#666" }}>{f.comment || <em>No comment</em>}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
