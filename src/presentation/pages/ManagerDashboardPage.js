import { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Dashboard from '../components/dashboard/Dashboard';
import { taskApi } from '../../data-access/api/taskApi';

const ManagerDashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      taskApi.getAll(),
      taskApi.getAll({ summary: true }).catch(() => null),
    ])
      .then(([tasksData, statsData]) => {
        setTasks(tasksData);
        setStats(statsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <Dashboard stats={stats} tasks={tasks} />;
};

export default ManagerDashboardPage;
