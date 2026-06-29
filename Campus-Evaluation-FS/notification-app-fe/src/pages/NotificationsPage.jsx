import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { NotificationCard } from '../components/NotificationCard';
import { NotificationFilter } from '../components/NotificationFilter';
import { SearchBar } from '../components/SearchBar';
import { useNotifications } from '../hooks/useNotifications';
import { clearAuthCache, getStoredAccessCode, setStoredAccessCode } from '../api/auth';

export function NotificationsPage() {
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [accessCode, setAccessCode] = useState(getStoredAccessCode());
  const [refreshKey, setRefreshKey] = useState(0);

  const { notifications, totalPages, unreadCount, loading, error, demoMode } =
    useNotifications({ filter, page, search, refreshKey });

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  // useCallback keeps the reference stable so SearchBar's debounce effect
  // does not re-fire when the parent re-renders.
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const authError = useMemo(() => {
    const message = error ?? '';
    return message.includes('given access code is invalid') || message.includes('Auth failed: 401');
  }, [error]);

  const handleSaveAccessCode = () => {
    setStoredAccessCode(accessCode.trim());
    clearAuthCache();
    setRefreshKey((value) => value + 1);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {demoMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Showing demo notifications because the evaluation backend rejected the current access code.
        </Alert>
      )}

      <Stack spacing={2} mb={3}>
        <SearchBar onSearch={handleSearch} />
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Stack spacing={2}>
          <Alert severity="error">Failed to load notifications: {error}</Alert>
          {authError && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                size="small"
                label="Access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button variant="contained" onClick={handleSaveAccessCode}>
                Save & Retry
              </Button>
            </Stack>
          )}
        </Stack>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </Stack>
      )}

      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
