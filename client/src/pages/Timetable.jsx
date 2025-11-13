// client/src/pages/Timetable.jsx
import React, { useEffect, useState } from "react";
import api from "../axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function TimetableUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const canUpload = ["faculty", "admin", "management"].includes(user?.role);

  // Fetch existing uploaded timetables
  async function fetchTimetables() {
    try {
      const res = await api.get("/api/timetables");
      setFilesList(res.data.files || []);
    } catch (err) {
      console.error("Failed to fetch timetables", err);
    }
  }

  useEffect(() => {
    fetchTimetables();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("Please choose a file");
    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/api/timetables/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Uploaded successfully!");
      setFile(null);
      await fetchTimetables();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Timetable Upload</h2>
      <p>
        You are logged in as <strong>{user?.display_name || user?.email}</strong>{" "}
        ({user?.role}).
      </p>

      {!canUpload && (
        <div style={{ color: "crimson", marginBottom: 16 }}>
          Notice: Only faculty, management, or admin accounts can upload
          timetables.
        </div>
      )}

      {/* Upload form - disabled for students */}
      <form
        onSubmit={handleUpload}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={!canUpload}
        />
        <button type="submit" disabled={!canUpload || loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button type="button" onClick={() => setFile(null)}>
          Clear
        </button>
      </form>

      <h3>Available Timetables</h3>
      {filesList.length === 0 && (
        <div style={{ color: "#777" }}>No timetables uploaded yet.</div>
      )}

      {filesList.map((f) => (
        <div
          key={f.tf_id}
          style={{
            padding: "10px 0",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{f.original_name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Uploaded on {new Date(f.uploaded_on).toLocaleString()}
            </div>
          </div>
          <a
            href={`http://localhost:5000${f.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#007bff",
              color: "white",
              padding: "6px 10px",
              borderRadius: 4,
              textDecoration: "none",
            }}
          >
            View / Download
          </a>
        </div>
      ))}
    </div>
  );
}
