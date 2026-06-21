import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import { taskApi } from '../../data-access/api/taskApi';
import { projectApi } from '../../data-access/api/projectApi';
import useUIStore from '../../state/uiStore';

const ManagerTasksPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    Promise.all([taskApi.getAll(), projectApi.getAll()])
      .then(([t, p]) => { setTasks(t); setProjects(p); })
      .catch(() => showNotification('Ошибка загрузки', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTasks = async () => {
    const data = await taskApi.getAll();
    setTasks(data);
  };

  const handleCreate = async (data) => {
    try {
      await taskApi.create(data);
      showNotification('Задача создана', 'success');
      setFormOpen(false);
      loadTasks();
    } catch { showNotification('Ошибка', 'error'); }
  };

  const handleUpdate = async (data) => {
    if (!editTask) return;
    try {
      const updated = await taskApi.update(editTask.id, data);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showNotification('Задача обновлена', 'success');
      setEditTask(null);
      setFormOpen(false);
    } catch { showNotification('Ошибка', 'error'); }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Удалить задачу "${task.title}"?`)) return;
    try {
      await taskApi.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      showNotification('Задача удалена', 'success');
    } catch { showNotification('Ошибка удаления', 'error'); }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>Управление задачами</Typography>
        <Button variant="contained" startIcon={<Add />} size={isMobile ? 'small' : 'medium'} onClick={() => { setEditTask(null); setFormOpen(true); }}>
          Создать задачу
        </Button>
      </Box>
      <TaskList
        tasks={tasks}
        showPhoto={false}
        showDelete={true}
        onAction={(t, a) => {
          if (a === 'edit') { setEditTask(t); setFormOpen(true); }
          if (a === 'delete') handleDelete(t);
        }}
        onClick={(t) => navigate(`/tasks/${t.id}`)}
      />
      <TaskForm
        key={editTask?.id ?? 'new'}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdate : handleCreate}
        initialData={editTask}
        projects={projects}
        onProjectCreate={(p) => setProjects((prev) => [...prev, p])}
      />
    </Box>
  );
};

export default ManagerTasksPage;
