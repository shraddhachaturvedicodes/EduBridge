import React, { useState } from 'react';
import FacultyManager from './components/FacultyManager';
import StudentManager from './components/StudentManager';
import NoticeManager from './components/NoticeManager';
import RecommendationEngine from './components/RecommendationEngine';
import FeedbackManager from './components/FeedbackManager'; 
import RankingAnalytics from './components/RankingAnalytics'; // NEW IMPORT
import './index.css';

function App() {
  const [activeScreen, setActiveScreen] = useState('faculty'); // 'faculty' is the default screen

  const NavButton = ({ screen, label }) => (
    <button
      onClick={() => setActiveScreen(screen)}
      className={`py-2 px-4 rounded-t-lg font-semibold transition-colors 
        ${activeScreen === screen 
          ? 'bg-white text-blue-600 shadow-t-lg' // Active style
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // Inactive style
        }`
      }
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="shadow-lg bg-white sticky top-0 z-10">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900">EduBridge <span className="text-blue-600 text-sm font-medium">| DBMS Project</span></h1>
          <nav className="flex space-x-2">
            <NavButton screen="faculty" label="Faculty Management" />
            <NavButton screen="student" label="Student Management" />
            <NavButton screen="management" label="Management Dashboard" />
            <NavButton screen="recommendation" label="Recommendation Engine" /> 
            <NavButton screen="feedback" label="Submit Feedback" /> 
            <NavButton screen="ranking" label="Ranking Analytics" /> 
          </nav>
        </div>
      </header>

      <main className="pt-8">
        {activeScreen === 'faculty' && <FacultyManager />}
        {activeScreen === 'student' && <StudentManager />}
        {activeScreen === 'management' && <NoticeManager />}
        {activeScreen === 'recommendation' && <RecommendationEngine />}
        {activeScreen === 'feedback' && <FeedbackManager />}
        {activeScreen === 'ranking' && <RankingAnalytics />}
      </main>
    </div>
  );
}

export default App;