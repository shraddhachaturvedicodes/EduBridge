// client/src/pages/Courses.jsx
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";

function CourseRow({ c }) {
  return (
    <div style={{
      padding: 12, borderBottom: "1px solid #eee",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <div>
        <div style={{ fontWeight: 700 }}>{c.code || `#${c.course_id || ""}`} — {c.title || "Untitled"}</div>
        <div style={{ color: "#666", fontSize: 13 }}>
          {c.department ? `${c.department} • ${c.credits || 0} credits` : `${c.credits || 0} credits`}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#888" }}>
        {c.created_on ? new Date(c.created_on).toLocaleDateString() : ""}
      </div>
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]); // always an array
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setErr("");
      setLoading(true);
      try {
        const resp = await api.get("/api/courses");
        // debug: log raw response so we can inspect shape
        console.log("[Courses] raw response:", resp && resp.data ? resp.data : resp);

        // Accept multiple possible shapes returned from server:
        // 1) resp.data.courses => array
        // 2) resp.data.rows => array (pg result forwarded)
        // 3) resp.data => array directly
        // 4) resp.data.courses.rows => nested
        const data = resp?.data;

        let list = [];
        if (!data) {
          list = [];
        } else if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data.courses)) {
          list = data.courses;
        } else if (Array.isArray(data.rows)) {
          list = data.rows;
        } else if (Array.isArray(data.courses?.rows)) {
          list = data.courses.rows;
        } else {
          // If server returned an object keyed by ids, convert to array
          // or if a single item returned, put into array
          if (typeof data === "object") {
            // if it's a single object with course fields, make it an array
            const maybeIsCourse = data.course || data;
            if (Array.isArray(maybeIsCourse)) list = maybeIsCourse;
            else if (maybeIsCourse && typeof maybeIsCourse === "object" && (maybeIsCourse.title || maybeIsCourse.code)) {
              list = [maybeIsCourse];
            } else {
              // fallback: try to extract values
              try {
                list = Object.values(data).flat().filter(Boolean);
              } catch (e) {
                list = [];
              }
            }
          } else {
            list = [];
          }
        }

        // ensure array
        if (!Array.isArray(list)) list = [];

        setCourses(list);
      } catch (error) {
        console.error("[Courses] fetch error:", error);
        setErr(error?.response?.data?.error || error.message || "Failed to load courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Courses</h2>

      {loading && <div>Loading courses…</div>}

      {!loading && err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {!loading && !err && courses.length === 0 && (
        <div style={{ color: "#666" }}>No courses available.</div>
      )}

      <div style={{ marginTop: 12, border: "1px solid #e9e9e9", borderRadius: 8, overflow: "hidden" }}>
        {Array.isArray(courses) && courses.map(c => <CourseRow key={c.course_id || c.code || JSON.stringify(c)} c={c} />)}
      </div>
    </div>
  );
}
