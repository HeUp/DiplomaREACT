import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Edit,
  Delete,
  PhotoCamera,
  CheckCircle,
  PauseCircle,
  PlayCircle,
} from '@mui/icons-material';
import StatusChip from '../common/StatusChip';
import {
  TASK_STATUS,
} from '../../../data-access/types';

const actionIcon = (status) => {
  switch (status) {
    case TASK_STATUS.ASSIGNED:
      return { icon: <CheckCircle />, label: 'Принять' };
    case TASK_STATUS.ACCEPTED:
      return { icon: <PlayCircle />, label: 'Начать' };
    case TASK_STATUS.IN_PROGRESS:
      return { icon: <PauseCircle />, label: 'Приостановить' };
    default:
      return null;
  }
};

const TaskCard = ({ task, onAction, onClick, showPhoto = true, showDelete = false }) => {
  const action = actionIcon(task.status);

  return (
    <Card
      sx={{ mb: { xs: 1.5, sm: 2 }, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
      onClick={() => onClick?.(task)}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            {task.title}
          </Typography>
          <StatusChip status={task.status} />
        </Box>

        <Box sx={{ '& p': { my: 0.5, fontSize: '0.875rem', color: 'text.secondary' } }}>
          {task.objectName && <p>Объект: {task.objectName}</p>}
          {(task.planned_end_date || task.plannedDate) && (
            <p>Срок: {new Date(task.planned_end_date || task.plannedDate).toLocaleDateString('ru-RU')}</p>
          )}
          {task.assignedToName && <p>Исполнитель: {task.assignedToName}</p>}
          <p>{task.description}</p>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end' }}>
        {action && (
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(task, task.status);
            }}
            title={action.label}
          >
            {action.icon}
          </IconButton>
        )}
        {showPhoto && task.status === TASK_STATUS.IN_PROGRESS && (
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(task, 'photo');
            }}
            title="Добавить фото"
          >
            <PhotoCamera />
          </IconButton>
        )}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.(task, 'edit');
          }}
        >
          <Edit />
        </IconButton>
        {showDelete && (
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(task, 'delete');
            }}
          >
            <Delete />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};

export default TaskCard;
