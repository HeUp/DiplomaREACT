import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Notification from './Notification';
import useUIStore from '../../../state/uiStore';

const drawerWidth = 230;

const Layout = () => {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 2.5 },
          ml: isMobile ? 0 : sidebarOpen ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.25s, padding 0.25s',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1 }}><Outlet /></Box>
      </Box>
      <Notification />
    </Box>
  );
};

export default Layout;
