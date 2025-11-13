// client/src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearToken } from "../utils/auth"; // adjust path if needed

export default function Navbar() {
  const { user, setUser } = useAuth() || {};
  const navigate = useNavigate();

  const logout = () => {
    // clear local token/session and update auth context
    try {
      clearToken();
    } catch (e) { /* ignore if not present */ }
    if (setUser) setUser(null);
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <Link to="/" style={styles.brandLink}>EduBridge</Link>
      </div>

      <nav style={styles.nav}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/courses" style={styles.link}>Courses</Link>
        <Link to="/timetable" style={styles.link}>Timetable</Link>
        <Link to="/analytics" style={styles.link}>Analytics</Link>
        <Link to="/messages" style={styles.link}>Messages</Link>
        {!user ? (
          <Link to="/login" style={styles.link}>Login</Link>
        ) : (
          <>
            <span style={styles.user}> {user.display_name || user.email} </span>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px",
    borderBottom: "1px solid #eee",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  brand: { fontWeight: "700", fontSize: 18 },
  brandLink: { color: "#111", textDecoration: "none" },
  nav: { display: "flex", gap: 14, alignItems: "center" },
  link: { color: "#4a2", textDecoration: "underline", fontSize: 15 },
  user: { marginLeft: 8, fontSize: 14, color: "#333" },
  logoutBtn: {
    marginLeft: 8,
    background: "#ef5350",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
};
