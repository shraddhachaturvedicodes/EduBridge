// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        color: isActive ? '#fff' : 'rgba(255,255,255,0.9)',
        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
        textDecoration: 'none',
        fontSize: 15
      })}
    >
      {children}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="sidebar" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div>
        <div className="brand" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="logo">EB</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>EduBridge</div>
            <div className="small-muted" style={{ fontSize: 12 }}>DBMS Dashboard</div>
          </div>
        </div>

        <nav style={{ marginTop: 22 }}>
  <NavItem to="/"> Dashboard</NavItem>
  <NavItem to="/faculty"> Faculty Management</NavItem>
  <NavItem to="/students"> Student Management</NavItem>
  <NavItem to="/feedback"> Submit Feedback</NavItem>
  <NavItem to="/analytics"> Ranking Analytics</NavItem>
  <NavItem to="/recommendations"> Recommendations</NavItem>
  <NavItem to="/courses"> Courses</NavItem>
  <NavItem to="/timetable"> Timetable</NavItem>

</nav>
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
        <div>Admin • EduBridge</div>
        <div style={{ marginTop: 8 }}>v1.0</div>
      </div>
    </aside>
  );
}
