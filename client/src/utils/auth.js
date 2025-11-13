// client/src/utils/auth.js
// Small helper to persist token + user in localStorage
// Keys used:
//   - edubridge_token
//   - edubridge_user

const TOKEN_KEY = "edubridge_token";
const USER_KEY = "edubridge_user";

/**
 * Persist JWT token (string)
 * @param {string|null} token
 */
export function setToken(token) {
  if (token === null || token === undefined) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

/** Return token string or null */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

/** Remove token and user */
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    // ignore
  }
}

/** Persist user object (or null to remove) */
export function setUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (e) {
    // ignore
  }
}

/** Read persisted user object or null */
export function getUser() {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
