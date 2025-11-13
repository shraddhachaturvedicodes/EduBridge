// client/src/utils/navigation.js

/**
 * Navigation utilities — safe for both inside and outside React components.
 * 
 *  - `navigateTo(path)` : performs a redirect using React Router (if available)
 *    or falls back to window.location.href.
 * 
 *  - `reloadPage()` : reloads the current page.
 * 
 *  - `goBack()` : navigates back safely.
 * 
 *  - `getCurrentPath()` : returns current browser pathname.
 */

import { createBrowserHistory } from 'history';

// Create a shared history object.
// (React Router v6 no longer exports `useHistory`, so we create our own for non-component code.)
export const history = createBrowserHistory();

/**
 * Navigate to a specific path.
 * Works safely inside React Router context or as a hard redirect fallback.
 */
export function navigateTo(path) {
  try {
    if (history && typeof history.push === 'function') {
      history.push(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  } catch (err) {
    console.error('Navigation error:', err);
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }
}

/**
 * Reload the current page.
 */
export function reloadPage() {
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Go back to previous page.
 */
export function goBack() {
  if (history && typeof history.back === 'function') {
    history.back();
  } else if (typeof window !== 'undefined') {
    window.history.back();
  }
}

/**
 * Get the current pathname (without origin).
 */
export function getCurrentPath() {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '/';
}
