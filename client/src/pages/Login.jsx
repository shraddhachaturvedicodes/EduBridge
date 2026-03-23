// client/src/pages/Login.jsx
/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axiosInstance";
import { setToken } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      const token = res?.data?.token;
      if (!token) throw new Error("Server did not return token.");

      setToken(token);
      navigate("/"); // redirect to dashboard/home
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "none",
            background: "#1f6feb",
            color: "white",
          }}
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/PublicNavbar';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [role, setRole] = useState('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f2a3d' }}>
      <PublicNavbar />
      
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 50,
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 32,
            marginBottom: 10,
            color: '#0f2a3d'
          }}>
            Welcome Back
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            marginBottom: 30
          }}>
            Sign in to your account
          </p>

          {/* Role Selection Tabs */}
          <div style={{
            display: 'flex',
            gap: 10,
            marginBottom: 30
          }}>
            {['faculty', 'student', 'management'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: role === r ? '#2dd4bf' : '#f1f5f9',
                  color: role === r ? '#fff' : '#64748b',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.3s'
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#0f2a3d'
              }}>
                Email / Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                required
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border 0.3s'
                }}
                onFocus={(e) => e.target.style.border = '1px solid #2dd4bf'}
                onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: 10 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#0f2a3d'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    paddingRight: 45,
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 15,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #2dd4bf'}
                  onBlur={(e) => e.target.style.border = '1px solid #e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{
              textAlign: 'right',
              marginBottom: 25
            }}>
              <a
                href="#"
                style={{
                  color: '#2dd4bf',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: 12,
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 16,
                background: loading ? '#94a3b8' : '#2dd4bf',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 25,
            color: '#64748b',
            fontSize: 14
          }}>
            Don't have an account?{' '}
            <a
              href="/contact"
              style={{
                color: '#2dd4bf',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Contact Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}