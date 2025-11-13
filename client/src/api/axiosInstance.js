// client/src/api/axiosInstance.js
import axios from 'axios';

/**
 * Vite environment variables must start with VITE_.
 * Create a file client/.env with:
 *   VITE_API_BASE=http://localhost:5000
 *
 * Use import.meta.env.VITE_API_BASE here (works in Vite).
 */
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const instance = axios.create({
  baseURL: BASE,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage to every request if present
instance.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token'); // whatever your UI uses
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore access errors to localStorage in some environments
  }
  return cfg;
}, (err) => Promise.reject(err));

// Optional: centralized response error handler
instance.interceptors.response.use(
  res => res,
  err => {
    // you can inspect err.response.status here and handle 401 -> redirect to login
    return Promise.reject(err);
  }
);

export default instance;
