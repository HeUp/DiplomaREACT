import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, Link,
} from '@mui/material';
import { Visibility, VisibilityOff, HowToReg } from '@mui/icons-material';
import { userApi } from '../../data-access/api/userApi';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      setError('Заполните все поля'); return;
    }
    if (form.password.length < 4) {
      setError('Пароль должен быть не менее 4 символов'); return;
    }
    if (form.password !== form.confirm) {
      setError('Пароли не совпадают'); return;
    }

    setLoading(true);
    try {
      await userApi.create({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'foreman',
      });
      navigate('/login?registered=1');
    } catch (err) {
      setError(err.message || 'Ошибка регистрации. Возможно, email уже занят.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <HowToReg sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">Регистрация</Typography>
            <Typography variant="body2" color="text.secondary">Создайте аккаунт в СтройКонтроль</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={submit}>
            <TextField label="Имя пользователя" fullWidth required value={form.full_name} onChange={handle('full_name')} sx={{ mb: 2 }} />
            <TextField label="Email" type="email" fullWidth required value={form.email} onChange={handle('email')} sx={{ mb: 2 }} />
            <TextField label="Пароль" type={show ? 'text' : 'password'} fullWidth required value={form.password} onChange={handle('password')}
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow(!show)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }}
              sx={{ mb: 2 }}
            />
            <TextField label="Повтор пароля" type={show ? 'text' : 'password'} fullWidth required value={form.confirm} onChange={handle('confirm')} sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Уже есть аккаунт? <Link component={RouterLink} to="/login">Войти</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegistrationPage;
