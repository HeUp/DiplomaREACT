import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  useMediaQuery, useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { projectApi } from '../../data-access/api/projectApi';
import useUIStore from '../../state/uiStore';

const STATUS_LABELS = {
  planning: 'Планирование',
  in_progress: 'В работе',
  completed: 'Завершён',
  on_hold: 'Приостановлен',
};

const ProjectsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showNotification = useUIStore((s) => s.showNotification);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', start_date: '', end_date: '', status: 'planning' });

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch {
      showNotification('Ошибка загрузки проектов', 'error');
    }
    setLoading(false);
  }, [showNotification]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showNotification('Название проекта обязательно', 'warning');
      return;
    }
    try {
      await projectApi.create(form);
      showNotification('Проект создан', 'success');
      setDialogOpen(false);
      setForm({ name: '', address: '', start_date: '', end_date: '', status: 'planning' });
      loadProjects();
    } catch {
      showNotification('Ошибка создания проекта', 'error');
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">Проекты</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          Создать проект
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Нет проектов. Создайте первый проект.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                {!isMobile && <TableCell>Адрес</TableCell>}
                <TableCell>Статус</TableCell>
                {!isMobile && <TableCell>Дата начала</TableCell>}
                {!isMobile && <TableCell>Дата окончания</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  {!isMobile && <TableCell>{p.address || '—'}</TableCell>}
                  <TableCell>
                    <Chip label={STATUS_LABELS[p.status] || p.status} size="small" color={p.status === 'completed' ? 'success' : 'primary'} />
                  </TableCell>
                  {!isMobile && <TableCell>{p.start_date || '—'}</TableCell>}
                  {!isMobile && <TableCell>{p.end_date || '—'}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Создать проект</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Название проекта" fullWidth required value={form.name} onChange={handleChange('name')} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Адрес" fullWidth value={form.address} onChange={handleChange('address')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Дата начала" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.start_date} onChange={handleChange('start_date')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Дата окончания" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.end_date} onChange={handleChange('end_date')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreate}>Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsPage;
