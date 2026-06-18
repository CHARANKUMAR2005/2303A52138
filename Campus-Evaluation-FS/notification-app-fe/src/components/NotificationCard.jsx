import { Card, CardContent, Chip, Stack, Typography, Box } from '@mui/material';

const TYPE_CONFIG = {
  Placement: { borderColor: '#1565C0', chipColor: 'primary' },
  Result:    { borderColor: '#2E7D32', chipColor: 'success' },
  Event:     { borderColor: '#E65100', chipColor: 'warning' },
};

function timeAgo(timestamp) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationCard({ notification }) {
  const { type, message, timestamp, isRead } = notification;
  const config = TYPE_CONFIG[type] ?? { borderColor: '#9E9E9E', chipColor: 'default' };

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${config.borderColor}`,
        backgroundColor: isRead ? 'background.paper' : 'action.hover',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} flex={1} minWidth={0}>
            {!isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                }}
              />
            )}
            <Typography
              variant="body1"
              fontWeight={isRead ? 400 : 700}
              sx={{ wordBreak: 'break-word' }}
            >
              {message}
            </Typography>
          </Stack>

          <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
            <Chip label={type} color={config.chipColor} size="small" />
            <Typography variant="caption" color="text.disabled" whiteSpace="nowrap">
              {timeAgo(timestamp)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
