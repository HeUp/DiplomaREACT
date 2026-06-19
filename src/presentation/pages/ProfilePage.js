import { useState, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  Divider, CircularProgress, Avatar, IconButton, Badge,
} from '@mui/material';
import { Save, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile, uploadProfilePhoto } = useAuth();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      await uploadProfilePhoto(file);
      setSuccess('Фото профиля обновлено');
    } catch {
      setError('Ошибка загрузки фото');
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const avatarSrc = user?.profile_picture
    ? user.profile_picture.startsWith('data:')
      ? user.profile_picture
      : `/uploads/${user.profile_picture}`
    : undefined;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim()) { setError('Имя не может быть пустым'); return; }
    if (!email.trim()) { setError('Email не может быть пустым'); return; }
    if (newPassword && newPassword !== confirmPassword) {
      setError('Пароли не совпадают'); return;
    }
    if (newPassword && newPassword.length < 4) {
      setError('Новый пароль должен быть минимум 4 символа'); return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Профиль сохранён');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: { xs: 2, sm: 4 }, mb: 4 }}>
      <Card sx={{ borderRadius: { xs: 2, sm: 4 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Профиль
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {user?.role} — {user?.email}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 32,
                    height: 32,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                >
                  {photoUploading ? <CircularProgress size={16} color="inherit" /> : <PhotoCamera fontSize="small" />}
                </IconButton>
              }
            >
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 40,
                  bgcolor: 'secondary.main',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.85 },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.full_name?.[0] || 'U'}
              </Avatar>
            </Badge>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Нажмите на аватар или на иконку камеры, чтобы изменить фото
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSave}>
            <TextField
              label="Имя пользователя"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">Смена пароля</Typography>
            </Divider>

            <TextField
              label="Текущий пароль"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Новый пароль"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Повторите новый пароль"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
