import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>404 — Page Not Found</h1>
      <p>The page you requested doesn't exist.</p>
      <p><Link to="/">Go back to dashboard</Link></p>
    </div>
  );
}
