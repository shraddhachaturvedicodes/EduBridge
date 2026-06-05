// client/src/components/NoticeManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api/notices';

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function NoticeManager() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    target_role: 'ALL',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: getAuthHeaders()
      });
      setNotices(response.data?.notices || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch notices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleChange = (e) => {
    setNewNotice({ ...newNotice, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(API_BASE_URL, newNotice, {
        headers: getAuthHeaders()
      });
      setNewNotice({ title: '', content: '', target_role: 'ALL' });
      fetchNotices();
    } catch (err) {
      console.error("Creation error:", err);
      setError(err.response?.data?.error || "Failed to post notice.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: getAuthHeaders()
        });
        setNotices(notices.filter(n => n.notice_id !== id));
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete notice.");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-blue-500">Loading notices...</div>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">
        Management Dashboard: Announcements
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* CREATE Form */}
      <div className="bg-white p-6 rounded-lg shadow-xl mb-10 border-t-4 border-blue-600">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Post New Announcement</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <input
            type="text"
            name="title"
            value={newNotice.title}
            onChange={handleChange}
            placeholder="Notice Title (e.g., Exam Schedule Updated)"
            required
            className="p-2 border border-gray-300 rounded-md col-span-3"
          />
          <select
            name="target_role"
            value={newNotice.target_role}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md col-span-1"
          >
            <option value="ALL">ALL (Everyone)</option>
            <option value="STUDENTS">STUDENTS Only</option>
            <option value="FACULTY">FACULTY Only</option>
            <option value="MANAGEMENT">MANAGEMENT Only</option>
          </select>
          <textarea
            name="content"
            value={newNotice.content}
            onChange={handleChange}
            placeholder="Detailed content of the notice..."
            required
            rows="3"
            className="p-2 border border-gray-300 rounded-md col-span-5 resize-none"
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors col-span-1"
          >
            Post Notice
          </button>
        </form>
      </div>

      {/* READ List */}
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Active Announcements ({notices.length})
        </h2>
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.notice_id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex justify-between items-start"
            >
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Posted: {new Date(n.posted_on).toLocaleDateString()} | Target:
                  <span className={`font-semibold ml-1 ${
                    n.target_role === 'ALL'        ? 'text-purple-600' :
                    n.target_role === 'STUDENTS'   ? 'text-green-600'  :
                    n.target_role === 'FACULTY'    ? 'text-orange-600' :
                                                     'text-blue-600'
                  }`}>
                    {n.target_role}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-700 mt-1">{n.content}</p>
              </div>
              <button
                onClick={() => handleDelete(n.notice_id)}
                className="text-red-600 hover:text-red-800 font-bold p-1 rounded text-sm flex-shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        {notices.length === 0 && (
          <p className="text-center text-gray-500 py-6 text-lg">No announcements currently posted.</p>
        )}
      </div>
    </div>
  );
}

export default NoticeManager;