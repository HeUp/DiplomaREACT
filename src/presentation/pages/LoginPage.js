import { useState } from 'react';
import { useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, Link,
} from '@mui/material';
import { Visibility, VisibilityOff, Engineering, Info } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const registered = params.get('registered');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email, password });
      const roleRoutes = {
        foreman: '/tasks',
        manager: '/dashboard',
        supplier: '/materials',
        admin: '/admin/users',
      };
      navigate(roleRoutes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Engineering sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              СтройКонтроль
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Система управления задачами строительной компании
            </Typography>
          </Box>

          {registered && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Регистрация прошла успешно! Войдите в систему.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            Нет аккаунта? <Link component={RouterLink} to="/register">Зарегистрироваться</Link>
          </Typography>

          <Alert severity="info" icon={<Info />} sx={{ mt: 2, '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>Демо-доступ (email:пароль):</Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.7rem' }}>Админ → Sxnctified@gmail.com:Sxnctified</Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.7rem' }}>Руководитель → manager@test.ru:123456</Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.7rem' }}>Прораб → foreman@test.ru:123456</Typography>
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', fontSize: '0.7rem' }}>Снабженец → supplier@test.ru:123456</Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
