import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';

const MaterialRequestForm = ({ open, onClose, onSubmit, taskId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState({
    materialName: '',
    quantity: '',
    unit: 'шт.',
    comment: '',
    taskId: taskId || '',
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
    });
    setForm({ materialName: '', quantity: '', unit: 'шт.', comment: '', taskId: taskId || '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Запрос на материалы</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Наименование материала"
              fullWidth
              required
              value={form.materialName}
              onChange={handleChange('materialName')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Количество"
              type="number"
              fullWidth
              required
              value={form.quantity}
              onChange={handleChange('quantity')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Единица измерения"
              fullWidth
              value={form.unit}
              onChange={handleChange('unit')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Комментарий"
              multiline
              rows={2}
              fullWidth
              value={form.comment}
              onChange={handleChange('comment')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Отправить запрос
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialRequestForm;
