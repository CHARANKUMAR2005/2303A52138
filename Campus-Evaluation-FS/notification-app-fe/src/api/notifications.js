import { API_BASE } from '../config';
import { getToken, authHeader } from './auth';
import { Log } from '../utils/logger';
import { isRead } from '../utils/readTracker';

// Maps raw API notification (capitalized fields) to the internal shape used by the UI.
function mapNotification(raw) {
  return {
    id:        raw.ID,
    type:      raw.Type,
    message:   raw.Message,
    timestamp: raw.Timestamp,
    isRead:    isRead(raw.ID),
  };
}

export async function fetchNotifications({ filter = 'All', search = '' } = {}) {
  const start = performance.now();

  try {
    const token = await getToken();

    // No limit param — server max is 10; omitting it returns the full default set (20 items).
    // notification_type filter is handled server-side; search is applied client-side.
    const params = new URLSearchParams();
    if (filter && filter !== 'All') params.set('notification_type', filter);
    const qs = params.toString();
    const url = `${API_BASE}/notifications${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    });

    if (!res.ok) {
      const msg = `Notifications fetch failed: ${res.status}`;
      await Log('frontend', 'error', 'api', msg);
      throw new Error(msg);
    }

    const data = await res.json();
    const responseTime = Math.round(performance.now() - start);
    await Log('frontend', 'info', 'api', `Fetched notifications — filter:${filter} count:${data.notifications?.length ?? 0} time:${responseTime}ms`);

    let notifications = (data.notifications ?? []).map(mapNotification);

    if (search.trim()) {
      const q = search.toLowerCase();
      notifications = notifications.filter((n) =>
        n.message.toLowerCase().includes(q)
      );
    }

    return { notifications, total: notifications.length };
  } catch (err) {
    await Log('frontend', 'error', 'api', `fetchNotifications error: ${err.message}`);
    throw err;
  }
}
