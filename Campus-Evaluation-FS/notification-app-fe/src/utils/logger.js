import { API_BASE } from '../config';
import { getToken, authHeader } from '../api/auth';

// Sends a structured log entry to the AffordMed evaluation log server.
// stack  : "frontend"
// level  : "debug" | "info" | "warn" | "error" | "fatal"
// pkg    : "api" | "component" | "hook" | "page" | "state" | "utils" | "middleware"
// message: descriptive string about what happened
export async function Log(stack, level, pkg, message) {
  try {
    const token = await getToken();
    await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(token),
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch {
    // Logger must never crash the app — swallow silently.
  }
}
