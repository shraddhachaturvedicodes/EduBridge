// client/src/pages/Analytics.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Analytics() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setErr(null);
    try {
      const res = await axios.get('/api/rankings');
      setRows(res.data || []);
    } catch (error) {
      console.error('Failed to load analytics data: ', error);
      setErr(error);
    } finally {
      setLoading(false);
    }
  }

  // transform to metrics -> year:value map
  const grouped = rows.reduce((acc, r) => {
    acc[r.metric] = acc[r.metric] || {};
    acc[r.metric][r.year] = r.value;
    return acc;
  }, {});

  const years = Array.from(new Set(rows.map(r => r.year))).sort();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Ranking Analytics</h2>

      {loading && <div>Loading analytics...</div>}
      {err && <div className="text-red-500">Failed to load analytics data: {err.message || 'Error'}</div>}

      {!loading && !err && rows.length === 0 && (
        <div>No ranking data available. You can generate mock data using the button below.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded-md shadow-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Metric</th>
                {years.map(y => <th key={y} className="p-2 text-left">{y}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([metric, map]) => (
                <tr key={metric}>
                  <td className="p-2 font-semibold">{metric}</td>
                  {years.map(y => <td key={y} className="p-2">{map[y] ?? '-'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={async () => {
            try {
              await axios.post('/api/rankings/generate-mock');
              fetchAll();
            } catch (e) { console.error(e); alert('Generate mock failed: ' + (e.message || e)); }
          }}
        >Generate Mock Data</button>
      </div>
    </div>
  );
}
