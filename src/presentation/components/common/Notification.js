import { Snackbar, Alert } from '@mui/material';
import useUIStore from '../../../state/uiStore';

const Notification = () => {
  const notification = useUIStore((s) => s.notification);
  const hideNotification = useUIStore((s) => s.hideNotification);

  if (!notification) return null;

  return (
    <Snackbar
      open
      autoHideDuration={4000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={hideNotification}
        severity={notification.severity}
        variant="filled"
        sx={{ color: 'white', '& .MuiAlert-icon': { color: 'white' }, '& .MuiAlert-action': { color: 'white' } }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
