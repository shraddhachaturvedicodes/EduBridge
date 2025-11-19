// client/src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import LeftNav from "./components/LeftNav";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Messages = lazy(() => import("./pages/Messages"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Courses = lazy(() => import("./pages/Courses"));
const Timetable = lazy(() => import("./pages/Timetable"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optional management pages you mentioned earlier
const FacultyManagement = lazy(() => import("./pages/FacultyManagement"));
const StudentManagement = lazy(() => import("./pages/StudentManagement"));

// NEW: feedback page (student feedback manager)
const FeedbackManager = lazy(() => import("./pages/FeedbackManager"));

/**
 * ProtectedRoute: small wrapper that checks auth context and redirects
 * to /login when there is no logged-in user. Shows a simple Loading UI
 * while auth initializes to avoid flicker or unnecessary requests.
 */
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

/**
 * ProtectedLayout: layout for protected pages that should show the left sidebar.
 * It renders LeftNav on the left and the page content on the right.
 *
 * Use it as: element={<ProtectedLayout><MyPage/></ProtectedLayout>}
 */
function ProtectedLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", gap: 20 }}>
      {/* Left sidebar (consistent across all protected pages) */}
      <LeftNav style={{ flex: "0 0 220px", margin: 20 }} />

      {/* Main area: navbar is above so we only place page content here */}
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
        {/* Global top navbar (keeps working behavior) */}
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes with left sidebar layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
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

          {/* Feedback page (students submit feedback / management view) */}
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

          {/* Management pages (only visible/accessible to admin via LeftNav items) */}
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

          {/* Fallback */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <NotFound />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
