import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { ROLES } from '../../../data-access/types';

const roleOptions = [
  { value: ROLES.FOREMAN, label: 'Прораб' },
  { value: ROLES.MANAGER, label: 'Руководитель проекта' },
  { value: ROLES.SUPPLIER, label: 'Снабженец' },
  { value: ROLES.ADMIN, label: 'Администратор' },
];

const UserManagement = ({ users, onCreate, onUpdate, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', role: ROLES.FOREMAN, password: '' });

  const openCreate = () => {
    setEditingUser(null);
    setForm({ full_name: '', email: '', role: ROLES.FOREMAN, password: '' });
    setDialogOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ full_name: user.full_name || user.name || '', email: user.email, role: user.role, password: '' });
    setDialogOpen(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (editingUser) {
      onUpdate(editingUser.id, form);
    } else {
      onCreate(form);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={openCreate}
        sx={{ mb: 2 }}
      >
        Добавить пользователя
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {roleOptions.find((r) => r.value === user.role)?.label}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => openEdit(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete?.(user.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          {editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Имя"
            fullWidth
            value={form.full_name}
            onChange={handleChange('full_name')}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={handleChange('email')}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Роль"
            select
            fullWidth
            value={form.role}
            onChange={handleChange('role')}
            sx={{ mb: 2 }}
          >
            {roleOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            value={form.password}
            onChange={handleChange('password')}
            placeholder={editingUser ? 'Оставьте пустым, чтобы не менять' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingUser ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserManagement;
