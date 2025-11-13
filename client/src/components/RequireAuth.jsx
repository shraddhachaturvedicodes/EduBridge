// client/src/components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap protected pages with <RequireAuth> ... </RequireAuth>
 * Expects your AuthContext to expose { user, loading } or similar.
 */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // show a small loading placeholder while auth state resolves
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  if (!user) {
    // redirect to login, preserve current location for post-login redirect
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // user present, render protected children
  return <>{children}</>;
}
