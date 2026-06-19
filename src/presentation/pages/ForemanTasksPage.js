import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import TaskList from '../components/tasks/TaskList';
import PhotoUpload from '../components/tasks/PhotoUpload';
import MaterialRequestForm from '../components/materials/MaterialRequestForm';
import { taskApi } from '../../data-access/api/taskApi';
import { materialApi } from '../../data-access/api/materialApi';
import { TASK_STATUS } from '../../data-access/types';
import useAuthStore from '../../state/authStore';
import useUIStore from '../../state/uiStore';
import { saveOfflineAction, getCachedTasks, cacheTasks } from '../../data-access/db/dexieDb';

const ForemanTasksPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isOnline = useUIStore((s) => s.isOnline);
  const showNotification = useUIStore((s) => s.showNotification);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

  const [completeDialog, setCompleteDialog] = useState({ open: false, task: null });
  const [completeComment, setCompleteComment] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      if (isOnline) {
        const data = await taskApi.getAll({ assignee_id: user?.id });
        setTasks(data);
        cacheTasks(data);
      } else {
        const cached = await getCachedTasks();
        setTasks(cached);
        showNotification('Работа в офлайн-режиме', 'warning');
      }
    } catch {
      const cached = await getCachedTasks();
      if (cached.length) setTasks(cached);
    } finally {
      setLoading(false);
    }
  }, [isOnline, user?.id, showNotification]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAction = async (task, actionType) => {
    if (actionType === 'photo' || actionType === 'complete') {
      const isComplete = task.status === TASK_STATUS.IN_PROGRESS;
      if (isComplete) {
        setCompleteDialog({ open: true, task });
        return;
      }
      return;
    }

    if (actionType === 'edit') {
      navigate(`/tasks/${task.id}`);
      return;
    }

    const currentStatus = actionType;

    const transitions = {
      [TASK_STATUS.ASSIGNED]: { to: TASK_STATUS.ACCEPTED, comment: 'Принято к исполнению' },
      [TASK_STATUS.ACCEPTED]: { to: TASK_STATUS.IN_PROGRESS, comment: 'Начато выполнение' },
      [TASK_STATUS.IN_PROGRESS]: { to: TASK_STATUS.ON_HOLD, comment: 'Приостановлено' },
    };

    const transition = transitions[currentStatus];
    if (!transition) return;

    const action = {
      type: 'TRANSITION_STATUS',
      entityType: 'task',
      entityId: task.id,
      payload: { ...transition, timestamp: new Date().toISOString() },
    };

    if (isOnline) {
      try {
        await taskApi.transitionStatus(task.id, transition);
        showNotification('Статус задачи обновлён', 'success');
        loadTasks();
        return;
      } catch {
        showNotification('Ошибка обновления. Сохранено локально.', 'error');
      }
    }

    await saveOfflineAction(action);
    showNotification('Изменения сохранены локально', 'info');
    loadTasks();
  };

  const handleCompleteSubmit = async () => {
    const { task } = completeDialog;
    if (!task) return;

    const formData = new FormData();
    formData.append('comment', completeComment || 'Работы выполнены');

    const action = {
      type: 'COMPLETE_TASK',
      entityType: 'task',
      entityId: task.id,
      payload: {
        comment: completeComment || 'Работы выполнены',
        timestamp: new Date().toISOString(),
      },
    };

    if (isOnline) {
      try {
        await taskApi.transitionStatus(task.id, {
          to: TASK_STATUS.COMPLETED,
          comment: completeComment || 'Работы выполнены',
        });
        showNotification('Задача завершена', 'success');
      } catch {
        await saveOfflineAction(action);
        showNotification('Статус сохранён локально', 'info');
      }
    } else {
      await saveOfflineAction(action);
      showNotification('Статус сохранён локально', 'info');
    }

    setCompleteDialog({ open: false, task: null });
    setCompleteComment('');
    loadTasks();
  };

  const handlePhotoUpload = async (formData) => {
    const { task } = completeDialog;
    if (!task) return;

    try {
      await taskApi.uploadPhoto(task.id, formData);
      showNotification('Фотографии загружены', 'success');
    } catch {
      await saveOfflineAction({
        type: 'UPLOAD_PHOTO',
        entityType: 'task',
        entityId: task.id,
        payload: { timestamp: new Date().toISOString() },
      });
      showNotification('Фото сохранены локально', 'info');
    }
  };

  const handleMaterialRequest = async (data) => {
    try {
      await materialApi.create(data);
      showNotification('Запрос на материалы отправлен', 'success');
      setMaterialDialogOpen(false);
    } catch {
      await saveOfflineAction({
        type: 'CREATE_MATERIAL_REQUEST',
        entityType: 'material',
        payload: { ...data, timestamp: new Date().toISOString() },
      });
      showNotification('Запрос сохранён локально', 'info');
      setMaterialDialogOpen(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (tab === 0) return true;
    if (tab === 1) return [TASK_STATUS.ASSIGNED, TASK_STATUS.ACCEPTED, TASK_STATUS.IN_PROGRESS].includes(t.status);
    if (tab === 2) return t.status === TASK_STATUS.COMPLETED;
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>Мои задачи</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          size={isMobile ? 'small' : 'medium'}
          onClick={() => setMaterialDialogOpen(true)}
        >
          Запросить материалы
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Все" />
        <Tab label="Активные" />
        <Tab label="Завершённые" />
      </Tabs>

      <TaskList
        tasks={filteredTasks}
        onAction={handleAction}
        onClick={(task) => navigate(`/tasks/${task.id}`)}
        groupByObject
      />

      <Dialog
        open={completeDialog.open}
        onClose={() => setCompleteDialog({ open: false, task: null })}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Завершение задачи: {completeDialog.task?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Комментарий о выполнении"
            multiline
            rows={3}
            fullWidth
            value={completeComment}
            onChange={(e) => setCompleteComment(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="Например: Бетон залит, 24 м³"
          />
          <PhotoUpload
            onUpload={handlePhotoUpload}
            maxFiles={5}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog({ open: false, task: null })}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleCompleteSubmit}>
            Подтвердить завершение
          </Button>
        </DialogActions>
      </Dialog>

      <MaterialRequestForm
        open={materialDialogOpen}
        onClose={() => setMaterialDialogOpen(false)}
        onSubmit={handleMaterialRequest}
      />
    </Box>
  );
};

export default ForemanTasksPage;
