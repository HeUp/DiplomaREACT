import { useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './presentation/context/AuthContext';
import AppRouter from './presentation/routes/AppRouter';
import OfflineSync from './presentation/components/common/OfflineSync';
import { initDB } from './data-access/db/sqliteDb';
import useUIStore from './state/uiStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: mode === 'dark' ? '#90caf9' : '#1565c0' },
    secondary: { main: mode === 'dark' ? '#ffb74d' : '#f57c00' },
    background: mode === 'dark'
      ? { default: '#0a1929', paper: '#132f4c' }
      : { default: '#f5f5f5', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', minHeight: 44, minWidth: 44, borderRadius: 10, fontWeight: 500 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: mode === 'dark' ? 'linear-gradient(135deg, rgba(19,47,76,0.9) 0%, rgba(10,25,41,0.95) 100%)' : 'none',
          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.12)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: mode === 'dark' ? 'linear-gradient(135deg, rgba(19,47,76,0.85) 0%, rgba(10,25,41,0.9) 100%)' : 'none' } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { backgroundImage: mode === 'dark' ? 'linear-gradient(180deg, #0a1929 0%, #132f4c 100%)' : 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)', borderRight: 'none' } },
    },
    MuiAppBar: {
      styleOverrides: { root: { backgroundImage: mode === 'dark' ? 'linear-gradient(90deg, #0a1929 0%, #132f4c 100%)' : 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)' } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
  },
});

const DBInit = ({ children }) => {
  useEffect(() => {
    initDB().catch((e) => console.warn('[DB] init error', e?.message));
  }, []);
  return children;
};

const ThemedApp = () => {
  const themeMode = useUIStore((s) => s.themeMode);
  const theme = createTheme(getTheme(themeMode));
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <DBInit>
          <OfflineSync />
          <ThemedApp />
        </DBInit>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
