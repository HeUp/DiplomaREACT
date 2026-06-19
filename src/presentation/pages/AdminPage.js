import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, CircularProgress, Tabs, Tab, Button, Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Storage, Download, Upload, RestartAlt } from '@mui/icons-material';
import UserManagement from '../components/admin/UserManagement';
import ReferencesPage from './ReferencesPage';
import { userApi } from '../../data-access/api/userApi';
import { dbApi } from '../../data-access/db/sqliteDb';
import useUIStore from '../../state/uiStore';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({});
  const showNotification = useUIStore((s) => s.showNotification);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch { showNotification('Ошибка загрузки', 'error'); }
    setLoading(false);
  };

  const handleCreate = async (data) => { try { await userApi.create(data); showNotification('Пользователь создан', 'success'); loadUsers(); } catch { showNotification('Ошибка', 'error'); } };
  const handleUpdate = async (id, data) => { try { await userApi.update(id, data); showNotification('Пользователь обновлён', 'success'); loadUsers(); } catch { showNotification('Ошибка', 'error'); } };
  const handleDelete = async (id) => { try { await userApi.delete(id); showNotification('Пользователь удалён', 'success'); loadUsers(); } catch { showNotification('Ошибка', 'error'); } };

  const handleDownloadDB = async () => {
    const data = await dbApi.exportDB();
    if (!data) return;
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'main.db';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('База данных скачана (main.db)', 'success');
  };

  const handleImportDB = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await dbApi.importDB(file);
      showNotification('База данных импортирована', 'success');
      setStats(dbApi.getStats());
      loadUsers();
    } catch { showNotification('Ошибка импорта', 'error'); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDB = async () => {
    if (!window.confirm('Сбросить базу данных? Все данные будут удалены.')) return;
    await dbApi.resetDB();
    showNotification('База данных сброшена', 'info');
    setStats(dbApi.getStats());
    loadUsers();
  };

  const loadStats = () => { setStats(dbApi.getStats()); };

  useEffect(() => { if (tab === 2) loadStats(); }, [tab]);

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Администрирование</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Пользователи" />
        <Tab label="Справочники" />
        <Tab label="База данных" icon={<Storage />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <UserManagement users={users} onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}

      {tab === 1 && <ReferencesPage />}

      {tab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Управление базой данных (SQLite)</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(stats).map(([table, count]) => (
              <Grid size={{ xs: 6, sm: 3 }} key={table}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">{count}</Typography>
                  <Typography variant="caption" color="text.secondary">{table}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<Download />} onClick={handleDownloadDB}>
              Скачать main.db
            </Button>
            <Button variant="outlined" color="error" startIcon={<RestartAlt />} onClick={handleResetDB}>
              Сбросить БД
            </Button>
            <input ref={fileInputRef} type="file" accept=".db,.sqlite" style={{ display: 'none' }} onChange={handleImportDB} />
            <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()}>
              Импорт main.db
            </Button>
            <Button variant="text" onClick={loadStats}>Обновить статистику</Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            База данных SQLite хранится в localStorage браузера. main.db создаётся автоматически при первом запуске.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AdminPage;
