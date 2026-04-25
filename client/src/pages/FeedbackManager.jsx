// client/src/pages/FeedbackManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../axiosInstance';

const teal = '#2dd4bf';
const navy = '#0f2a3d';
const green = '#10b981';
const rose = '#f43f5e';
const amber = '#f59e0b';

function getSentimentColor(s) {
  if (!s) return '#64748b';
  if (s.toLowerCase() === 'positive') return green;
  if (s.toLowerCase() === 'negative') return rose;
  return amber;
}

function StarRating({ score, onSelect, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(function(star) {
        return (
          <span
            key={star}
            onClick={function() { if (!readonly && onSelect) onSelect(star); }}
            onMouseEnter={function() { if (!readonly) setHover(star); }}
            onMouseLeave={function() { if (!readonly) setHover(0); }}
            style={{
              fontSize: readonly ? 18 : 36,
              cursor: readonly ? 'default' : 'pointer',
              color: star <= (hover || score) ? '#fbbf24' : '#e5e7eb',
              transition: 'all 0.15s',
              transform: (!readonly && star <= hover) ? 'scale(1.15)' : 'scale(1)'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function FeedbackManager() {
  const { user } = useAuth();
  const role = (user && user.role) ? user.role.toLowerCase() : 'student';

  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const [allFeedback, setAllFeedback] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(function() {
    loadFaculty();
    if (role === 'faculty') loadMyFeedback();
    if (role === 'admin' || role === 'management') loadAllFeedback();
  }, [role]);

  async function loadFaculty() {
    try {
      const res = await api.get('/api/users', { params: { roles: 'faculty' } });
      const arr = Array.isArray(res.data) ? res.data : (res.data.users || []);
      setFaculty(arr);
    } catch (e) {
      console.error('Failed to load faculty', e);
    }
  }

  async function loadMyFeedback() {
    if (!user) return;
    setLoadingFeedback(true);
    try {
      const res = await api.get('/api/feedback', { params: { teacher_id: user.user_id } });
      const arr = res.data.feedback || res.data || [];
      setMyFeedback(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error('Failed to load feedback', e);
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function loadAllFeedback() {
    setLoadingFeedback(true);
    try {
      const res = await api.get('/api/feedback/all');
      const arr = res.data.feedback || [];
      setAllFeedback(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error('Failed to load all feedback', e);
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!selectedFaculty) return setError('Please select a faculty member.');
    if (rating === 0) return setError('Please give a star rating.');
    if (!comment.trim()) return setError('Please write your feedback comment.');

    setSubmitting(true);
    try {
      await api.post('/api/feedback', {
        receiver_user_id: parseInt(selectedFaculty),
        score: rating,
        comment: comment.trim()
      });
      setSubmitSuccess(true);
      setSelectedFaculty('');
      setRating(0);
      setComment('');
      setTimeout(function() { setSubmitSuccess(false); }, 4000);
    } catch (err) {
      setError(err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ---- STUDENT VIEW ----
  if (role === 'student') {
    return (
      <div style={{ padding: 28, background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: navy, margin: '0 0 6px 0' }}>
            💬 Submit Feedback
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Your feedback is completely anonymous. Faculty will not see your name.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* Form Card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: navy, margin: '0 0 24px 0' }}>
              ✍️ Submit Confidential Feedback
            </h2>

            {submitSuccess && (
              <div style={{
                padding: 16, background: '#f0fff8', border: '2px solid ' + teal,
                borderRadius: 12, marginBottom: 24, color: '#065f46'
              }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>✅ Feedback Submitted!</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  Your feedback has been submitted and analyzed for sentiment. Thank you!
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: 14, background: '#fee2e2', border: '1px solid #fca5a5',
                borderRadius: 10, marginBottom: 20, color: '#dc2626', fontSize: 14
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Faculty Select */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: navy, marginBottom: 8 }}>
                  Select Faculty Member *
                </label>
                <select
                  value={selectedFaculty}
                  onChange={function(e) { setSelectedFaculty(e.target.value); setError(''); }}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 10,
                    border: '2px solid #e2e8f0', fontSize: 15, background: '#fff',
                    color: navy, outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Select Faculty --</option>
                  {faculty.map(function(f) {
                    return (
                      <option key={f.user_id} value={f.user_id}>
                        {f.display_name || f.email}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Star Rating */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: navy, marginBottom: 12 }}>
                  Your Rating *
                </label>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, display: 'inline-block' }}>
                  <StarRating score={rating} onSelect={setRating} readonly={false} />
                </div>
                {rating > 0 && (
                  <div style={{ marginTop: 10, fontSize: 14, color: teal, fontWeight: 600 }}>
                    You rated: {rating}/5 stars — {
                      rating === 5 ? 'Excellent!' :
                      rating === 4 ? 'Very Good!' :
                      rating === 3 ? 'Good' :
                      rating === 2 ? 'Fair' : 'Poor'
                    }
                  </div>
                )}
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: navy, marginBottom: 8 }}>
                  Your Feedback *
                </label>
                <textarea
                  value={comment}
                  onChange={function(e) { setComment(e.target.value); setError(''); }}
                  placeholder="e.g. The lecturer explained the concepts very clearly and was always available for help..."
                  rows={5}
                  maxLength={500}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 10,
                    border: '2px solid #e2e8f0', fontSize: 15, resize: 'vertical',
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6
                  }}
                />
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  {comment.length}/500 characters • Your identity remains anonymous
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: 16,
                  background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #2dd4bf, #0d9488)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: 16, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(45,212,191,0.3)'
                }}
              >
                {submitting ? '⏳ Submitting...' : '📨 Submit Feedback for Sentiment Analysis'}
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: navy, margin: '0 0 16px 0' }}>
                🔐 Privacy & Anonymity
              </h3>
              {[
                { icon: '👤', text: 'Your name is never shown to faculty' },
                { icon: '🔒', text: 'Only management can see who submitted feedback' },
                { icon: '🤖', text: 'AI sentiment analysis runs automatically' },
                { icon: '📊', text: 'Helps improve teaching quality' },
              ].map(function(item, i) {
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: navy, margin: '0 0 16px 0' }}>
                💡 Tips for Good Feedback
              </h3>
              {[
                'Be specific about what you liked or disliked',
                'Mention examples from classes or interactions',
                'Focus on teaching style, clarity, and availability',
                'Be honest — your feedback helps everyone improve',
              ].map(function(tip, i) {
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: teal, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                );
              })}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #0f2a3d, #1a3f5c)',
              borderRadius: 14, padding: 20, color: '#fff'
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px 0' }}>
                🤖 Sentiment Analysis
              </h3>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Your feedback is automatically analyzed using Python VADER NLP to detect whether it is
                Positive, Neutral, or Negative. This helps management understand overall teaching quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- FACULTY VIEW ----
  if (role === 'faculty') {
    return (
      <div style={{ padding: 28, background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: navy, margin: '0 0 6px 0' }}>
            📊 My Feedback
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Anonymous feedback from your students. Names are hidden to protect student privacy.
          </p>
        </div>

        {loadingFeedback && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            <div style={{ color: '#64748b' }}>Loading your feedback...</div>
          </div>
        )}

        {!loadingFeedback && myFeedback.length === 0 && (
          <div style={{
            background: '#fff', borderRadius: 14, padding: '60px 20px',
            textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
            <h3 style={{ color: navy, marginBottom: 8 }}>No Feedback Yet</h3>
            <p style={{ color: '#64748b' }}>Students have not submitted feedback for you yet.</p>
          </div>
        )}

        {!loadingFeedback && myFeedback.length > 0 && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + teal }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>{myFeedback.length}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Total Feedback</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + amber }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>
                  {(myFeedback.reduce(function(s, f) { return s + (Number(f.score) || 0); }, 0) / myFeedback.length).toFixed(1)}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Avg Rating</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + green }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>
                  {myFeedback.filter(function(f) { return f.sentiment && f.sentiment.toLowerCase() === 'positive'; }).length}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Positive</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + rose }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>
                  {myFeedback.filter(function(f) { return f.sentiment && f.sentiment.toLowerCase() === 'negative'; }).length}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Negative</div>
              </div>
            </div>

            {/* Feedback List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myFeedback.map(function(f, i) {
                return (
                  <div key={f.id || i} style={{
                    background: '#fff', borderRadius: 12, padding: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderLeft: '4px solid ' + getSentimentColor(f.sentiment)
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <StarRating score={f.score || 0} readonly={true} />
                      {f.sentiment && (
                        <span style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: getSentimentColor(f.sentiment) + '20',
                          color: getSentimentColor(f.sentiment)
                        }}>
                          {f.sentiment}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 10px 0' }}>
                      "{f.comment || 'No comment provided'}"
                    </p>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      {f.created_on ? new Date(f.created_on).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- ADMIN/MANAGEMENT VIEW ----
  return (
    <div style={{ padding: 28, background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: navy, margin: '0 0 6px 0' }}>
          📊 All Student Feedback
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Complete feedback analysis — all submissions from students to faculty.
        </p>
      </div>

      {loadingFeedback && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <div style={{ color: '#64748b' }}>Loading all feedback...</div>
        </div>
      )}

      {!loadingFeedback && allFeedback.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: '60px 20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: navy, marginBottom: 8 }}>No Feedback Yet</h3>
          <p style={{ color: '#64748b' }}>No students have submitted feedback yet.</p>
        </div>
      )}

      {!loadingFeedback && allFeedback.length > 0 && (
        <div>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + teal }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>{allFeedback.length}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Total Submissions</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + amber }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>
                {(allFeedback.reduce(function(s, f) { return s + (Number(f.score) || 0); }, 0) / allFeedback.length).toFixed(1)}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Avg Rating</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + green }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>
                {allFeedback.filter(function(f) { return f.sentiment && f.sentiment.toLowerCase() === 'positive'; }).length}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Positive</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid ' + rose }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: navy }}>
                {allFeedback.filter(function(f) { return f.sentiment && f.sentiment.toLowerCase() === 'negative'; }).length}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>Negative</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allFeedback.map(function(f, i) {
              return (
                <div key={f.id || i} style={{
                  background: '#fff', borderRadius: 12, padding: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: '4px solid ' + getSentimentColor(f.sentiment)
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: navy, marginBottom: 6 }}>
                        From: <span style={{ color: '#475569', fontWeight: 400 }}>{f.student_name || f.sender_name || 'Anonymous'}</span>
                        {' → '}
                        To: <span style={{ color: teal }}>{f.faculty_name || f.receiver_name || 'Faculty'}</span>
                      </div>
                      <StarRating score={f.score || 0} readonly={true} />
                    </div>
                    {f.sentiment && (
                      <span style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: getSentimentColor(f.sentiment) + '20',
                        color: getSentimentColor(f.sentiment)
                      }}>
                        {f.sentiment}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 10px 0' }}>
                    "{f.comment || 'No comment'}"
                  </p>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {f.created_on ? new Date(f.created_on).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}