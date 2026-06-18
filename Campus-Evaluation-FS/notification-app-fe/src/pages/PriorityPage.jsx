import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { NotificationCard } from '../components/NotificationCard';
import { NotificationFilter } from '../components/NotificationFilter';
import { fetchNotifications } from '../api/notifications';
import { sortNotifications } from '../utils/prioritySort';
import { markAsRead } from '../utils/readTracker';
import { Log } from '../utils/logger';

const TOP_N_OPTIONS = [10, 15, 20];

export function PriorityPage() {
  const [topN, setTopN] = useState(10);
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Log('frontend', 'debug', 'page', `PriorityPage loading — topN:${topN} filter:${filter}`);

    fetchNotifications({ filter })
      .then((data) => {
        if (!cancelled) {
          const sorted = sortNotifications(data.notifications ?? []);
          const top = sorted.slice(0, topN);
          setNotifications(top);
          Log('frontend', 'info', 'page', `PriorityPage loaded top ${top.length} notifications`);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? 'Unknown error');
          Log('frontend', 'error', 'page', `PriorityPage fetch error: ${err.message}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [topN, filter]);

  // Mark visible priority notifications as read after 3 seconds.
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      markAsRead(notifications.map((n) => n.id));
    }, 3000);
    return () => clearTimeout(timer);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
        <StarIcon sx={{ fontSize: 28, color: 'warning.main' }} />
        <Typography variant="h5" fontWeight={700}>
          Priority Inbox
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Top {topN} notifications ranked by importance (Placement &gt; Result &gt; Event) and recency.
        {unreadCount > 0 && (
          <Box component="span" sx={{ ml: 1, color: 'primary.main', fontWeight: 600 }}>
            {unreadCount} unread
          </Box>
        )}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems={{ sm: 'center' }}>
        <NotificationFilter value={filter} onChange={(v) => setFilter(v)} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Show top</InputLabel>
          <Select
            value={topN}
            label="Show top"
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            {TOP_N_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>
                Top {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n, index) => (
            <Box key={n.id}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0,
                    fontSize: '0.65rem',
                  }}
                >
                  {index + 1}
                </Typography>
              </Stack>
              <NotificationCard notification={n} />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
