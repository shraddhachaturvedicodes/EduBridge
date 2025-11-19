// client/src/pages/Recommendations.jsx
import React, { useState } from 'react';
import api from '../axiosInstance';

function TagList({ tags }) {
  if (!tags) return null;
  const list = (typeof tags === 'string') ? tags.split(',').map(s => s.trim()).filter(Boolean) : tags;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
      {list.map((t, i) => <div key={i} style={{ background:'#eef6ff', padding:'4px 8px', borderRadius:6, fontSize:12 }}>{t}</div>)}
    </div>
  );
}

export default function Recommendations() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSearch(e) {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    setErr('');
    setLoading(true);
    try {
      const resp = await api.get('/recommendations', { params: { q, limit: 20 } });

      // server may return { recommendations: [...] } (current backend)
      // or { results: [...] } (older clients). Support both.
      const rows = resp?.data?.recommendations ?? resp?.data?.results ?? [];

      // normalize rows: ensure numeric score exists (0..1). Prefer rating or _rating_order.
      const normalized = (rows || []).map(r => {
        const rating = (r.rating ?? r._rating_order ?? 0);
        // Heuristic: if rating looks like 0..1 already, use it; if >1 assume out-of-5 scale.
        let score = 0;
        if (typeof rating === 'number') {
          if (rating <= 1) score = Math.max(0, Math.min(1, rating));
          else score = Math.max(0, Math.min(1, rating / 5));
        } else if (typeof rating === 'string' && rating.trim() !== '') {
          const parsed = parseFloat(rating);
          if (!Number.isNaN(parsed)) {
            if (parsed <= 1) score = Math.max(0, Math.min(1, parsed));
            else score = Math.max(0, Math.min(1, parsed / 5));
          }
        }
        return {
          ...r,
          score,
        };
      });

      setResults(normalized);
    } catch (error) {
      console.error('Recommendation fetch failed', error);
      setErr(error?.response?.data?.error || error.message || 'Failed to fetch recommendations');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Teacher Recommendation</h2>
      <p style={{ color: '#666' }}>Describe your project or learning requirement (e.g. "deep learning for medical imaging, Python & PyTorch"). The system will recommend teachers matching your needs.</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="E.g. 'NLP, transformers, PyTorch'" style={{ flex: 1, padding: 10 }} />
        <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>{loading ? 'Searching...' : 'Find Teachers'}</button>
      </form>

      {err && <div style={{ color: 'crimson', marginBottom: 12 }}>{err}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div>
          {results.length === 0 && <div style={{ color: '#666' }}>No recommendations yet. Try a search above.</div>}
          {results.map(r => (
            <div key={r.user_id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.display_name || r.email}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{r.role}</div>
                </div>
                <div style={{ fontSize: 12, color: '#0a66ff' }}>{(Number(r.score || 0) * 100).toFixed(1)}%</div>
              </div>
              <div style={{ marginTop: 8, color: '#444' }}>{r.bio}</div>
              <TagList tags={r.expertise} />
              <div style={{ marginTop: 10, display:'flex', gap:8 }}>
                <a href={`mailto:${r.email}`} style={{ textDecoration:'none' }}><button>Contact</button></a>
                <button onClick={() => alert('Open teacher profile (implement as needed)')}>View profile</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius:8, padding:12, height: '100%' }}>
          <h4>Tips for better results</h4>
          <ul style={{ color: '#666' }}>
            <li>Include technical keywords: languages, libraries, domains (e.g. "PyTorch, computer vision").</li>
            <li>Mention domain: "medical imaging", "NLP", "distributed systems".</li>
            <li>Short sentence works well: "deep learning for satellite imagery using PyTorch".</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
