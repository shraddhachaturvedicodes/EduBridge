// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import LeftNav from "./components/LeftNav";

// PUBLIC PAGES (New Landing Pages)
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Features = lazy(() => import("./pages/Features"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));

// PROTECTED PAGES (Dashboard Pages)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Courses = lazy(() => import("./pages/Courses"));
const Timetable = lazy(() => import("./pages/Timetable"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FacultyManagement = lazy(() => import("./pages/FacultyManagement"));
const StudentManagement = lazy(() => import("./pages/StudentManagement"));
const FeedbackManager = lazy(() => import("./pages/FeedbackManager"));

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function ProtectedLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", gap: 20 }}>
      <LeftNav style={{ flex: "0 0 220px", margin: 20 }} />
      <main style={{ flex: 1, padding: 20 }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <Navbar />

        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Messages />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Recommendations />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Courses />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/timetable"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Timetable />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Analytics />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <FeedbackManager />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-management"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <FacultyManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-management"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <StudentManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}