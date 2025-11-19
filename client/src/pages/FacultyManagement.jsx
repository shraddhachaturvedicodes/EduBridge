// client/src/pages/FeedbackManager.jsx
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
}
