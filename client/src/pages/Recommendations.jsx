// src/pages/Recommendations.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Recommendations() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/students`);
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load students', err);
      }
    })();
  }, []);

  async function loadRecommendations(studentId) {
    setError('');
    setRecs([]);
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/recommendations/${studentId}?limit=25`);
      const data = res.data;
      setRecs(data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
      setError(err?.response?.data?.error || err.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <h2 style={{ marginBottom: 12 }}>Faculty Recommendations</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label className="small-muted">Choose student</label>
            <select value={selected} onChange={(e) => { setSelected(e.target.value); }} style={{ width: '100%', padding: 8, marginTop: 6 }}>
              <option value="">-- select student --</option>
              {students.map(s => (
                <option key={s.student_id ?? s.id} value={s.student_id ?? s.id}>
                  {s.name} {s.email ? `(${s.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => loadRecommendations(selected)} style={{ background: '#06b6d4', color: '#fff' }}>Get Recommendations</button>
            <button className="btn" onClick={() => { setSelected(''); setRecs([]); }}>Clear</button>
          </div>
        </div>

        {loading && <div style={{ marginTop: 12 }}>Loading recommendations...</div>}
        {error && <div style={{ marginTop: 12, color: 'red' }}>{error}</div>}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Recommendations</div>
          <div style={{ color: '#6b7280' }}>{recs.length} results</div>
        </div>

        <div style={{ marginTop: 10 }}>
          {recs.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No recommendations yet. Choose a student and click "Get Recommendations".</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {recs.map((r, i) => (
                <div key={r.faculty_id ?? i} style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.name} {r.email ? ` — ${r.email}` : ''}</div>
                      <div style={{ color: '#6b7280', marginTop: 4 }}>{r.designation || r.department || ''}</div>
                      <div style={{ marginTop: 6, fontSize: 13 }}>Expertise: {Array.isArray(r.expertise_areas) ? r.expertise_areas.join(', ') : (r.expertise_areas || '-')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{r.match?.score ?? '-'}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>score</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => alert(`Open profile for ${r.name} (faculty id ${r.faculty_id})`)}>View Profile</button>
                    <button className="btn" onClick={() => alert(`Request meeting with ${r.name}`)} style={{ background: '#06b6d4', color: '#fff' }}>Request Meeting</button>
                    <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 13 }}>
                      Intersection: {r.match?.intersection_count ?? 0} • Jaccard: {r.match?.jaccard ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
