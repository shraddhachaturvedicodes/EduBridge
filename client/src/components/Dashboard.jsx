// src/components/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

/* inline icons (same as before) */
const IconPeople = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 20c0-2.2 3.6-4 8-4s8 1.8 8 4" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const IconCourse = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17l10 5 10-5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12l10 5 10-5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const IconFeedback = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H8l-5 3V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

function LineChart({ data = [], labels = [], color = "#06b6d4", height = 200 }) {
  if (!data || !data.length) return null;
  const width = 640;
  const padding = 28;
  const max = Math.max(...data) * 1.05;
  const min = Math.min(...data) * 0.95;
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2) / Math.max(data.length - 1, 1));
    const y = padding + ((max - d) / range) * (height - padding * 2);
    return [x, y];
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />
      {[0.25, 0.5, 0.75].map((t, idx) => (
        <line key={idx} x1={padding} x2={width - padding} y1={padding + t * (height - padding * 2)} y2={padding + t * (height - padding * 2)} stroke="#eef2f7" strokeWidth="1" />
      ))}

      <path d={area} fill={color} opacity="0.10" />
      <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4.5" fill={color} stroke="#fff" strokeWidth="1.2" />
        </g>
      ))}

      {labels.map((lab, i) => {
        const x = padding + (i * (width - padding * 2) / Math.max(labels.length - 1, 1));
        return <text key={i} x={x} y={height - 8} fontSize="11" textAnchor="middle" fill="#6b7280">{lab}</text>;
      })}
    </svg>
  );
}

export default function Dashboard() {
  const stats = { faculty: 25, students: 120, courses: 8, avgFeedback: 4.2 };
  const years = ["2019","2020","2021","2022"];
  const enrollment = [45, 70, 110, 150];
  const ranking = [85, 78, 74, 66];

  const tasks = [
    { name: "Course Planning", pct: 79, color: "linear-gradient(90deg,#06b6d4,#3b82f6)" },
    { name: "Assignments Review", pct: 50, color: "linear-gradient(90deg,#7c3aed,#06b6d4)" },
    { name: "Rankings Update", pct: 30, color: "linear-gradient(90deg,#8b5cf6,#7c3aed)" }
  ];

  const recent = [
    { name: "John Doe", text: "Great course material!", ago: "2 hrs" },
    { name: "Jane Smith", text: "Very helpful lectures.", ago: "5 hrs" },
    { name: "Alice Johnson", text: "Enjoyed the class!", ago: "1 day" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header / title area kept by page wrapper */}
      <div className="stat-row">
        <Link to="/faculty" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-tile" style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)" }}><IconPeople color="#fff" /></div>
            <div className="stat-info">
              <div className="stat-title">Faculty</div>
              <div className="stat-value">{stats.faculty}</div>
            </div>
          </div>
        </Link>

        <Link to="/students" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-tile" style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}><IconCourse color="#fff" /></div>
            <div className="stat-info">
              <div className="stat-title">Students</div>
              <div className="stat-value">{stats.students}</div>
            </div>
          </div>
        </Link>

        <Link to="/feedback" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-tile" style={{ background: "linear-gradient(135deg,#fd6b6b,#f97316)" }}><IconFeedback color="#fff" /></div>
            <div className="stat-info">
              <div className="stat-title">Avg. Feedback</div>
              <div className="stat-value">{stats.avgFeedback}</div>
            </div>
          </div>
        </Link>

        <Link to="/analytics" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <div className="stat-tile" style={{ background: "linear-gradient(135deg,#34d399,#10b981)" }}>
              <svg style={{width:22,height:22}} viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="#fff" strokeWidth="1.6" /></svg>
            </div>
            <div className="stat-info">
              <div className="stat-title">Courses</div>
              <div className="stat-value">{stats.courses}</div>
            </div>
          </div>
        </Link>
      </div>

      {/* charts/content as before */}
      <div className="content-grid">
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>Student Enrollment Trends</div>
              <div style={{ color: '#6b7280' }}>Last 4 years</div>
            </div>
            <LineChart data={enrollment} labels={years} color="#06b6d4" height={220} />
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>NIRF / Ranking Trend</div>
              <div style={{ color: '#6b7280' }}>Last 4 years</div>
            </div>
            <LineChart data={ranking} labels={years} color="#7c3aed" height={160} />
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Operational Tasks</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {tasks.map((t, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: 6 }}>
                    <div>{t.name}</div><div>{t.pct}%</div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 700 }}>Recent Feedback</div>
              <div style={{ color: '#6b7280' }}>Auto-updated</div>
            </div>
            <div className="recent-list">
              {recent.map((r, i) => (
                <div key={i} className="recent-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>{r.ago}</div>
                  </div>
                  <div style={{ marginTop: 6, color: '#374151' }}>{r.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Recommendations</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li style={{ marginBottom: 6 }}>Focus on research grants for higher ranking</li>
              <li style={{ marginBottom: 6 }}>Skill workshops for practical labs</li>
              <li style={{ marginBottom: 6 }}>Automate feedback reminders</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
