import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { NotificationsPage } from './pages/NotificationsPage';
import { PriorityPage } from './pages/PriorityPage';

const theme = createTheme({
  palette: {
    primary: { main: '#1565C0' },
    success: { main: '#2E7D32' },
    warning: { main: '#E65100' },
    background: { default: '#f5f7fa' },
  },
  typography: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  shape: { borderRadius: 8 },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<NotificationsPage />} />
          <Route path="/priority" element={<PriorityPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}