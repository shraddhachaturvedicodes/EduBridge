import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    faculty_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.display_name.trim()) return setError("Please enter your full name.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (role === "faculty" && !form.faculty_code.trim()) {
      return setError("Faculty Code is required for faculty registration.");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: role,
          display_name: form.display_name,
          faculty_code: form.faculty_code || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].msg);
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join EduBridge today</p>

        {/* Role Selector */}
        <div style={styles.roleRow}>
          {["student", "faculty"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                ...styles.roleBtn,
                ...(role === r ? styles.roleBtnActive : {}),
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {success && (
          <div style={styles.successBox}>
            ✅ Account created! Redirecting to login...
          </div>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="display_name"
              placeholder="Enter your full name"
              value={form.display_name}
              onChange={handleChange}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Faculty Code - only shows when Faculty is selected */}
          {role === "faculty" && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Faculty Code 🔐</label>
              <input
                style={{
                  ...styles.input,
                  border: "1.5px solid #2dd4bf",
                  background: "#f0fff8",
                }}
                type="text"
                name="faculty_code"
                placeholder="Enter Faculty Code given by admin"
                value={form.faculty_code}
                onChange={handleChange}
              />
              <span style={{ fontSize: "12px", color: "#888" }}>
                🔒 Only authorized faculty members can register with this code.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f2a3d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  title: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f2a3d",
    margin: "0 0 6px 0",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 24px 0",
  },
  roleRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  roleBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #e0e0e0",
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },
  roleBtnActive: {
    background: "#2dd4bf",
    borderColor: "#2dd4bf",
    color: "#fff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f2a3d",
  },
  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    padding: "16px",
    background: "#2dd4bf",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "6px",
    width: "100%",
  },
  errorBox: {
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    padding: "12px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "8px",
  },
  successBox: {
    background: "#f0fff8",
    border: "1px solid #2dd4bf",
    color: "#0f766e",
    padding: "12px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "12px",
  },
  footerText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#64748b",
  },
  link: {
    color: "#2dd4bf",
    fontWeight: "600",
    textDecoration: "none",
  },
};