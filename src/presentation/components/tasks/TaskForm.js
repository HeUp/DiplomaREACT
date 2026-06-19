import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../../data-access/types';

const statusOptions = Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TaskForm = ({ open, onClose, onSubmit, initialData, projects }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    project_id: initialData?.project_id || '',
    objectName: initialData?.objectName || '',
    objectAddress: initialData?.objectAddress || '',
    planned_end_date: initialData?.planned_end_date
      ? initialData.planned_end_date.slice(0, 10)
      : initialData?.plannedDate
        ? initialData.plannedDate.slice(0, 10)
        : '',
    assignee_id: initialData?.assignee_id || initialData?.assignedTo || '',
    parent_task_id: initialData?.parent_task_id || '',
    status: initialData?.status || TASK_STATUS.DRAFT,
    priority: initialData?.priority || 'medium',
    workType: initialData?.workType || '',
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      planned_end_date: form.planned_end_date
        ? new Date(form.planned_end_date).toISOString()
        : null,
      parent_task_id: form.parent_task_id || null,
      project_id: form.project_id || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle>
        {isEditing ? 'Редактировать задачу' : 'Создать задачу'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Название задачи"
              fullWidth
              required
              value={form.title}
              onChange={handleChange('title')}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Описание"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Объект строительства"
              select={!!projects?.length}
              fullWidth
              value={form.project_id || form.objectName}
              onChange={(e) => {
                const val = e.target.value;
                if (projects?.length) {
                  const project = projects.find((p) => String(p.id) === val);
                  setForm((prev) => ({
                    ...prev,
                    project_id: val,
                    objectName: project?.name || val,
                    objectAddress: project?.address || prev.objectAddress,
                  }));
                } else {
                  setForm((prev) => ({ ...prev, objectName: val }));
                }
              }}
            >
              {projects?.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Адрес объекта"
              fullWidth
              value={form.objectAddress}
              onChange={handleChange('objectAddress')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Плановый срок"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.planned_end_date}
              onChange={handleChange('planned_end_date')}
              sx={{
                '& input[type="date"]::-webkit-datetime-edit': {
                  color: form.planned_end_date ? 'inherit' : 'transparent',
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Статус"
              select
              fullWidth
              value={form.status}
              onChange={handleChange('status')}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Приоритет"
              select
              fullWidth
              value={form.priority}
              onChange={handleChange('priority')}
            >
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
              <MenuItem value="critical">Критический</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Ответственный (ID)"
              fullWidth
              value={form.assignee_id}
              onChange={handleChange('assignee_id')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Вид работ"
              fullWidth
              value={form.workType}
              onChange={handleChange('workType')}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Родительская задача (ID, для подзадач)"
              fullWidth
              value={form.parent_task_id}
              onChange={handleChange('parent_task_id')}
              helperText="Укажите ID родительской задачи для создания подзадачи"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEditing ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
