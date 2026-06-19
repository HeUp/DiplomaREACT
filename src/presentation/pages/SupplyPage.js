import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MaterialRequestCard from '../components/materials/MaterialRequestCard';
import MaterialRequestForm from '../components/materials/MaterialRequestForm';
import { materialApi } from '../../data-access/api/materialApi';
import { saveOfflineAction } from '../../data-access/db/dexieDb';
import { useAuth } from '../context/AuthContext';
import useUIStore from '../../state/uiStore';

const SupplyPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const showNotification = useUIStore((s) => s.showNotification);
  const { user } = useAuth();

  const loadRequests = () => {
    setLoading(true);
    materialApi
      .getAll()
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(loadRequests, []);

  const handleStatusChange = async (id, status) => {
    try {
      await materialApi.updateStatus(id, status);
      showNotification('Статус заявки обновлён', 'success');
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      showNotification('Ошибка обновления статуса', 'error');
    }
  };

  const handleCreateRequest = async (data) => {
    try {
      await materialApi.create({
        ...data,
        createdBy: user?.id,
        objectName: data.objectName || '',
        taskTitle: data.taskTitle || '',
      });
      showNotification('Заявка на материалы создана', 'success');
      setDialogOpen(false);
      loadRequests();
    } catch {
      await saveOfflineAction({
        type: 'CREATE_MATERIAL_REQUEST',
        entityType: 'material',
        payload: { ...data, createdBy: user?.id, timestamp: new Date().toISOString() },
      });
      showNotification('Заявка сохранена локально', 'info');
      setDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Заявки на материалы
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Новая заявка
        </Button>
      </Box>

      {requests.length === 0 && (
        <Typography color="text.secondary">Нет заявок</Typography>
      )}

      {requests.map((req) => (
        <MaterialRequestCard
          key={req.id}
          request={req}
          onStatusChange={handleStatusChange}
        />
      ))}

      <MaterialRequestForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateRequest}
      />
    </Box>
  );
};

export default SupplyPage;
