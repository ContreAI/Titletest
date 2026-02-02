import { Card, CardContent, Typography, LinearProgress, Grid, Box } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface UsageMetric {
  value: number;
  max: number;
}

interface UsageMetricsProps {
  documentsAnalyzed: UsageMetric;
  timeSaved: UsageMetric;
  criticalErrors: UsageMetric;
}

const UsageMetrics = ({ documentsAnalyzed, timeSaved, criticalErrors }: UsageMetricsProps) => {
  const getUsagePercentage = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  const MetricCard = ({
    icon,
    label,
    value,
    max,
    color = 'primary',
    padValue = false,
  }: {
    icon: string;
    label: string;
    value: number;
    max: number;
    color?: 'primary' | 'success' | 'warning';
    padValue?: boolean;
  }) => {
    const getColor = (theme: any) => {
      if (color === 'warning') return theme.palette.warning.main;
      if (color === 'success') return theme.palette.chGreen[550] || '#2E7D32';
      return theme.palette.primary.main;
    };

    return (
      <Card
        sx={{
          bgcolor: 'background.elevation1',
          height: '100%',
          boxShadow: 'none',
          border: 0,
          borderRadius: 0.75, // 6px
        }}
      >
        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ position: 'relative', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ pr: 4 }}>
              {label}
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}
            >
              <IconifyIcon
                icon={icon}
                sx={{ fontSize: 24, color: (theme) => getColor(theme) }}
              />
            </Box>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: (theme) => theme.typography.fontFamily,
              fontWeight: 700,
              fontSize: '1.25rem',
              mb: 1,
            }}
          >
            {padValue ? value.toString().padStart(2, '0') : value}
          </Typography>
          <Box sx={{ mt: 'auto' }}>
            <LinearProgress
              variant="determinate"
              value={getUsagePercentage(value, max)}
              sx={{
                height: 8,
                borderRadius: '9999px',
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  bgcolor: (theme) => getColor(theme),
                  borderRadius: '9999px',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MetricCard
          icon="custom:account-metric-doc"
          label="Documents Analyzed"
          value={documentsAnalyzed.value}
          max={documentsAnalyzed.max}
          color="primary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MetricCard
          icon="custom:account-metric-time"
          label="Time Saved"
          value={timeSaved.value}
          max={timeSaved.max}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MetricCard
          icon="custom:account-metric-error"
          label="Critical Errors"
          value={criticalErrors.value}
          max={criticalErrors.max}
          color="warning"
          padValue={true}
        />
      </Grid>
    </Grid>
  );
};

export default UsageMetrics;

