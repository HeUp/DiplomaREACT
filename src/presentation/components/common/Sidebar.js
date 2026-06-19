import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Box, Divider, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Assignment, Dashboard, ShoppingCart, People, Build, Assessment,
  CheckCircle, Dns, Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useUIStore from '../../../state/uiStore';
import { ROLES } from '../../../data-access/types';

const drawerWidth = 230;

const menuItems = {
  [ROLES.FOREMAN]: [
    { label: 'Мои задачи', icon: <Assignment />, path: '/tasks' },
  ],
  [ROLES.MANAGER]: [
    { label: 'Дашборд', icon: <Dashboard />, path: '/dashboard' },
    { label: 'Задачи', icon: <Build />, path: '/tasks/manage' },
    { label: 'Согласование', icon: <CheckCircle />, path: '/approvals' },
    { label: 'Отчёты', icon: <Assessment />, path: '/reports' },
  ],
  [ROLES.SUPPLIER]: [
    { label: 'Заявки', icon: <ShoppingCart />, path: '/materials' },
    { label: 'Ведомость', icon: <Dns />, path: '/materials/summary' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Администрирование', icon: <People />, path: '/admin/users' },
  ],
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const open = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const items = menuItems[user?.role] || [];

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) toggleSidebar();
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={isMobile ? toggleSidebar : undefined}
      sx={{
        width: !isMobile && open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', flex: 1, px: 1 }}>
        <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, opacity: 0.6, display: 'block', fontWeight: 600 }}>
          МЕНЮ
        </Typography>
        <List>
          {items.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => handleNav(item.path)}
                  sx={{
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(4px)' },
                    '&.Mui-selected': {
                      background: (t) =>
                        `linear-gradient(135deg, ${t.palette.primary.dark}33, ${t.palette.primary.main}22)`,
                      '&:hover': { background: (t) =>
                        `linear-gradient(135deg, ${t.palette.primary.dark}44, ${t.palette.primary.main}33)` },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { fontSize: 14, fontWeight: selected ? 600 : 400 } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 1 }} />
        <List>
          {(() => {
            const sel = location.pathname === '/profile';
            return (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={sel}
                  onClick={() => handleNav('/profile')}
                  sx={{
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(4px)' },
                    '&.Mui-selected': {
                      background: (t) =>
                        `linear-gradient(135deg, ${t.palette.primary.dark}33, ${t.palette.primary.main}22)`,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}><Person /></ListItemIcon>
                  <ListItemText
                    primary="Профиль"
                    slotProps={{ primary: { fontSize: 14, fontWeight: sel ? 600 : 400 } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })()}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ opacity: 0.4 }}>СтройКонтроль v1.0</Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
