import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Menu, MenuItem,
  Popover, List, ListItemButton, ListItemText, ListItemAvatar, Divider, Chip,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications as NotifIcon, DarkMode, LightMode,
  Engineering, Person,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import useUIStore from '../../../state/uiStore';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, themeMode, toggleTheme, notifications, markNotifRead } = useUIStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifEl, setNotifEl] = useState(null);

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>

        <Engineering sx={{ mr: 0.5, opacity: 0.8, fontSize: isMobile ? 20 : 24 }} />
        <Typography
          variant={isMobile ? 'body1' : 'h6'}
          sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: isMobile ? 0 : 1, fontSize: isMobile ? '0.95rem' : undefined }}
        >
          СтройКонтроль
        </Typography>

        <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 0, p: isMobile ? 0.75 : 1 }}>
          {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>

        <IconButton color="inherit" onClick={(e) => setNotifEl(e.currentTarget)} sx={{ p: isMobile ? 0.75 : 1 }}>
          <Badge badgeContent={unread} color="error">
            <NotifIcon />
          </Badge>
        </IconButton>

        <Popover
          open={Boolean(notifEl)}
          anchorEl={notifEl}
          onClose={() => setNotifEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: isMobile ? '90vw' : 360, maxHeight: 400, mt: 1, borderRadius: 3 } } }}
        >
          <Typography sx={{ p: 2, fontWeight: 600 }}>Уведомления</Typography>
          <Divider />
          <List dense>
            {notifications.length === 0 && (
              <ListItemText primary="Нет уведомлений" sx={{ p: 2, textAlign: 'center' }} />
            )}
            {notifications.map((n) => (
              <ListItemButton
                key={n.id}
                sx={{ bgcolor: n.unread ? 'action.hover' : 'transparent' }}
                onClick={() => { markNotifRead(n.id); setNotifEl(null); }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>
                    {n.title[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={n.title}
                  secondary={n.message}
                  slotProps={{ primary: { variant: 'body2', fontWeight: n.unread ? 600 : 400 }, secondary: { variant: 'caption' } }}
                />
                <Chip label={n.time} size="small" variant="outlined" sx={{ ml: 1, fontSize: 10 }} />
              </ListItemButton>
            ))}
          </List>
        </Popover>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit" sx={{ ml: 0, p: isMobile ? 0.75 : 1 }}>
          <Avatar
            src={user?.profile_picture
              ? user.profile_picture.startsWith('data:')
                ? user.profile_picture
                : `/uploads/${user.profile_picture}`
              : undefined}
            sx={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, bgcolor: 'secondary.main', fontWeight: 600, fontSize: isMobile ? 13 : 14 }}
          >
            {user?.full_name?.[0] || user?.name?.[0] || 'U'}
          </Avatar>
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled dense>
            <Typography variant="body2" color="text.secondary">
              {user?.full_name || user?.name} — {user?.role}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
            <Person fontSize="small" sx={{ mr: 1 }} /> Профиль
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>Выйти</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
