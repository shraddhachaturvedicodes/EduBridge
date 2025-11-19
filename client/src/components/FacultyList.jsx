// client/src/components/FacultyList.jsx
import React from "react";
import { format } from "date-fns";

/**
 * Props:
 * - list: [{ user_id, display_name, email, role, expertise?, created_on? }]
 * - selectedId
 * - onSelect(facultyObj)
 */
export default function FacultyList({ list = [], selectedId, onSelect }) {
  return (
    <div>
      {list.map(f => (
        <div
          key={f.user_id}
          onClick={() => onSelect(f)}
          style={{
            padding: 10,
            borderRadius: 8,
            marginBottom: 8,
            cursor: "pointer",
            background: f.user_id === selectedId ? "#eaf6ff" : "transparent",
            border: f.user_id === selectedId ? "1px solid #cfeeff" : "1px solid transparent"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>{f.display_name || f.email}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{f.role}</div>
          </div>
          <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
            {f.expertise ? f.expertise.slice(0, 80) + (f.expertise.length > 80 ? "…" : "") : (f.email || "")}
          </div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
            Joined: {f.created_on ? format(new Date(f.created_on), "yyyy-MM-dd") : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
