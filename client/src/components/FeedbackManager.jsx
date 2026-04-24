import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosInstance';

export default function FeedbackManager() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [receivedFeedback, setReceivedFeedback] = useState([]);

  useEffect(() => {
    fetchTeachers();
    if (user?.role === 'faculty') {
      fetchReceivedFeedback();
    }
  }, [user]);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/users');
      const facultyUsers = (response.data || []).filter(u => u.role === 'faculty' || u.role === 'teacher');
      setTeachers(facultyUsers);
      console.log('Fetched teachers:', facultyUsers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    }
  };

  const fetchReceivedFeedback = async () => {
    try {
      const response = await axios.get(`/api/feedback?teacher_id=${user.user_id}`);
      const feedbackData = response.data.feedback || response.data || [];
      setReceivedFeedback(feedbackData);
      console.log('Fetched feedback:', feedbackData);
    } catch (err) {
      console.error('Error fetching received feedback:', err);
      setReceivedFeedback([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Submitting feedback...');
    console.log('Selected teacher:', selectedTeacher);
    console.log('Rating:', rating);
    console.log('Comment:', comment);
    
    if (!selectedTeacher) {
      setError('Please select a faculty member');
      return;
    }
    
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write your feedback');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        receiver_user_id: parseInt(selectedTeacher),
        score: rating,
        comment: comment.trim()
      };
      
      console.log('📤 Sending payload:', payload);

      const response = await axios.post('/api/feedback', payload);

      console.log('✅ Response received:', response.data);

      setSubmitSuccess(true);
      setSelectedTeacher('');
      setRating(0);
      setComment('');
      
      setTimeout(() => setSubmitSuccess(false), 4000);
      
    } catch (err) {
      console.error('❌ Submit error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        style={{
          fontSize: 20,
          color: index < score ? '#fbbf24' : '#e5e7eb',
          marginRight: 4
        }}
      >
        ★
      </span>
    ));
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return '#64748b';
    const s = sentiment.toLowerCase();
    if (s === 'positive') return '#10b981';
    if (s === 'negative') return '#ef4444';
    return '#f59e0b';
  };

  const getSentimentEmoji = (sentiment) => {
    if (!sentiment) return '😐';
    const s = sentiment.toLowerCase();
    if (s === 'positive') return '😊';
    if (s === 'negative') return '😟';
    return '😐';
  };

  return (
    <div style={{
      padding: '32px',
      background: '#f8fafc',
      minHeight: 'calc(100vh - 73px)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#0f2a3d',
          marginBottom: 8
        }}>
          {user?.role === 'faculty' ? 'Feedback Received' : 'Student Feedback Portal'} 💬
        </h1>
        <p style={{
          fontSize: 16,
          color: '#64748b'
        }}>
          {user?.role === 'faculty' 
            ? 'View feedback from students to improve your teaching'
            : 'Share your feedback to help improve teaching quality'}
        </p>
      </div>

      {/* Student View - Submit Feedback */}
      {user?.role !== 'faculty' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 20px rgba(15, 42, 61, 0.08)',
          marginBottom: 32
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#0f2a3d',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <span style={{ fontSize: 28 }}>✍️</span>
            Submit Confidential Feedback
          </h2>

          {submitSuccess && (
            <div style={{
              padding: 16,
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              border: '2px solid #10b981',
              borderRadius: 12,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#065f46',
              animation: 'slideDown 0.3s ease'
            }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Success!</div>
                <div style={{ fontSize: 14 }}>Your feedback has been submitted successfully. Thank you!</div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: 16,
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              border: '2px solid #ef4444',
              borderRadius: 12,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#991b1b'
            }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Error</div>
                <div style={{ fontSize: 14 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Faculty Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#0f2a3d',
                marginBottom: 8
              }}>
                Faculty Member <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => {
                  setSelectedTeacher(e.target.value);
                  console.log('Selected teacher:', e.target.value);
                }}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '2px solid #e2e8f0',
                  fontSize: 15,
                  background: '#fff',
                  color: '#0f2a3d',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Select Faculty --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.user_id} value={teacher.user_id}>
                    {teacher.display_name || teacher.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#0f2a3d',
                marginBottom: 12
              }}>
                Rating <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                display: 'flex',
                gap: 8,
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 12,
                width: 'fit-content'
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => {
                      setRating(star);
                      console.log('Rating set to:', star);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: 40,
                      cursor: 'pointer',
                      color: star <= (hoverRating || rating) ? '#fbbf24' : '#e5e7eb',
                      transition: 'all 0.2s',
                      transform: star <= (hoverRating || rating) ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              {rating > 0 && (
                <div style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: '#2dd4bf',
                  fontWeight: 600
                }}>
                  You rated: {rating}/5 stars
                </div>
              )}
            </div>

            {/* Feedback Comment */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#0f2a3d',
                marginBottom: 8
              }}>
                Your Feedback <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
                placeholder="Type your feedback here (e.g., 'The lecturer explained the concepts very clearly')"
                required
                maxLength={500}
                rows={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '2px solid #e2e8f0',
                  fontSize: 15,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.6
                }}
              />
              <div style={{
                marginTop: 8,
                fontSize: 13,
                color: '#94a3b8'
              }}>
                {comment.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 20,
                    height: 20,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Submitting...
                </>
              ) : (
                <>
                  <span style={{ fontSize: 20 }}>📨</span>
                  Submit Feedback for Sentiment Analysis
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Faculty View - Received Feedback */}
      {user?.role === 'faculty' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 20px rgba(15, 42, 61, 0.08)'
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#0f2a3d',
            marginBottom: 24
          }}>
            Feedback from Students 📊
          </h2>

          {receivedFeedback.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                No feedback received yet
              </div>
              <div style={{ fontSize: 14 }}>
                Students haven't submitted any feedback for you
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              {receivedFeedback.map((feedback, index) => (
                <div
                  key={feedback.id || index}
                  style={{
                    padding: 20,
                    background: '#f8fafc',
                    borderRadius: 12,
                    borderLeft: `4px solid ${getSentimentColor(feedback.sentiment)}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {renderStars(feedback.score || 0)}
                      <span style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f2a3d'
                      }}>
                        {feedback.score}/5
                      </span>
                    </div>
                    {feedback.sentiment && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '4px 12px',
                        background: getSentimentColor(feedback.sentiment) + '20',
                        color: getSentimentColor(feedback.sentiment),
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600
                      }}>
                        <span style={{ fontSize: 16 }}>
                          {getSentimentEmoji(feedback.sentiment)}
                        </span>
                        {feedback.sentiment}
                      </div>
                    )}
                  </div>

                  <p style={{
                    fontSize: 15,
                    color: '#475569',
                    lineHeight: 1.7,
                    marginBottom: 12
                  }}>
                    "{feedback.comment || 'No comment provided'}"
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    color: '#94a3b8'
                  }}>
                    <span>{feedback.sender_name || 'Anonymous'}</span>
                    <span>
                      {new Date(feedback.created_on).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}