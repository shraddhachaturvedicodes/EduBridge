import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/faculty';

function FacultyManager() {
    const [faculty, setFaculty] = useState([]);
    const [newFaculty, setNewFaculty] = useState({ 
        name: '', 
        email: '', 
        department: '', 
        designation: '',
        expertise_areas: '', // Comma separated string for input
        availability_status: 'Available' // Default value
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- READ Operation: Fetch all faculty ---
    const fetchFaculty = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_BASE_URL);
            setFaculty(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to fetch faculty data. Is the Node.js server running?");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        setNewFaculty({ ...newFaculty, [e.target.name]: e.target.value });
    };

    // --- CREATE Operation: Add new faculty ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Prepare expertise_areas: Split comma-separated interests into an array for PostgreSQL
            const expertiseArray = newFaculty.expertise_areas
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);

            const dataToSend = {
                ...newFaculty,
                expertise_areas: expertiseArray, // Send as array
            };

            await axios.post(API_BASE_URL, dataToSend);
            
            // Clear form and refresh list
            setNewFaculty({ name: '', email: '', department: '', designation: '', expertise_areas: '', availability_status: 'Available' });
            fetchFaculty();
        } catch (err) {
            console.error("Creation error:", err);
            setError(err.response?.data?.error || "Failed to add faculty member. Check unique email/data types.");
        }
    };

    // --- DELETE Operation ---
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this faculty member?")) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                // Optimistically update the UI: remove the deleted item from the current state
                setFaculty(faculty.filter(f => f.faculty_id !== id));
            } catch (err) {
                console.error("Delete error:", err);
                setError("Failed to delete faculty member.");
            }
        }
    };

    // --- RENDER ---
    if (loading) return <div className="p-8 text-center text-blue-500">Loading faculty data...</div>;

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Faculty Management System</h1>
            
            {/* Display errors */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">API Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {/* --- CREATE Form Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl mb-10">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Faculty</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    
                    {/* Name */}
                    <input
                        type="text"
                        name="name"
                        value={newFaculty.name}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-2"
                    />

                    {/* Email */}
                    <input
                        type="email"
                        name="email"
                        value={newFaculty.email}
                        onChange={handleChange}
                        placeholder="Email (Unique)"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-2"
                    />

                    {/* Department */}
                    <input
                        type="text"
                        name="department"
                        value={newFaculty.department}
                        onChange={handleChange}
                        placeholder="Department"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-1"
                    />

                    {/* Designation */}
                     <input
                        type="text"
                        name="designation"
                        value={newFaculty.designation}
                        onChange={handleChange}
                        placeholder="Designation"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-1"
                    />
                    
                    {/* Expertise Areas */}
                    <input
                        type="text"
                        name="expertise_areas"
                        value={newFaculty.expertise_areas}
                        onChange={handleChange}
                        placeholder="Expertise (comma, separated, list for Rec. Eng.)"
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-4"
                    />

                    {/* Availability Status */}
                    <select
                        name="availability_status"
                        value={newFaculty.availability_status}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-1"
                    >
                        <option value="Available">Available</option>
                        <option value="Limited">Limited</option>
                        <option value="Full Load">Full Load</option>
                    </select>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="p-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-lg col-span-1"
                    >
                        Add Faculty
                    </button>
                </form>
            </div>

            {/* --- READ List Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Faculty ({faculty.length})</h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (ID)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department / Designation</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expertise Areas</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {faculty.map((f) => (
                                <tr key={f.faculty_id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {f.name} ({f.faculty_id})
                                        <p className='text-xs text-gray-500'>{f.email}</p>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                        {f.department} / {f.designation}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-800">
                                        {f.expertise_areas && f.expertise_areas.join(', ')}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${f.availability_status === 'Available' ? 'bg-green-100 text-green-800' : 
                                              f.availability_status === 'Limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {f.availability_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(f.faculty_id)}
                                            className="text-red-600 hover:text-red-800 font-bold p-1 rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {faculty.length === 0 && (
                    <p className="text-center text-gray-500 py-6 text-lg">No faculty members found. Add one above!</p>
                )}
            </div>
        </div>
    );
}

export default FacultyManager;
