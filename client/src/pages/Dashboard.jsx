// src/pages/DashboardPage.jsx
import React from 'react';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  return (
    <div>
      {/* Header card (keeps top white header similar to design) */}
      <div className="header card" style={{ marginBottom: 18 }}>
        <div>
          <div className="title">Institutional Dashboard</div>
          <div className="small-muted">Overview of ranking, enrollment and feedback</div>
        </div>

        <div className="controls">
          <input placeholder="Sample" style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #eef2f6', width: 240 }} />
          <button className="btn" style={{ background: '#7c3aed', color: '#fff', padding: '8px 12px', borderRadius: 10 }}>New Report</button>
        </div>
      </div>

      <Dashboard />
    </div>
  );
}
