// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../axiosInstance";             // your axios instance
import { setToken, getToken, clearToken, setUser as persistUser, getUser } from "../utils/auth";
import { navigateTo } from "../utils/navigation";

/**
 * AuthContext provides:
 *  - user: the logged-in user's object (or null)
 *  - login({email,password})
 *  - register({email,password,role,display_name})
 *  - logout()
 *  - isLoading (boolean while initialising)
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser() || null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: configure axios default header immediately
  const applyTokenToAxios = useCallback((token) => {
    if (!token) {
      if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
        delete api.defaults.headers.common.Authorization;
      }
      return;
    }
    api.defaults.headers = api.defaults.headers || {};
    api.defaults.headers.common = api.defaults.headers.common || {};
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, []);

  // LOGIN: call server, persist token, set axios header, fetch/me or use returned user
  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) throw new Error("Email and password required");

    const res = await api.post("/api/auth/login", { email, password });
    const token = res.data?.token;
    const userFromResp = res.data?.user || null;

    if (!token) throw new Error("Authentication failed: no token returned");

    // persist token synchronously
    setToken(token);
    applyTokenToAxios(token);

    // prefer returned user, otherwise fetch authoritative /api/auth/me
    let finalUser = userFromResp;
    if (!finalUser) {
      try {
        const me = await api.get("/api/auth/me");
        // backend may return { user: {...} } or {...} directly
        finalUser = me.data?.user ?? me.data ?? null;
      } catch (e) {
        console.debug("[Auth.login] /api/auth/me failed after login:", e?.response?.data ?? e.message);
      }
    }

    // save user locally (persist helper may store in localStorage)
    setUser(finalUser);
    persistUser(finalUser);

    return { token, user: finalUser };
  }, [applyTokenToAxios]);

  // REGISTER: create user then optionally auto-login (server returns created user but not token usually)
  const register = useCallback(async ({ email, password, role = "student", display_name = null }) => {
    if (!email || !password) throw new Error("Email and password required for registration");
    // server returns created user row (no token)
    const res = await api.post("/api/auth/register", { email, password, role, display_name });
    // auto-login for convenience
    try {
      await login({ email, password });
    } catch (e) {
      // If login fails after register, still return created user info
      return { created: res.data };
    }
    return { created: res.data, loggedIn: true };
  }, [login]);

  // LOGOUT: clear token and user
  const logout = useCallback(() => {
    clearToken();
    applyTokenToAxios(null);
    setUser(null);
    persistUser(null);
    try { navigateTo("/login"); } catch (e) { /* ignore if navigateTo unavailable */ }
  }, [applyTokenToAxios]);

  // On mount: if token persisted, set header and fetch /api/auth/me
  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsLoading(false);
          console.debug("[Auth] no token on startup");
          return;
        }
        console.debug("[Auth] token found on startup, applying to axios and fetching /api/auth/me");
        applyTokenToAxios(token);
        // Fetch authoritative user object
        const me = await api.get("/api/auth/me");
        const resolvedUser = me.data?.user ?? me.data ?? null;
        setUser(resolvedUser);
        persistUser(resolvedUser);
        console.debug("[Auth] fetched /api/auth/me ->", resolvedUser);
      } catch (e) {
        // invalid/expired token -> clear local
        console.warn("[Auth] failed to fetch /api/auth/me on startup:", e?.response?.data ?? e.message);
        clearToken();
        applyTokenToAxios(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [applyTokenToAxios]);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
