// client/src/pages/Analytics.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  teal: '#2dd4bf',
  navy: '#0f2a3d',
  purple: '#6366f1',
  amber: '#f59e0b',
  rose: '#f43f5e',
  green: '#10b981'
};

const metricColors = [
  '#2dd4bf', '#6366f1', '#f59e0b',
  '#f43f5e', '#10b981', '#3b82f6'
];

export default function Analytics() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.get('/api/rankings');
      setRows(res.data || []);
    } catch (error) {
      setErr(error);
    } finally {
      setLoading(false);
    }
  }

  const grouped = rows.reduce((acc, r) => {
    acc[r.metric] = acc[r.metric] || {};
    acc[r.metric][r.year] = r.value;
    return acc;
  }, {});

  const years = Array.from(new Set(rows.map(r => r.year))).sort();

  const chartData = years.map(year => {
    const obj = { year: String(year) };
    Object.entries(grouped).forEach(([metric, map]) => {
      obj[metric] = map[year] ?? 0;
    });
    return obj;
  });

  const metrics = Object.keys(grouped);
  const latestYear = years[years.length - 1];
  const prevYear = years[years.length - 2];

  function getTrend(metric) {
    if (!latestYear || !prevYear) return null;
    const curr = grouped[metric]?.[latestYear];
    const prev = grouped[metric]?.[prevYear];
    if (curr == null || prev == null) return null;
    const diff = curr - prev;
    // For NIRF rank lower is better so invert
    if (metric === 'NIRF Overall Rank') return -diff;
    return diff;
  }

  const radarData = metrics.map((metric) => ({
    metric: metric.length > 18 ? metric.substring(0, 16) + '..' : metric,
    value: grouped[metric]?.[latestYear] ?? 0,
    fullMark: 100
  }));

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'trends', label: '📈 Trends' },
    { id: 'comparison', label: '🔲 Comparison' },
    { id: 'radar', label: '🕸️ Radar' },
  ];

  if (loading) return (
    <div style={styles.centered}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
      <div style={{ color: '#64748b', fontSize: 16 }}>Loading Analytics...</div>
    </div>
  );

  if (err) return (
    <div style={styles.centered}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
      <div style={{ color: '#ef4444' }}>
        Failed to load data. Make sure backend is running.
      </div>
    </div>
  );

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Ranking Analytics</h1>
          <p style={styles.subtitle}>
            {user?.role === 'student'
              ? "Track your institution's academic performance and rankings"
              : user?.role === 'faculty'
              ? 'Monitor research output, rankings and institutional metrics'
              : 'Comprehensive view of all institutional performance indicators'}
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'management') && (
          <button
            style={styles.generateBtn}
            onClick={async () => {
              try {
                await axios.post('/api/rankings/generate-mock');
                fetchAll();
              } catch (e) {
                alert('Failed: ' + e.message);
              }
            }}
          >
            ⚡ Generate Mock Data
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: '#0f2a3d', marginBottom: 8 }}>
            No Ranking Data Available
          </h3>
          <p style={{ color: '#64748b' }}>
            {user?.role === 'admin' || user?.role === 'management'
              ? 'Click "Generate Mock Data" to populate sample rankings.'
              : 'Ranking data will appear here once management adds it.'}
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={styles.cardsRow}>
            {metrics.slice(0, 4).map((metric, i) => {
              const val = grouped[metric]?.[latestYear] ?? '-';
              const trend = getTrend(metric);
              return (
                <div key={metric} style={{
                  ...styles.card,
                  borderTop: `4px solid ${metricColors[i]}`
                }}>
                  <div style={{
                    fontSize: 11,
                    color: '#64748b',
                    marginBottom: 6,
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {metric}
                  </div>
                  <div style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: COLORS.navy
                  }}>
                    {val}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    {trend !== null && (
                      <span style={{
                        color: trend > 0 ? COLORS.green : COLORS.rose,
                        fontWeight: 600
                      }}>
                        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)} from {prevYear}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: '#94a3b8',
                    marginTop: 4
                  }}>
                    Latest: {latestYear}
                    {metric === 'NIRF Overall Rank' && (
                      <span style={{
                        color: COLORS.green,
                        marginLeft: 6,
                        fontWeight: 600
                      }}>
                        ↓ lower = better
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div style={styles.tabRow}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {})
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={styles.chartBox}>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={styles.chartTitle}>All Metrics by Year</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ background: COLORS.navy }}>
                        <th style={{ ...styles.th, textAlign: 'left' }}>
                          Metric
                        </th>
                        {years.map(y => (
                          <th key={y} style={styles.th}>{y}</th>
                        ))}
                        <th style={styles.th}>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric, i) => {
                        const trend = getTrend(metric);
                        return (
                          <tr key={metric} style={{
                            background: i % 2 === 0 ? '#f8fafc' : '#fff'
                          }}>
                            <td style={{
                              ...styles.td,
                              fontWeight: 600,
                              color: COLORS.navy,
                              borderLeft: `4px solid ${metricColors[i]}`
                            }}>
                              {metric}
                              {metric === 'NIRF Overall Rank' && (
                                <span style={{
                                  fontSize: 10,
                                  color: COLORS.green,
                                  marginLeft: 6,
                                  fontWeight: 400
                                }}>
                                  (lower=better)
                                </span>
                              )}
                            </td>
                            {years.map(y => (
                              <td key={y} style={{
                                ...styles.td,
                                textAlign: 'center',
                                fontWeight: y == latestYear ? 700 : 400,
                                color: y == latestYear
                                  ? metricColors[i] : '#475569'
                              }}>
                                {grouped[metric]?.[y] ?? '-'}
                              </td>
                            ))}
                            <td style={{
                              ...styles.td,
                              textAlign: 'center'
                            }}>
                              {trend !== null ? (
                                <span style={{
                                  color: trend > 0 ? COLORS.green : COLORS.rose,
                                  fontWeight: 700,
                                  fontSize: 14
                                }}>
                                  {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}
                                </span>
                              ) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Note for NIRF */}
                <div style={{
                  marginTop: 16,
                  padding: '10px 16px',
                  background: '#f0fffe',
                  borderRadius: 8,
                  border: '1px solid #2dd4bf',
                  fontSize: 12,
                  color: '#0f766e'
                }}>
                  ℹ️ <strong>Note:</strong> For NIRF Overall Rank,
                  a lower number means a better rank.
                  All other metrics are scored out of 100
                  where higher is better.
                </div>
              </div>
            )}

            {/* TRENDS */}
            {activeTab === 'trends' && (
              <div>
                <h3 style={styles.chartTitle}>
                  Performance Trends Over Years
                </h3>
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      fontSize={13}
                    />
                    <YAxis stroke="#64748b" fontSize={13} />
                    <Tooltip contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }} />
                    <Legend />
                    {metrics.map((metric, i) => (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={metricColors[i]}
                        strokeWidth={2.5}
                        dot={{ r: 5, fill: metricColors[i] }}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* COMPARISON */}
            {activeTab === 'comparison' && (
              <div>
                <h3 style={styles.chartTitle}>
                  Year-by-Year Comparison
                </h3>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      fontSize={13}
                    />
                    <YAxis stroke="#64748b" fontSize={13} />
                    <Tooltip contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }} />
                    <Legend />
                    {metrics.map((metric, i) => (
                      <Bar
                        key={metric}
                        dataKey={metric}
                        fill={metricColors[i]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* RADAR */}
            {activeTab === 'radar' && (
              <div>
                <h3 style={styles.chartTitle}>
                  Performance Radar — {latestYear}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: '#64748b',
                  marginBottom: 20,
                  marginTop: -10
                }}>
                  Snapshot of all metrics for the latest year.
                  NIRF rank is excluded as it uses a different scale.
                </p>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData.filter(
                    d => d.metric !== 'NIRF Overall Rank'
                  )}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fontSize: 12, fill: '#475569' }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                    />
                    <Radar
                      name={String(latestYear)}
                      dataKey="value"
                      stroke={COLORS.teal}
                      fill={COLORS.teal}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    background: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#0f2a3d',
    margin: '0 0 6px 0',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    margin: 0,
    maxWidth: 500,
  },
  generateBtn: {
    padding: '12px 20px',
    background: '#0f2a3d',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 18px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  tabActive: {
    background: '#2dd4bf',
    color: '#fff',
    border: '1px solid #2dd4bf',
  },
  chartBox: {
    background: '#fff',
    borderRadius: 14,
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#0f2a3d',
    marginBottom: 20,
    marginTop: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    padding: '12px 16px',
    color: '#fff',
    fontWeight: 600,
    fontSize: 13,
    textAlign: 'center',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
};