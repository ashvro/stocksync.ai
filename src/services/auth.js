const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '12345';
const SESSION_KEY = 'as_admin_session';
const TOKEN_KEY = 'as_admin_token';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function loginAdmin(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAdminLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

/* Signed API token — exchanged for the admin credentials, kept in the
   session, and attached to mutating API calls. Best-effort: if the
   Django backend is unreachable the app simply keeps working locally. */
export function setApiToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
}

export function getApiToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export async function syncAdminToken(username, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) setApiToken(data.token);
    return !!data.token;
  } catch (e) {
    console.warn('Could not sync server admin token (offline?)', e);
    return false;
  }
}
