import { Typography, Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Assignment,
  CheckCircle,
  Warning,
  Build,
} from '@mui/icons-material';
import KPICard from './KPICard';

const Dashboard = ({ stats, tasks }) => {
  const totalTasks = tasks?.length || 0;
  const completed = tasks?.filter((t) => t.status === 'completed' || t.status === 'approved').length || 0;
  const onHold = tasks?.filter((t) => t.status === 'on_hold').length || 0;
  const inProgress = tasks?.filter((t) => t.status === 'in_progress').length || 0;

  const completionPercent = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Дашборд проекта
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Всего задач"
            value={totalTasks}
            icon={<Assignment sx={{ fontSize: 48 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Выполнено"
            value={`${completionPercent}%`}
            subtitle={`${completed} из ${totalTasks}`}
            color="success.main"
            icon={<CheckCircle sx={{ fontSize: 48 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="В работе"
            value={inProgress}
            color="warning.main"
            icon={<Build sx={{ fontSize: 48 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Приостановлено"
            value={onHold}
            color="error.main"
            icon={<Warning sx={{ fontSize: 48 }} />}
          />
        </Grid>
      </Grid>

      {stats?.criticalDeviations > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Критические отклонения: {stats.criticalDeviations}
          </Typography>
          <Typography variant="body2">
            Обнаружены задачи с отклонением от плановых сроков. Требуется внимание руководителя.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;
