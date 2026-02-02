import { Box, Stack, Typography } from '@mui/material';

interface RiskAlert {
  level: 'high' | 'medium' | 'low';
  count: number;
}

interface RiskAlertsProps {
  alerts: RiskAlert[];
}

const getRiskConfig = (level: string) => {
  switch (level) {
    case 'high':
      return { label: 'High Risk', color: 'error.main' };
    case 'medium':
      return { label: 'Med Risk', color: 'warning.main' };
    case 'low':
      return { label: 'Low Risk', color: 'success.main' };
    default:
      return { label: 'Risk', color: 'text.secondary' };
  }
};

const RiskAlerts = ({ alerts }: RiskAlertsProps) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1.5, sm: 2, md: 4 }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      sx={{
        bgcolor: 'background.subtle',
        px: 2,
        py: 1.5,
        borderRadius: 2,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
        Risk Alerts
      </Typography>
      
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 1.5, md: 2 }}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        {alerts.map((alert, index) => {
          const config = getRiskConfig(alert.level);
          return (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: config.color,
                  flexShrink: 0,
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.primary', 
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {config.label}: {alert.count}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default RiskAlerts;

