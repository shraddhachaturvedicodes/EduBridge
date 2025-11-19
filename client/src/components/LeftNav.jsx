// client/src/components/LeftNav.jsx
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Reusable left sidebar used across protected pages.
 * Shows active item highlight based on current location.
 *
 * Changes:
 *  - Removed Courses button (project decision).
 *  - Submit Feedback now navigates to /feedback.
 *  - Faculty/Student management items only visible to admin.
 */

export default function LeftNav({ style }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const canPostNotice = useMemo(() => {
    const r = (user && user.role) || "";
    return ["faculty", "management", "admin"].includes(String(r).toLowerCase());
  }, [user]);

  const canManageUsers = useMemo(() => {
    const r = (user && user.role) || "";
    return String(r).toLowerCase() === "admin";
  }, [user]);

  // find active by looking at pathname
  const activePath = useMemo(() => {
    const p = location.pathname || "/";
    if (p === "/" || p.startsWith("/dashboard")) return "/dashboard";
    if (p.startsWith("/faculty-management")) return "/faculty-management";
    if (p.startsWith("/student-management")) return "/student-management";
    if (p.startsWith("/recommendations")) return "/recommendations";
    if (p.startsWith("/feedback")) return "/feedback";
    if (p.startsWith("/analytics")) return "/analytics";
    if (p.startsWith("/timetable")) return "/timetable";
    if (p.startsWith("/messages")) return "/messages";
    return "/";
  }, [location.pathname]);

  // Build nav items dynamically (so we can conditionally include admin-only items)
  const baseItems = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { key: "recommend", label: "Recommendation Engine", path: "/recommendations", icon: "🔁" },
    { key: "feedback", label: "Submit Feedback", path: "/feedback", icon: "💬" },
    { key: "analytics", label: "Ranking Analytics", path: "/analytics", icon: "📊" },
    { key: "timetable", label: "Timetable", path: "/timetable", icon: "📋" },
    { key: "messages", label: "Messages", path: "/messages", icon: "✉️" },
  ];

  // Insert admin-only management entries near the top (if admin)
  const navItems = [...baseItems];
  if (canManageUsers) {
    // put management items right after Dashboard
    navItems.splice(1, 0,
      { key: "faculty", label: "Faculty Management", path: "/faculty-management", icon: "👥" },
      { key: "students", label: "Student Management", path: "/student-management", icon: "🎓" }
    );
  }

  function go(path) {
    navigate(path);
  }

  return (
    <aside style={{
      width: 220,
      background: "#0f3553",
      color: "#fff",
      borderRadius: 12,
      padding: "20px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      boxShadow: "0 10px 30px rgba(5,25,40,0.08)",
      ...style
    }}>
      <div style={{ fontWeight: 800, fontSize: 16 }}>DASHBOARD</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
        {navItems.map(item => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.key}
              onClick={() => go(item.path)}
              style={{
                textAlign: "left",
                border: 0,
                background: isActive ? "#133955" : "transparent",
                color: "#fff",
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: isActive ? "inset 0 2px 6px rgba(0,0,0,0.15)" : "none",
                transition: "background .15s ease"
              }}
            >
              <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontWeight: 600 }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", fontSize: 12, color: "#cfe8ff" }}>
        {canPostNotice ? "You can post notices" : "Notice posting restricted"}
      </div>
    </aside>
  );
}
