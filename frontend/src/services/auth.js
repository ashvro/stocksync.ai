const ADMIN_USERNAME = 'admin';
const OFFLINE_PASSWORD = '12345';
const SESSION_KEY = 'as_admin_session';
const TOKEN_KEY = 'as_admin_token';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/* Login is server-first: the Django backend (which holds the real
   ADMIN_PASSWORD) is the source of truth when reachable. Only if the
   server is unreachable do we fall back to the built-in offline
   password so the store keeps working without a network. */
export async function loginAdmin(username, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setApiToken(data.token);
        return true;
      }
    }
    return false;
  } catch (e) {
    console.warn('Backend unreachable — trying offline login', e);
    if (username === ADMIN_USERNAME && password === OFFLINE_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return true;
    }
    return false;
  }
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAdminLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

/* Signed API token — exchanged for the admin credentials, kept in the
   session, and attached to mutating API calls. */
export function setApiToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
}

export function getApiToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}
