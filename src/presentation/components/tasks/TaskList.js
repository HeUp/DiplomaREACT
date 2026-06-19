import { Box, Typography } from '@mui/material';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, onAction, onClick, groupByObject = false, showPhoto = true, showDelete = false }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        Нет задач
      </Typography>
    );
  }

  if (!groupByObject) {
    return (
      <Box>
        {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAction={onAction}
              onClick={onClick}
              showPhoto={showPhoto}
              showDelete={showDelete}
            />
        ))}
      </Box>
    );
  }

  const grouped = tasks.reduce((acc, task) => {
    const key = task.objectName || 'Без объекта';
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <Box>
      {Object.entries(grouped).map(([objectName, objectTasks]) => (
        <Box key={objectName} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
            {objectName}
          </Typography>
          {objectTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAction={onAction}
              onClick={onClick}
              showPhoto={showPhoto}
              showDelete={showDelete}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default TaskList;
