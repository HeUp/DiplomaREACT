import { Chip } from '@mui/material';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
} from '../../../data-access/types';

const StatusChip = ({ status, type = 'task' }) => {
  if (type === 'task') {
    return (
      <Chip
        label={TASK_STATUS_LABELS[status] || status}
        color={TASK_STATUS_COLORS[status] || 'default'}
        size="small"
      />
    );
  }

  return <Chip label={status} size="small" />;
};

export default StatusChip;
