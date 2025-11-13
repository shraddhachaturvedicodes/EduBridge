// client/src/axiosInstance.js
import axios from "axios";
import { getToken, clearToken, setUser } from "./utils/auth";
import { navigateTo } from "./utils/navigation";

/**
 * Robust axios instance:
 * - Reads import.meta.env.VITE_API_BASE or defaults to http://localhost:5000
 * - Strips any trailing '/api' from base so we never accidentally create /api/api
 * - Ensures every relative request path is prefixed with a single '/api'
 * - Attaches token and handles 401/403 by clearing auth and redirecting to /login
 */

function stripTrailingSlashes(s = "") {
  return s.replace(/\/+$/, "");
}

// Normalize base root: remove trailing slash(es) and remove trailing '/api' if present
function normalizeBaseRoot(raw) {
  if (!raw || typeof raw !== "string") raw = "http://localhost:5000";
  let root = stripTrailingSlashes(raw);
  // If ends with /api (case-insensitive), remove it
  root = root.replace(/\/api$/i, "");
  return root;
}

const envBase = import.meta.env.VITE_API_BASE;
const baseRoot = normalizeBaseRoot(envBase);
const baseURL = baseRoot; // axios base (no /api appended)

const api = axios.create({
  baseURL,
  timeout: 30_000,
});

// Debug info in browser console
console.log("[axiosInstance] VITE_API_BASE ->", envBase);
console.log("[axiosInstance] computed baseRoot ->", baseRoot);

// Request interceptor: ensure single '/api' prefix for relative paths and attach token
api.interceptors.request.use(
  (cfg) => {
    // Ensure cfg.url exists and is a string
    if (cfg && typeof cfg.url === "string") {
      const u = cfg.url.trim();
      // If url is absolute (http/https), leave it alone
      if (!/^https?:\/\//i.test(u)) {
        // If starts with '/api' already, keep it as-is
        if (!/^\/api(\/|$)/i.test(u)) {
          // If starts with '/', prefix '/api'
          if (u.startsWith("/")) {
            cfg.url = `/api${u}`;
          } else {
            // relative like 'auth/login' -> make it '/api/auth/login'
            cfg.url = `/api/${u}`;
          }
        } // else starts with /api, keep it
      }
    }

    // Attach Authorization header if token present
    try {
      const token = getToken();
      if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore token read error
    }

    return cfg;
  },
  (err) => Promise.reject(err)
);

// Response interceptor: on 401/403 -> clear auth and navigate to login
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        clearToken();
        setUser(null);
      } catch (e) {
        // ignore
      }
      try {
        navigateTo("/login");
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;
