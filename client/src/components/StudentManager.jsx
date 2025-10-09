import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/students';

function StudentManager() {
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({ 
        name: '', 
        email: '', 
        major: '', 
        enrollment_year: '',
        interest_areas: '', // Comma separated string for input
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- READ Operation: Fetch all students ---
    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_BASE_URL);
            setStudents(response.data); 
            setLoading(false);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to fetch student data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
    };

    // --- CREATE Operation: Add new student ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // Prepare data: Split comma-separated interest areas into an array for PostgreSQL
            const interestsArray = newStudent.interest_areas
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);

            const dataToSend = {
                ...newStudent,
                enrollment_year: parseInt(newStudent.enrollment_year),
                interest_areas: interestsArray, 
            };

            await axios.post(API_BASE_URL, dataToSend);
            
            // Clear form and refresh list
            setNewStudent({ name: '', email: '', major: '', enrollment_year: '', interest_areas: '' });
            fetchStudents();
        } catch (err) {
            console.error("Creation error:", err);
            setError(err.response?.data?.error || "Failed to add student. Check unique email/data types.");
        }
    };

    // --- DELETE Operation ---
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                setStudents(students.filter(s => s.student_id !== id));
            } catch (err) {
                console.error("Delete error:", err);
                setError("Failed to delete student.");
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-blue-500">Loading student data...</div>;

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Student Management System</h1>
            
            {/* Display error messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">API Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {/* --- CREATE Form Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl mb-10">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Student</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    
                    {/* Name */}
                    <input
                        type="text"
                        name="name"
                        value={newStudent.name}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-1"
                    />

                    {/* Email */}
                    <input
                        type="email"
                        name="email"
                        value={newStudent.email}
                        onChange={handleChange}
                        placeholder="Email (Unique)"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-1"
                    />

                    {/* Major */}
                    <input
                        type="text"
                        name="major"
                        value={newStudent.major}
                        onChange={handleChange}
                        placeholder="Major (e.g., CSE)"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-1"
                    />
                    
                    {/* Enrollment Year */}
                    <input
                        type="number"
                        name="enrollment_year"
                        value={newStudent.enrollment_year}
                        onChange={handleChange}
                        placeholder="Enrollment Year (e.g., 2023)"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-1"
                    />

                    {/* Interest Areas */}
                    <input
                        type="text"
                        name="interest_areas"
                        value={newStudent.interest_areas}
                        onChange={handleChange}
                        placeholder="Interests (comma, separated, list for Rec. Eng.)"
                        required
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-600 focus:border-blue-600 col-span-4"
                    />
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="p-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors shadow-lg col-span-1"
                    >
                        Add Student
                    </button>
                </form>
            </div>

            {/* --- READ List Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Students ({students.length})</h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Major (Year)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Research Interests</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((s) => (
                                <tr key={s.student_id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{s.student_id}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{s.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{s.major} ({s.enrollment_year})</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">
                                        {s.interest_areas && s.interest_areas.join(', ')}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(s.student_id)}
                                            className="text-red-600 hover:text-red-800 font-bold p-1 rounded hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {students.length === 0 && (
                    <p className="text-center text-gray-500 py-6 text-lg">No student records found. Add one above!</p>
                )}
            </div>
        </div>
    );
}

export default StudentManager;