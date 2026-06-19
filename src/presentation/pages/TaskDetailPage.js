import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { taskApi } from '../../data-access/api/taskApi';
import { TASK_STATUS_LABELS } from '../../data-access/types';
import TaskTimeline from '../components/tasks/TaskTimeline';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskApi
      .getById(id)
      .then(setTask)
      .catch(() => navigate('/tasks'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) return null;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Назад
      </Button>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
          <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>{task.title}</Typography>
          <Chip
            label={TASK_STATUS_LABELS[task.status] || task.status}
            color={task.status === 'completed' || task.status === 'approved' ? 'success' : 'primary'}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1" sx={{ mb: 2 }}>{task.description}</Typography>

        <Box sx={{ '& p': { my: 0.5, color: 'text.secondary' } }}>
          <p>Объект: {task.projectName || task.objectName || '—'}</p>
          <p>Адрес: {task.objectAddress || '—'}</p>
          <p>Вид работ: {task.workType || '—'}</p>
          <p>Плановый срок: {task.planned_end_date
            ? new Date(task.planned_end_date).toLocaleDateString('ru-RU')
            : task.plannedDate
              ? new Date(task.plannedDate).toLocaleDateString('ru-RU')
              : '—'}
          </p>
          <p>Приоритет: {task.priority || '—'}</p>
          <p>Ответственный: {task.assigneeName || task.assignedToName || task.assignee_id || task.assignedTo || '—'}</p>
          <p>Фактическое завершение: {task.actual_end_date
            ? new Date(task.actual_end_date).toLocaleDateString('ru-RU')
            : task.completedAt
              ? new Date(task.completedAt).toLocaleDateString('ru-RU')
              : '—'}
          </p>
          {task.parent_task_id && <p>Родительская задача ID: {task.parent_task_id}</p>}
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom>
          История выполнения
        </Typography>
        <TaskTimeline transitions={task.transitions || []} />
      </Paper>
    </Box>
  );
};

export default TaskDetailPage;
