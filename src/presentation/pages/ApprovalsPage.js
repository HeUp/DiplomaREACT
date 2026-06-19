import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { taskApi } from '../../data-access/api/taskApi';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../data-access/types';
import useUIStore from '../../state/uiStore';

const ApprovalsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const showNotification = useUIStore((s) => s.showNotification);

  useEffect(() => {
    taskApi
      .getAll({ status: TASK_STATUS.COMPLETED })
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await taskApi.transitionStatus(id, {
        to: TASK_STATUS.APPROVED,
        comment: 'Принято руководителем',
      });
      showNotification('Задача принята', 'success');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      showNotification('Ошибка при принятии задачи', 'error');
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
      <Typography variant="h5" gutterBottom>
        Согласование выполненных задач
      </Typography>

      {tasks.length === 0 && (
        <Typography color="text.secondary">
          Нет задач, ожидающих согласования
        </Typography>
      )}

      {tasks.map((task) => (
        <Card key={task.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {task.title}
              </Typography>
              <Chip
                label={TASK_STATUS_LABELS[task.status]}
                color="success"
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Объект: {task.objectName} | Исполнитель: {task.assignedToName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {task.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleApprove(task.id)}
            >
              Принять
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
            >
              Отклонить
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default ApprovalsPage;
