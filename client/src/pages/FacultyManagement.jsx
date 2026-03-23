/*// client/src/pages/FeedbackManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';

const API_BASE = '/';

export default function FeedbackManager() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    student_id: '',
    faculty_id: '',
    text_content: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, facultyRes, feedbackRes] = await Promise.all([
          api.get('/students').catch(() => ({ data: [] })),
          api.get('/users', { params: { role: 'faculty' } }).catch(() => api.get('/faculty').catch(()=>({ data: [] }))),
          api.get('/feedback').catch(() => ({ data: [] })),
        ]);

        const studentsData = studentsRes.data?.students ?? studentsRes.data ?? [];
        const facultyData = facultyRes.data?.users ?? facultyRes.data?.faculty ?? facultyRes.data ?? [];
        const feedbackData = feedbackRes.data?.feedback ?? feedbackRes.data ?? [];

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setFaculty(Array.isArray(facultyData) ? facultyData : []);
        setFeedbackList(Array.isArray(feedbackData) ? feedbackData : []);
      } catch (err) {
        console.error("Error fetching dependencies:", err);
        setError("Failed to load dependency data (students/faculty).");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setNewFeedback({ ...newFeedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        sender_user_id: newFeedback.student_id,
        receiver_user_id: newFeedback.faculty_id,
        score: 5, // if you want sentiment -> keep text_content only and run analysis elsewhere
        comment: newFeedback.text_content
      };
      await api.post('/feedback', payload);
      setNewFeedback({ student_id: '', faculty_id: '', text_content: '' });

      const res = await api.get('/feedback');
      const data = res.data?.feedback ?? res.data ?? [];
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.error || "Failed to submit feedback. Check server connection.");
    }
  };

  if (loading) return <div className="p-8 text-center text-blue-500">Loading required data...</div>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Student Feedback Portal</h1>
      {error && <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-xl mb-10 border-t-4 border-orange-600">
        <h2 className="text-xl font-semibold mb-4">Submit Confidential Feedback</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Your Name (Student):</label>
            <select name="student_id" value={newFeedback.student_id} onChange={handleChange} required className="p-2 border rounded w-full">
              <option value="">-- Select Student --</option>
              {students.map(s => <option key={s.user_id ?? s.student_id} value={s.user_id ?? s.student_id}>{s.display_name ?? s.name}</option>)}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Faculty Member:</label>
            <select name="faculty_id" value={newFeedback.faculty_id} onChange={handleChange} required className="p-2 border rounded w-full">
              <option value="">-- Select Faculty --</option>
              {faculty.map(f => <option key={f.user_id ?? f.faculty_id} value={f.user_id ?? f.faculty_id}>{f.display_name ?? f.name}</option>)}
            </select>
          </div>

          <div className="col-span-4">
            <label className="block text-sm font-medium mb-1">Your Feedback (Required for analysis):</label>
            <textarea name="text_content" value={newFeedback.text_content} onChange={handleChange} required rows="3" className="p-2 border rounded w-full" placeholder="Type your feedback here..." />
          </div>

          <button type="submit" className="p-2 bg-orange-600 text-white rounded col-span-4">Submit Feedback for Sentiment Analysis</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Analysis Results (Management View) ({feedbackList.length})</h2>
        <div className="space-y-4">
          {feedbackList.map((f) => (
            <div key={f.id ?? f.feedback_id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2 border-b pb-2">
                <div className="text-sm text-gray-600">Submitted by: <span className="font-semibold text-gray-800">{f.sender_name ?? f.student_name ?? f.sender_user_id}</span> to: <span className="font-semibold text-gray-800">{f.receiver_name ?? f.faculty_name ?? f.receiver_user_id}</span></div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${f.sentiment==='Positive' ? 'bg-green-100 text-green-800' : f.sentiment==='Negative' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{f.sentiment ?? 'Pending'}</div>
              </div>
              <p className="text-sm text-gray-700 italic">"{f.comment ?? f.text_content}"</p>
              <p className="text-xs text-gray-400 mt-2 self-end">Submitted on: {new Date(f.created_on ?? f.submitted_on ?? f.date_submitted ?? Date.now()).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
        {feedbackList.length === 0 && <p className="text-center text-gray-500 py-6 text-lg">No feedback records found.</p>}
      </div>
    </div>
  );
}*/

// src/pages/FacultyManagement.jsx
// Updated to show ALL feedback for Admin/Management
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosInstance';

export default function FacultyManagement() {
  const { user } = useAuth();
  const [allFeedback, setAllFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' or 'faculty'

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'management') {
      fetchAllFeedback();
    }
  }, [user]);

  const fetchAllFeedback = async () => {
    try {
      setLoading(true);
      
      // Get all feedback from database
      const response = await axios.get('/api/feedback/all');
      
      console.log('All feedback:', response.data);
      setAllFeedback(response.data.feedback || []);
      
    } catch (err) {
      console.error('Error fetching all feedback:', err);
      setAllFeedback([]);
    } finally {
      setLoading(false);
    }
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

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        style={{
          fontSize: 18,
          color: index < score ? '#fbbf24' : '#e5e7eb',
          marginRight: 3
        }}
      >
        ★
      </span>
    ));
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
          Faculty Management 👥
        </h1>
        <p style={{
          fontSize: 16,
          color: '#64748b'
        }}>
          View and manage faculty feedback and performance
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 24,
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: 0
      }}>
        <button
          onClick={() => setActiveTab('feedback')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: activeTab === 'feedback' ? '#2dd4bf' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'feedback' ? '3px solid #2dd4bf' : '3px solid transparent',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: -2
          }}
        >
          📊 All Feedback
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: activeTab === 'faculty' ? '#2dd4bf' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'faculty' ? '3px solid #2dd4bf' : '3px solid transparent',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: -2
          }}
        >
          👨‍🏫 Faculty List
        </button>
      </div>

      {/* Content */}
      {activeTab === 'feedback' && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 20px rgba(15, 42, 61, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#0f2a3d'
            }}>
              All Student Feedback
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '8px 16px',
              background: '#f0f9ff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#0369a1'
            }}>
              <span>Total Feedback:</span>
              <span style={{ fontSize: 20, color: '#2dd4bf' }}>{allFeedback.length}</span>
            </div>
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: 18 }}>Loading feedback...</div>
            </div>
          ) : allFeedback.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                No feedback submitted yet
              </div>
              <div style={{ fontSize: 14 }}>
                Students haven't submitted any feedback
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              {allFeedback.map((feedback, index) => (
                <div
                  key={feedback.id || index}
                  style={{
                    padding: 20,
                    background: '#f8fafc',
                    borderRadius: 12,
                    borderLeft: `4px solid ${getSentimentColor(feedback.sentiment)}`,
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Header Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12
                  }}>
                    <div>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#0f2a3d',
                        marginBottom: 6
                      }}>
                        👨‍🎓 {feedback.student_name || 'Anonymous Student'}
                        <span style={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: '#64748b',
                          marginLeft: 12
                        }}>
                          → 👨‍🏫 {feedback.faculty_name || 'Faculty'}
                        </span>
                      </div>
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
                          {feedback.score || 0}/5
                        </span>
                      </div>
                    </div>

                    {/* Sentiment Badge */}
                    {feedback.sentiment && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 14px',
                        background: getSentimentColor(feedback.sentiment) + '20',
                        color: getSentimentColor(feedback.sentiment),
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600
                      }}>
                        <span style={{ fontSize: 18 }}>
                          {getSentimentEmoji(feedback.sentiment)}
                        </span>
                        {feedback.sentiment}
                      </div>
                    )}
                  </div>

                  {/* Feedback Comment */}
                  <p style={{
                    fontSize: 15,
                    color: '#475569',
                    lineHeight: 1.7,
                    marginBottom: 12,
                    fontStyle: 'italic'
                  }}>
                    "{feedback.comment || feedback.text_content || 'No comment provided'}"
                  </p>

                  {/* Footer Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                    color: '#94a3b8'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: 16
                    }}>
                      <span>📧 {feedback.student_email || 'N/A'}</span>
                    </div>
                    <span>
                      📅 {new Date(feedback.created_on || feedback.submitted_on).toLocaleDateString('en-US', {
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

      {/* Faculty Tab Content */}
      {activeTab === 'faculty' && (
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
            Faculty List
          </h2>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🏫</div>
            <div style={{ fontSize: 16 }}>
              Faculty management features coming soon
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

