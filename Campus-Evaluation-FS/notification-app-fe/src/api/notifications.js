import { API_BASE } from '../config';
import { getToken, authHeader } from './auth';
import { Log } from '../utils/logger';
import { isRead } from '../utils/readTracker';

const DEMO_NOTIFICATIONS = [
  {
    id: 'demo-1',
    type: 'Placement',
    message: 'Placement drive opened for CSE students. Register before 6 PM today.',
    timestamp: new Date(Date.now() - 20 * 60_000).toISOString(),
  },
  {
    id: 'demo-2',
    type: 'Result',
    message: 'Mid-semester result has been published. Check your student portal.',
    timestamp: new Date(Date.now() - 55 * 60_000).toISOString(),
  },
  {
    id: 'demo-3',
    type: 'Event',
    message: 'AI meetup event starts at 4 PM in Seminar Hall 2.',
    timestamp: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
  },
  {
    id: 'demo-4',
    type: 'Placement',
    message: 'Mock interview slots are now open for shortlisted students.',
    timestamp: new Date(Date.now() - 7 * 60 * 60_000).toISOString(),
  },
  {
    id: 'demo-5',
    type: 'Result',
    message: 'Lab evaluation scores have been updated by the faculty team.',
    timestamp: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
  },
  {
    id: 'demo-6',
    type: 'Event',
    message: 'Campus tech fest registration closes tomorrow at noon.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
  },
];

function buildDemoNotifications() {
  return DEMO_NOTIFICATIONS.map((notification) => ({
    ...notification,
    isRead: isRead(notification.id),
  }));
}

function isAuthFailure(message) {
  return /Auth failed:\s*\d+|given access code is invalid|invalid access code|Not Allowed/i.test(message);
}

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
    if (isAuthFailure(err.message ?? '')) {
      const notifications = buildDemoNotifications();
      let filtered = notifications;

      if (filter && filter !== 'All') {
        filtered = filtered.filter((notification) => notification.type === filter);
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter((notification) =>
          notification.message.toLowerCase().includes(q)
        );
      }

      return { notifications: filtered, total: filtered.length, demoMode: true };
    }

    await Log('frontend', 'error', 'api', `fetchNotifications error: ${err.message}`);
    throw err;
  }
}
