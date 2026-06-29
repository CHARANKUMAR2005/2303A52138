import { API_BASE, AUTH_CREDENTIALS } from '../config';

let cachedToken = null;
let tokenExpiresAt = 0;
const ACCESS_CODE_STORAGE_KEY = 'affordmed_auth_access_code';

export function getStoredAccessCode() {
  try {
    return localStorage.getItem(ACCESS_CODE_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setStoredAccessCode(accessCode) {
  try {
    localStorage.setItem(ACCESS_CODE_STORAGE_KEY, accessCode);
  } catch {
    // Ignore storage failures; auth will fall back to the built-in defaults.
  }
}

export function clearAuthCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

function getAuthPayload() {
  const storedAccessCode = getStoredAccessCode();
  return {
    ...AUTH_CREDENTIALS,
    accessCode: storedAccessCode || AUTH_CREDENTIALS.accessCode,
  };
}

// Token is valid for 15 minutes; refresh 60s before expiry to avoid edge cases.
export async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const res = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(getAuthPayload()),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(details ? `Auth failed: ${res.status} ${details}` : `Auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + 15 * 60 * 1000;
  return cachedToken;
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}
