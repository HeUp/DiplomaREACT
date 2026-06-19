import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  MATERIAL_REQUEST_STATUS_LABELS,
  MATERIAL_REQUEST_STATUS_COLORS,
} from '../../../data-access/types';

const MaterialRequestCard = ({ request, onStatusChange }) => {
  const statusList = ['new', 'processing', 'ordered', 'in_stock', 'delivered'];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {request.materialName}
          </Typography>
          <Chip
            label={MATERIAL_REQUEST_STATUS_LABELS[request.status] || request.status}
            color={MATERIAL_REQUEST_STATUS_COLORS[request.status] || 'default'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Количество: {request.quantity} {request.unit || 'шт.'}
        </Typography>

        {request.objectName && (
          <Typography variant="body2" color="text.secondary">
            Объект: {request.objectName}
          </Typography>
        )}

        {request.taskTitle && (
          <Typography variant="body2" color="text.secondary">
            Задача: {request.taskTitle}
          </Typography>
        )}

        {request.comment && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {request.comment}
          </Typography>
        )}

        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {statusList
            .filter((s) => s !== request.status)
            .map((s) => (
              <Chip
                key={s}
                label={MATERIAL_REQUEST_STATUS_LABELS[s]}
                size="small"
                variant="outlined"
                onClick={() => onStatusChange?.(request.id, s)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MaterialRequestCard;
