import { API_BASE, AUTH_CREDENTIALS } from '../config';

let cachedToken = null;
let tokenExpiresAt = 0;

// Token is valid for 15 minutes; refresh 60s before expiry to avoid edge cases.
export async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const res = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + 15 * 60 * 1000;
  return cachedToken;
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}
