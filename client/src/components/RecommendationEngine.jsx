import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function RecommendationEngine() {
    const [students, setStudents] = useState([]);
    const [recommendedFaculty, setRecommendedFaculty] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch list of all students to populate the dropdown
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/students`);
                setStudents(response.data);
            } catch (err) {
                console.error("Error fetching students:", err);
                setError("Failed to load student list.");
            }
        };
        fetchStudents();
    }, []);

    // Function to fetch recommendations when a student is selected
    const fetchRecommendations = async (studentId) => {
        if (!studentId) {
            setRecommendedFaculty([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/recommendations/${studentId}`);
            setRecommendedFaculty(response.data);
        } catch (err) {
            console.error("Error fetching recommendations:", err);
            setError("Could not retrieve recommendations. Check server logs.");
        } finally {
            setLoading(false);
        }
    };

    // Handle dropdown change
    const handleStudentChange = (e) => {
        const id = e.target.value;
        setSelectedStudentId(id);
        fetchRecommendations(id);
    };

    const selectedStudent = students.find(s => s.student_id == selectedStudentId);

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Research Recommendation Engine</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">API Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {/* --- Student Selection --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl mb-10 border-t-4 border-purple-600">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Student for Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    
                    {/* Dropdown Selector */}
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student:</label>
                        <select
                            value={selectedStudentId}
                            onChange={handleStudentChange}
                            className="p-2 border border-gray-300 rounded-md w-full focus:ring-purple-600 focus:border-purple-600"
                        >
                            <option value="">-- Select a Student --</option>
                            {students.map(s => (
                                <option key={s.student_id} value={s.student_id}>
                                    {s.name} ({s.major})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Display Student Interests */}
                    <div className="col-span-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-purple-800">
                            Student Research Interests:
                        </p>
                        <p className="text-sm text-purple-700 mt-1">
                            {selectedStudent 
                                ? (selectedStudent.interest_areas && selectedStudent.interest_areas.length > 0
                                    ? selectedStudent.interest_areas.join(', ')
                                    : "No interests defined for this student.")
                                : "Select a student to view their interests."}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Recommendation Results --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Recommended Faculty ({recommendedFaculty.length})
                </h2>

                {loading && <div className="p-8 text-center text-purple-500">Generating recommendations...</div>}
                
                {!selectedStudentId && (
                    <p className="text-center text-gray-500 py-6 text-lg">Please select a student above to find matching faculty.</p>
                )}

                {selectedStudentId && !loading && recommendedFaculty.length === 0 && (
                    <p className="text-center text-gray-500 py-6 text-lg">No faculty found with matching expertise areas.</p>
                )}

                {recommendedFaculty.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name (Email)</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department / Designation</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Matching Expertise</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recommendedFaculty.map((f) => (
                                    <tr key={f.faculty_id} className="hover:bg-purple-50/50 transition-colors">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {f.name}
                                            <p className='text-xs text-gray-500'>{f.email}</p>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                            {f.department} / {f.designation}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-800 font-medium text-purple-700">
                                            {/* We rely on the frontend to calculate which interests matched, but for now we show all expertise */}
                                            {f.expertise_areas && f.expertise_areas.join(', ')}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${f.availability_status === 'Available' ? 'bg-green-100 text-green-800' : 
                                                  f.availability_status === 'Limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {f.availability_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecommendationEngine;