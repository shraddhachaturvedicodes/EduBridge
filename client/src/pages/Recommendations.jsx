import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axiosInstance';

const teal = '#2dd4bf';
const navy = '#0f2a3d';
const purple = '#6366f1';
const amber = '#f59e0b';
const green = '#10b981';
const blue = '#3b82f6';

function TagBadge({ tag }) {
  return (
    <span style={{
      padding: '4px 10px', background: '#f0fffe', color: teal,
      borderRadius: 20, fontSize: 11, fontWeight: 600
    }}>
      {tag}
    </span>
  );
}

function ScoreBar({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 70 ? green : pct >= 40 ? amber : blue;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Match Score</span>
        <span style={{ color: color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 10, height: 6 }}>
        <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 10 }} />
      </div>
    </div>
  );
}

export default function Recommendations() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');

  async function handleSearch(e) {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setErr('');
    setLoading(true);
    setSearched(true);
    try {
      const resp = await api.get('/recommendations', { params: { q, limit: 20 } });
      const rows = resp.data.recommendations || resp.data.results || [];
      const normalized = rows.map(function(r) {
        const rating = r.rating || r._rating_order || 0;
        let score = 0;
        if (typeof rating === 'number') {
          score = rating <= 1 ? Math.max(0, Math.min(1, rating)) : Math.max(0, Math.min(1, rating / 5));
        }
        return Object.assign({}, r, { score: score });
      });
      setResults(normalized);
    } catch (error) {
      setErr('Failed to fetch recommendations');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(teacher) {
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await api.post('/api/messages', {
        receiver_user_id: teacher.user_id,
        text_content: msgText.trim()
      });
      setMsgSuccess('Message sent to ' + (teacher.display_name || teacher.email) + '!');
      setMsgText('');
      setTimeout(function() {
        setMsgSuccess('');
        setSelectedTeacher(null);
      }, 2500);
    } catch (e) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const suggestions = ['machine learning', 'nlp', 'deep learning', 'databases', 'cloud computing', 'computer vision', 'python'];
  const cardColors = [teal, purple, blue, green, amber];

  return (
    <div style={{ padding: 28, background: '#f8fafc', minHeight: '100vh' }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: navy, margin: '0 0 6px 0' }}>
          🎯 Faculty Recommendation Engine
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Find the perfect faculty mentor for your project or research area.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <input
            value={query}
            onChange={function(e) { setQuery(e.target.value); }}
            placeholder="e.g. deep learning for medical imaging, Python and PyTorch"
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              border: '2px solid #e2e8f0', fontSize: 15, outline: 'none', boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              padding: '14px 24px', background: teal, color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 15,
              fontWeight: 700, cursor: 'pointer',
              opacity: (loading || !query.trim()) ? 0.7 : 1
            }}
          >
            {loading ? 'Searching...' : 'Find Faculty'}
          </button>
        </form>

        <div style={{ marginTop: 14 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginRight: 8 }}>Quick search:</span>
          {suggestions.map(function(s) {
            return (
              <button
                key={s}
                onClick={function() { setQuery(s); }}
                style={{
                  padding: '5px 12px', background: '#f1f5f9', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', marginRight: 6, marginTop: 4
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {err && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
          {err}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        <div>
          {!searched && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎓</div>
              <h3 style={{ color: navy, marginBottom: 8 }}>Find Your Perfect Mentor</h3>
              <p style={{ color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
                Type your research interest or project topic above and we will match you with the best faculty.
              </p>
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>😕</div>
              <h3 style={{ color: navy, marginBottom: 8 }}>No matches found</h3>
              <p style={{ color: '#64748b' }}>Try keywords like "machine learning", "databases", or "python".</p>
            </div>
          )}

          {loading && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <div style={{ color: '#64748b' }}>Searching faculty profiles...</div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 16, fontWeight: 600 }}>
                Found {results.length} faculty matching "{query}"
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {results.map(function(r, i) {
                  const topColor = cardColors[i % cardColors.length];
                  const tags = r.expertise
                    ? (typeof r.expertise === 'string'
                        ? r.expertise.split(',').map(function(s) { return s.trim(); })
                        : r.expertise)
                    : [];

                  return (
                    <div key={r.user_id || i} style={{
                      background: '#fff', borderRadius: 14, padding: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      borderTop: '4px solid ' + topColor,
                      position: 'relative'
                    }}>
                      {i === 0 && (
                        <div style={{
                          position: 'absolute', top: 16, right: 16,
                          background: teal, color: '#fff',
                          padding: '4px 12px', borderRadius: 20,
                          fontSize: 12, fontWeight: 700
                        }}>
                          🏆 Best Match
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%',
                          background: topColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 22, flexShrink: 0
                        }}>
                          {(r.display_name || r.email || 'F').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 17, fontWeight: 700, color: navy }}>
                            {r.display_name || r.email || 'Faculty'}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            Faculty Member at EduBridge
                          </div>
                        </div>
                      </div>

                      {r.bio && (
                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '8px 0' }}>
                          {r.bio}
                        </p>
                      )}

                      {tags.filter(Boolean).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                          {tags.filter(Boolean).map(function(tag, j) {
                            return <TagBadge key={j} tag={tag} />;
                          })}
                        </div>
                      )}

                      <ScoreBar score={r.score} />

                      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                        <button
                          onClick={function() {
                            setSelectedTeacher(r);
                            setMsgText('');
                            setMsgSuccess('');
                          }}
                          style={{
                            padding: '10px 16px', background: teal, color: '#fff',
                            border: 'none', borderRadius: 8, fontWeight: 600,
                            fontSize: 13, cursor: 'pointer'
                          }}
                        >
                          Send Message
                        </button>
                        <button
                          onClick={function() { navigate('/messages'); }}
                          style={{
                            padding: '10px 16px', background: '#f0fffe', color: teal,
                            border: '1px solid ' + teal, borderRadius: 8,
                            fontWeight: 600, fontSize: 13, cursor: 'pointer'
                          }}
                        >
                          Open Messages
                        </button>
                        <a href={'mailto:' + r.email} style={{ textDecoration: 'none' }}>
                          <button style={{
                            padding: '10px 16px', background: '#f8fafc', color: '#475569',
                            border: '1px solid #e2e8f0', borderRadius: 8,
                            fontWeight: 600, fontSize: 13, cursor: 'pointer'
                          }}>
                            Email
                          </button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: navy, margin: '0 0 16px 0' }}>Tips for Better Results</h3>
            {[
              { icon: '🔑', tip: 'Use specific keywords like PyTorch, computer vision, NLP' },
              { icon: '📝', tip: 'Describe your project domain like medical imaging or finance' },
              { icon: '💻', tip: 'Include technologies like Python, TensorFlow, SQL' },
              { icon: '🎯', tip: 'Short phrases work well like deep learning for satellite imagery' },
            ].map(function(item, i) {
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{item.tip}</span>
                </div>
              );
            })}
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: navy, margin: '0 0 16px 0' }}>How It Works</h3>
            {[
              { step: '1', text: 'Enter your research or project topic' },
              { step: '2', text: 'System matches with faculty expertise' },
              { step: '3', text: 'Best matches shown with score' },
              { step: '4', text: 'Send a direct message to connect' },
            ].map(function(item, i) {
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: teal, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedTeacher && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 500,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: teal, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20
              }}>
                {(selectedTeacher.display_name || selectedTeacher.email || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: navy, fontSize: 16 }}>
                  {selectedTeacher.display_name || selectedTeacher.email}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Send a direct message</div>
              </div>
            </div>

            {msgSuccess && (
              <div style={{
                padding: 12, background: '#f0fff8', border: '1px solid #2dd4bf',
                borderRadius: 8, color: '#0f766e', fontSize: 14, marginBottom: 16, fontWeight: 600
              }}>
                {msgSuccess}
              </div>
            )}

            {!msgSuccess && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: navy, display: 'block', marginBottom: 8 }}>
                    Your Message
                  </label>
                  <textarea
                    value={msgText}
                    onChange={function(e) { setMsgText(e.target.value); }}
                    placeholder="Hi Professor, I am interested in working on a project related to..."
                    rows={5}
                    style={{
                      width: '100%', padding: 12, borderRadius: 10,
                      border: '1.5px solid #e2e8f0', fontSize: 14,
                      resize: 'vertical', fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    {msgText.length}/500 characters
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={function() { setSelectedTeacher(null); }}
                    style={{
                      padding: '10px 20px', borderRadius: 8,
                      border: '1px solid #e2e8f0', background: '#fff',
                      cursor: 'pointer', fontWeight: 600, fontSize: 14
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={function() { sendMessage(selectedTeacher); }}
                    disabled={sending || !msgText.trim()}
                    style={{
                      padding: '10px 24px', background: teal, color: '#fff',
                      border: 'none', borderRadius: 8, fontWeight: 700,
                      fontSize: 14, cursor: 'pointer',
                      opacity: (sending || !msgText.trim()) ? 0.7 : 1
                    }}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}