// client/src/components/FacultyManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../axiosInstance'; // centralized axios instance with auth & baseURL

export default function FacultyManager() {
  const [faculty, setFaculty] = useState([]);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    expertise_areas: '', // comma separated string
    availability_status: 'Available'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function normalizeList(respData) {
    if (!respData) return [];
    if (Array.isArray(respData)) return respData;
    if (Array.isArray(respData.faculty)) return respData.faculty;
    if (Array.isArray(respData.users)) return respData.users;
    if (Array.isArray(respData.results)) return respData.results;
    if (Array.isArray(respData.rows)) return respData.rows;
    return [respData];
  }

  const fetchFaculty = async () => {
    setLoading(true);
    setError(null);
    try {
      let resp;
      try {
        resp = await api.get('/users', { params: { role: 'faculty' } });
      } catch (e) {
        try { resp = await api.get('/faculty'); } catch (e2) {
          resp = await api.get('/admin/faculty').catch(() => ({ data: [] }));
        }
      }
      const rows = normalizeList(resp.data);
      const normalized = rows.map(r => ({
        id: r.user_id ?? r.faculty_id ?? r.id ?? r._id ?? null,
        name: r.display_name ?? r.name ?? r.email ?? '',
        email: r.email ?? '',
        department: r.department ?? '',
        designation: r.designation ?? r.role ?? '',
        expertise_areas: Array.isArray(r.expertise_areas) ? r.expertise_areas : (typeof r.expertise === 'string' ? r.expertise.split(',').map(s=>s.trim()).filter(Boolean) : []),
        availability_status: r.availability_status ?? r.status ?? 'Available',
        raw: r
      }));
      setFaculty(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch faculty data. Is the Node.js server running and did you login as admin?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaculty(); }, []);

  const handleChange = (e) => {
    setNewFaculty({ ...newFaculty, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const expertiseArray = newFaculty.expertise_areas
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const payload = {
        email: newFaculty.email,
        display_name: newFaculty.name,
        department: newFaculty.department,
        designation: newFaculty.designation,
        expertise: expertiseArray.join(', '),
        availability_status: newFaculty.availability_status,
        temp_password: newFaculty.temp_password ?? (Math.random().toString(36).slice(-8) + 'A1!')
      };

      await api.post('/admin/faculty', payload);

      setNewFaculty({ name: '', email: '', department: '', designation: '', expertise_areas: '', availability_status: 'Available' });
      fetchFaculty();
    } catch (err) {
      console.error("Creation error:", err);
      setError(err.response?.data?.error || err.message || "Failed to add faculty member.");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return;
    try {
      await api.delete(`/users/${id}`).catch(async () => {
        await api.delete(`/faculty/${id}`);
      });
      setFaculty(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete faculty member. Check permissions.");
    }
  };

  if (loading) return <div className="p-8 text-center text-blue-500">Loading faculty data...</div>;

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Faculty Management System</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-xl mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Faculty (admin)</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <input type="text" name="name" value={newFaculty.name} onChange={handleChange} placeholder="Name" required className="p-2 border rounded col-span-2" />
          <input type="email" name="email" value={newFaculty.email} onChange={handleChange} placeholder="Email (Unique)" required className="p-2 border rounded col-span-2" />
          <input type="text" name="department" value={newFaculty.department} onChange={handleChange} placeholder="Department" className="p-2 border rounded col-span-1" />
          <input type="text" name="designation" value={newFaculty.designation} onChange={handleChange} placeholder="Designation" className="p-2 border rounded col-span-1" />
          <input type="text" name="expertise_areas" value={newFaculty.expertise_areas} onChange={handleChange} placeholder="Expertise (comma separated)" className="p-2 border rounded col-span-4" />
          <select name="availability_status" value={newFaculty.availability_status} onChange={handleChange} className="p-2 border rounded col-span-1">
            <option>Available</option>
            <option>Limited</option>
            <option>Full Load</option>
          </select>
          <button type="submit" className="p-2 bg-blue-600 text-white rounded col-span-1">Add Faculty</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Faculty ({faculty.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold">Name (ID)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Department / Designation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold">Expertise Areas</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-2 text-sm font-medium">{f.name} ({f.id})<p className="text-xs text-gray-500">{f.email}</p></td>
                  <td className="px-4 py-2 text-sm">{f.department} / {f.designation}</td>
                  <td className="px-4 py-2 text-sm">{f.expertise_areas && f.expertise_areas.join(', ')}</td>
                  <td className="px-4 py-2 text-center text-sm"><span className={`px-2 py-1 rounded-full text-xs ${f.availability_status==='Available' ? 'bg-green-100 text-green-800' : f.availability_status==='Limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{f.availability_status}</span></td>
                  <td className="px-4 py-2 text-center text-sm">
                    <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {faculty.length === 0 && <p className="text-center text-gray-500 py-6">No faculty members found. Add one above!</p>}
      </div>
    </div>
  );
}
