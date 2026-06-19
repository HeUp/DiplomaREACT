import { Card, CardContent, Typography, Box } from '@mui/material';

const KPICard = ({ title, value, subtitle, color = 'primary.main', icon }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{ color: 'grey.300', fontSize: 48 }}>{icon}</Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
