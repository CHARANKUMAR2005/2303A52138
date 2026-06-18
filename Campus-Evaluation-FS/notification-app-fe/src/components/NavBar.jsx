import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate, useLocation } from 'react-router-dom';

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, letterSpacing: 0.5 }}>
          Campus Notifications
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            color="inherit"
            startIcon={<NotificationsIcon />}
            onClick={() => navigate('/')}
            sx={{ fontWeight: pathname === '/' ? 700 : 400, textTransform: 'none' }}
          >
            All
          </Button>
          <Button
            color="inherit"
            startIcon={<StarIcon />}
            onClick={() => navigate('/priority')}
            sx={{ fontWeight: pathname === '/priority' ? 700 : 400, textTransform: 'none' }}
          >
            Priority
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
