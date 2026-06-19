import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Typography } from '@mui/material';
import { TASK_STATUS_LABELS } from '../../../data-access/types';

const TaskTimeline = ({ transitions = [] }) => {
  if (!transitions.length) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        История переходов отсутствует
      </Typography>
    );
  }

  return (
    <Timeline position="right">
      {transitions.map((t, idx) => (
        <TimelineItem key={idx}>
          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
            <Typography variant="caption">
              {new Date(t.timestamp).toLocaleString('ru-RU')}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            {idx < transitions.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body2">
              {TASK_STATUS_LABELS[t.toStatus] || t.toStatus}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t.userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.comment || 'без комментария'}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default TaskTimeline;
