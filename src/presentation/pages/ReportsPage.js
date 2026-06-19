import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { taskApi } from '../../data-access/api/taskApi';

const ReportsPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskApi
      .getAll()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const groupByObject = () => {
    const grouped = {};
    tasks.forEach((t) => {
      const key = t.objectName || 'Без объекта';
      if (!grouped[key]) grouped[key] = { total: 0, completed: 0, inProgress: 0, onHold: 0 };
      grouped[key].total++;
      if (t.status === 'completed' || t.status === 'approved') grouped[key].completed++;
      if (t.status === 'in_progress') grouped[key].inProgress++;
      if (t.status === 'on_hold') grouped[key].onHold++;
    });
    return grouped;
  };

  const groupByBrigade = () => {
    const grouped = {};
    tasks.forEach((t) => {
      const key = t.assignedToName || 'Не назначено';
      if (!grouped[key]) grouped[key] = { total: 0, completed: 0 };
      grouped[key].total++;
      if (t.status === 'completed' || t.status === 'approved') grouped[key].completed++;
    });
    return grouped;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const byObject = groupByObject();
  const byBrigade = groupByBrigade();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Отчёты
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Выполнение по объектам
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Объект</TableCell>
                <TableCell align="right">Всего задач</TableCell>
                <TableCell align="right">Выполнено</TableCell>
                <TableCell align="right">В работе</TableCell>
                <TableCell align="right">Приостановлено</TableCell>
                <TableCell align="right">% выполнения</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(byObject).map(([name, stats]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell align="right">{stats.total}</TableCell>
                  <TableCell align="right">{stats.completed}</TableCell>
                  <TableCell align="right">{stats.inProgress}</TableCell>
                  <TableCell align="right">{stats.onHold}</TableCell>
                  <TableCell align="right">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Выполнение по бригадам
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Бригада / Исполнитель</TableCell>
                <TableCell align="right">Всего задач</TableCell>
                <TableCell align="right">Выполнено</TableCell>
                <TableCell align="right">% выполнения</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(byBrigade).map(([name, stats]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell align="right">{stats.total}</TableCell>
                  <TableCell align="right">{stats.completed}</TableCell>
                  <TableCell align="right">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Button variant="outlined" startIcon={<Download />}>
        Экспорт в Excel
      </Button>
    </Box>
  );
};

export default ReportsPage;
