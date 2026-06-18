import { useState, useEffect } from 'react';
import { fetchNotifications } from '../api/notifications';
import { sortNotifications } from '../utils/prioritySort';
import { markAsRead } from '../utils/readTracker';
import { Log } from '../utils/logger';
import { PAGE_SIZE } from '../config';

// filter is sent to the server; search and pagination are applied client-side
// so the priority sort operates on the full filtered dataset before slicing.
export function useNotifications({ filter, page, search }) {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Log('frontend', 'debug', 'hook', `useNotifications fetching — filter:${filter} search:"${search}"`);

    fetchNotifications({ filter, search })
      .then((data) => {
        if (!cancelled) {
          const sorted = sortNotifications(data.notifications ?? []);
          setAllNotifications(sorted);
          Log('frontend', 'info', 'hook', `Notifications loaded — total:${sorted.length}`);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? 'Unknown error');
          Log('frontend', 'error', 'hook', `useNotifications failed: ${err.message}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filter, search]);

  const total = allNotifications.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const notifications = allNotifications.slice(start, start + PAGE_SIZE);
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  // Mark the currently visible page of notifications as read after a short delay.
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      markAsRead(notifications.map((n) => n.id));
    }, 3000);
    return () => clearTimeout(timer);
  }, [notifications]);

  return { notifications, total, totalPages, unreadCount, loading, error };
}
