import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function FeedbackManager() {
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

    // --- Data Fetching (Students, Faculty, Feedback) ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [studentsRes, facultyRes, feedbackRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/students`),
                    axios.get(`${API_BASE_URL}/faculty`),
                    axios.get(`${API_BASE_URL}/feedback`),
                ]);

                setStudents(studentsRes.data);
                setFaculty(facultyRes.data);
                setFeedbackList(feedbackRes.data);
            } catch (err) {
                console.error("Error fetching dependencies:", err);
                setError("Failed to load dependency data (students/faculty).");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        setNewFeedback({ ...newFeedback, [e.target.name]: e.target.value });
    };

    // --- CREATE Operation: Submit Feedback ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/feedback`, newFeedback);
            
            // Clear form and refresh list
            setNewFeedback({ student_id: '', faculty_id: '', text_content: '' });
            
            // Only refresh feedback list, not dependencies
            const feedbackRes = await axios.get(`${API_BASE_URL}/feedback`);
            setFeedbackList(feedbackRes.data);

        } catch (err) {
            console.error("Submission error:", err);
            setError(err.response?.data?.error || "Failed to submit feedback. Check server connection.");
        }
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'Positive': return 'bg-green-100 text-green-800';
            case 'Negative': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (loading) return <div className="p-8 text-center text-blue-500">Loading required data...</div>;

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">Student Feedback Portal</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">API Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            {/* --- CREATE Form Section --- */}
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
                            className="p-2 border border-gray-300 rounded-md w-full focus:ring-orange-600 focus:border-orange-600"
                        >
                            <option value="">-- Select Student --</option>
                            {students.map(s => (
                                <option key={s.student_id} value={s.student_id}>
                                    {s.name} ({s.major})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Faculty Selector */}
                    <div className="col-span-1">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Member:</label>
                        <select
                            name="faculty_id"
                            value={newFeedback.faculty_id}
                            onChange={handleChange}
                            required
                            className="p-2 border border-gray-300 rounded-md w-full focus:ring-orange-600 focus:border-orange-600"
                        >
                            <option value="">-- Select Faculty --</option>
                            {faculty.map(f => (
                                <option key={f.faculty_id} value={f.faculty_id}>
                                    {f.name} ({f.department})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Text Content */}
                    <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback (Required for analysis):</label>
                        <textarea
                            name="text_content"
                            value={newFeedback.text_content}
                            onChange={handleChange}
                            placeholder="Type your feedback here (e.g., 'The lecturer explained the concepts very clearly, I learned a lot!')"
                            required
                            rows="3"
                            className="p-2 border border-gray-300 rounded-md focus:ring-orange-600 focus:border-orange-600 w-full resize-none"
                        />
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="p-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors shadow-lg col-span-4"
                    >
                        Submit Feedback for Sentiment Analysis
                    </button>
                </form>
            </div>

            {/* --- READ List Section (Analysis Results) --- */}
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Analysis Results (Management View) ({feedbackList.length})</h2>
                
                <div className="space-y-4">
                    {feedbackList.map((f) => (
                        <div key={f.feedback_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col">
                            
                            <div className="flex justify-between items-center mb-2 border-b pb-2">
                                <div className="text-sm font-medium text-gray-600">
                                    Submitted by: <span className="font-semibold text-gray-800">{f.student_name}</span> 
                                    to: <span className="font-semibold text-gray-800">{f.faculty_name}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSentimentColor(f.sentiment)}`}>
                                    Sentiment: {f.sentiment || 'Pending'}
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 italic">
                                "{f.text_content}"
                            </p>
                            <p className="text-xs text-gray-400 mt-2 self-end">
                                Submitted on: {new Date(f.submitted_on).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>

                {feedbackList.length === 0 && (
                    <p className="text-center text-gray-500 py-6 text-lg">No feedback records found.</p>
                )}
            </div>
        </div>
    );
}

export default FeedbackManager;