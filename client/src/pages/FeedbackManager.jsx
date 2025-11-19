// client/src/pages/FeedbackManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';

/**
 * Robust FeedbackManager:
 * - Tries multiple endpoints for students and faculty to handle backend shape differences.
 * - Gracefully handles 400/500 and shows friendly UI messages.
 */

function normalizeList(resp) {
  if (!resp) return [];
  const d = resp.data ?? {};
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.students)) return d.students;
  if (Array.isArray(d.users)) return d.users;
  if (Array.isArray(d.faculty)) return d.faculty;
  if (Array.isArray(d.rows)) return d.rows;
  if (Array.isArray(d.results)) return d.results;
  return [];
}

async function fetchFeedbackOnly() {
  try {
    const resp = await api.get('/feedback', { params: {} });
    const list = Array.isArray(resp.data?.feedback) ? resp.data.feedback : (Array.isArray(resp.data) ? resp.data : []);
    setFeedbackList(list);
    return true;
  } catch (err) {
    console.warn('[FeedbackManager] /feedback failed', err?.response?.status, err?.response?.data || err?.message);
    // if backend needs teacher_id, do nothing — we'll keep list empty but won't crash
    return false;
  }
}

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

  // Try a set of endpoints in order and return first successful non-empty array
  async function tryEndpointsForList(endpoints) {
    for (const ep of endpoints) {
      try {
        const resp = await api.get(ep.url, { params: ep.params || {} });
        const list = normalizeList(resp);
        // accept any truthy array (can be empty too - but still valid)
        return { ok: true, data: list, raw: resp.data };
      } catch (err) {
        // Log details, but continue to next candidate
        console.warn(`[FeedbackManager] endpoint ${ep.url} failed`, err?.response?.status, err?.response?.data || err.message);
      }
    }
    return { ok: false, data: [] };
  }

  async function fetchData() {
    setLoading(true);
    setError(null);

    // STUDENTS — try multiple common endpoints
    try {
      const studentCandidates = [
        { url: '/students' },
        { url: '/api/students' }, // axiosInstance will prefix /api, but trying just in case
        { url: '/users', params: { roles: 'student' } },
        { url: '/users', params: { role: 'student' } },
        { url: '/admin/students' },
      ];
      const sres = await tryEndpointsForList(studentCandidates);
      if (sres.ok) setStudents(sres.data);
      else setStudents([]); // empty if nothing found
    } catch (e) {
      console.error("Failed to load students", e);
      setStudents([]);
    }

    // FACULTY — try multiple endpoints
    try {
      const facCandidates = [
        { url: '/users', params: { roles: 'faculty' } },
        { url: '/users', params: { role: 'faculty' } },
        { url: '/faculty' },
        { url: '/admin/faculty' }
      ];
      const fres = await tryEndpointsForList(facCandidates);
      if (fres.ok) setFaculty(fres.data);
      else setFaculty([]);
    } catch (e) {
      console.error("Failed to load faculty", e);
      setFaculty([]);
    }

    // FEEDBACK — try to retrieve aggregated feedback; backend may require teacher_id
    try {
      // Try 1: try fetching all feedback (management view)
      try {
        const fb1 = await api.get('/feedback');
        setFeedbackList(Array.isArray(fb1.data?.feedback) ? fb1.data.feedback : (Array.isArray(fb1.data) ? fb1.data : []));
      } catch (err1) {
        // If 400, backend expects teacher_id; if 500 or other, we try fallback endpoints
        const status = err1?.response?.status;
        console.warn('[FeedbackManager] /feedback failed', status, err1?.response?.data || err1.message);
        if (status === 400) {
          // backend requires teacher_id — try admin summary or limited fetches
          try {
            const fb2 = await api.get('/feedback', { params: { limit: 200 } });
            setFeedbackList(Array.isArray(fb2.data?.feedback) ? fb2.data.feedback : (Array.isArray(fb2.data) ? fb2.data : []));
          } catch (err2) {
            // try admin/fallback endpoints
            try {
              const fb3 = await api.get('/admin/feedback');
              setFeedbackList(normalizeList(fb3));
            } catch (err3) {
              console.warn('[FeedbackManager] all feedback endpoints failed', err3?.response?.status, err3?.response?.data);
              setFeedbackList([]);
            }
          }
        } else {
          // status 500 or other: try admin/alternate endpoints
          try {
            const fbAlt = await api.get('/admin/feedback');
            setFeedbackList(normalizeList(fbAlt));
          } catch (errAlt) {
            console.warn('[FeedbackManager] fallback feedback endpoints failed', errAlt?.response?.data || errAlt.message);
            setFeedbackList([]);
          }
        }
      }
    } catch (e) {
      console.error("Unexpected error while loading feedback", e);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setNewFeedback({ ...newFeedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  if (!newFeedback.student_id || !newFeedback.faculty_id || !newFeedback.text_content) {
    setError('Please select student, faculty and write feedback text.');
    return;
  }

  try {
    // --- PAYLOAD: try two naming shapes because backends differ often ---
    const payloadVariants = [
      // variant A — earlier shape we used (sender_user_id etc.)
      {
        sender_user_id: newFeedback.student_id,
        receiver_user_id: newFeedback.faculty_id,
        comment: newFeedback.text_content,
        score: newFeedback.score ?? 5
      },
      // variant B — some backends expect student_id / faculty_id / text
      {
        student_id: newFeedback.student_id,
        faculty_id: newFeedback.faculty_id,
        text: newFeedback.text_content
      }
    ];

    let posted = false;
    for (const payload of payloadVariants) {
      try {
        const res = await api.post('/feedback', payload);
        console.info('[FeedbackManager] posted feedback ok', res?.status);
        posted = true;
        break;
      } catch (err) {
        console.warn('[FeedbackManager] POST /feedback failed for payload shape', err?.response?.status, err?.response?.data || err?.message);
        // try next payload shape
      }
    }

    if (!posted) {
      throw new Error('All POST attempts failed; check backend expected payload fields.');
    }

    // only refresh feedback list (not students)
    await fetchFeedbackOnly();

    setNewFeedback({ student_id: '', faculty_id: '', text_content: '' });
  } catch (err) {
    console.error('Submission error', err);
    setError(err?.response?.data?.error || err?.message || 'Failed to submit feedback');
  }
};

  if (loading) return <div className="p-8 text-center text-blue-500">Loading required data...</div>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Student Feedback Portal</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-xl mb-10 border-t-4 border-orange-600">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Submit Confidential Feedback</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

          {/* Student Selector */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (Student):</label>
            <select
              name="student_id"
              value={newFeedback.student_id}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.user_id ?? s.student_id ?? s.id} value={s.user_id ?? s.student_id ?? s.id}>
                  {s.display_name ?? s.name ?? s.email ?? `Student ${s.user_id ?? s.student_id ?? s.id}`}
                </option>
              ))}
            </select>
            {students.length === 0 && <div className="text-xs text-gray-500 mt-1">No students found. Check backend route /api/students or /api/users?roles=student.</div>}
          </div>

          {/* Faculty Selector */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Member:</label>
            <select
              name="faculty_id"
              value={newFeedback.faculty_id}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="">-- Select Faculty --</option>
              {faculty.map(f => (
                <option key={f.user_id ?? f.faculty_id ?? f.id} value={f.user_id ?? f.faculty_id ?? f.id}>
                  {f.display_name ?? f.name ?? f.email ?? `Faculty ${f.user_id ?? f.faculty_id ?? f.id}`}
                </option>
              ))}
            </select>
            {faculty.length === 0 && <div className="text-xs text-gray-500 mt-1">No faculty found. Check backend route /api/faculty or /api/users?roles=faculty.</div>}
          </div>

          {/* Text Content */}
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback (Required for analysis):</label>
            <textarea
              name="text_content"
              value={newFeedback.text_content}
              onChange={handleChange}
              placeholder="Type your feedback here (e.g., 'The lecturer explained the concepts very clearly')"
              required
              rows="3"
              className="p-2 border border-gray-300 rounded-md w-full resize-none"
            />
          </div>

          <button type="submit" className="p-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors shadow-lg col-span-4">
            Submit Feedback for Sentiment Analysis
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Analysis Results (Management View) ({feedbackList.length})</h2>

        <div className="space-y-4">
          {feedbackList.map((f) => (
            <div key={f.id ?? f.feedback_id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2 border-b pb-2">
                <div className="text-sm text-gray-600">Submitted by: <span className="font-semibold text-gray-800">{f.sender_name ?? f.student_name ?? f.sender_user_id}</span> to: <span className="font-semibold text-gray-800">{f.receiver_name ?? f.faculty_name ?? f.receiver_user_id}</span></div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${f.sentiment==='Positive' ? 'bg-green-100 text-green-800' : f.sentiment==='Negative' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{f.sentiment ?? 'Pending'}</div>
              </div>
              <p className="text-sm text-gray-700 italic">"{f.comment ?? f.text_content}"</p>
              <p className="text-xs text-gray-400 mt-2 self-end">Submitted on: {new Date(f.created_on ?? f.submitted_on ?? f.date_submitted ?? Date.now()).toLocaleDateString()}</p>
            </div>
          ))}
          {feedbackList.length === 0 && <p className="text-center text-gray-500 py-6 text-lg">No feedback records found (or backend returned an error). See console for details.</p>}
        </div>
      </div>
    </div>
  );
}
