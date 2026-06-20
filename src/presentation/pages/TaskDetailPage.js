import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Button, CircularProgress, Divider,
  TextField, useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowBack, Edit as EditIcon, Inventory } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { taskApi } from '../../data-access/api/taskApi';
import { TASK_STATUS_LABELS } from '../../data-access/types';
import TaskTimeline from '../components/tasks/TaskTimeline';
import MaterialRequestForm from '../components/materials/MaterialRequestForm';
import { materialApi } from '../../data-access/api/materialApi';
import useUIStore from '../../state/uiStore';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showNotification = useUIStore((s) => s.showNotification);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    taskApi.getById(id)
      .then((data) => {
        setTask(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          work_type: data.work_type || data.workType || '',
          priority: data.priority || 'medium',
          planned_end_date: data.planned_end_date || data.plannedDate || '',
        });
      })
      .catch(() => navigate('/tasks'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    try {
      const updated = await taskApi.update(id, form);
      setTask(updated);
      showNotification('Задача обновлена', 'success');
      setEditing(false);
    } catch {
      showNotification('Ошибка обновления задачи', 'error');
    }
  };

  const handleMaterialRequest = async (data) => {
    try {
      await materialApi.create(data);
      showNotification('Запрос на материалы отправлен', 'success');
      setMaterialDialogOpen(false);
    } catch {
      showNotification('Ошибка отправки запроса', 'error');
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Inventory />}
            size={isMobile ? 'small' : 'medium'}
            onClick={() => setMaterialDialogOpen(true)}
          >
            Запросить материалы
          </Button>
          {!editing && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              size={isMobile ? 'small' : 'medium'}
              onClick={() => setEditing(true)}
            >
              Редактировать
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
          {editing ? (
            <TextField label="Название задачи" fullWidth value={form.title} onChange={handleChange('title')} sx={{ mb: 1 }} />
          ) : (
            <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>{task.title}</Typography>
          )}
          <Chip
            label={TASK_STATUS_LABELS[task.status] || task.status}
            color={task.status === 'completed' || task.status === 'approved' ? 'success' : 'primary'}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {editing ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Описание" multiline rows={3} fullWidth value={form.description} onChange={handleChange('description')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Вид работ" fullWidth value={form.work_type} onChange={handleChange('work_type')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Приоритет" select fullWidth value={form.priority} onChange={handleChange('priority')} SelectProps={{ native: true }}>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="critical">Критический</option>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Плановый срок" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.planned_end_date} onChange={handleChange('planned_end_date')} />
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ '& p': { my: 0.5, color: 'text.secondary' } }}>
            <p>Объект: {task.projectName || task.objectName || '—'}</p>
            <p>Адрес: {task.objectAddress || '—'}</p>
            <p>Вид работ: {task.work_type || task.workType || '—'}</p>
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
        )}

        {editing && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => { setEditing(false); setForm({ title: task.title, description: task.description || '', work_type: task.work_type || task.workType || '', priority: task.priority || 'medium', planned_end_date: task.planned_end_date || task.plannedDate || '' }); }}>
              Отмена
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Сохранить
            </Button>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" gutterBottom>
          История выполнения
        </Typography>
        <TaskTimeline transitions={task.transitions || []} />
      </Paper>

      <MaterialRequestForm
        open={materialDialogOpen}
        onClose={() => setMaterialDialogOpen(false)}
        onSubmit={handleMaterialRequest}
        taskId={Number(id)}
        taskTitle={task.title}
      />
    </Box>
  );
};

export default TaskDetailPage;
