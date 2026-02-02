import { Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { dashboardSpacing } from 'theme/spacing';
import { cardHoverStyles } from 'theme/mixins';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: {
    name: string;
    color: string;
  };
  trend?: 'up' | 'down';
  percentage?: number;
}

const MetricCard = ({ title, value, icon, trend = 'up', percentage = 15.8 }: MetricCardProps) => {
  const theme = useTheme();

  const getIconBgColor = () => {
    const [category] = icon.color.split('.');
    
    if (category === 'primary') return alpha(theme.palette.primary.main, 0.1);
    if (category === 'secondary') return alpha(theme.palette.secondary.main, 0.1);
    if (category === 'success') return alpha(theme.palette.success.main, 0.1);
    if (category === 'warning') return alpha(theme.palette.warning.main, 0.1);
    if (category === 'error') return alpha(theme.palette.error.main, 0.1);
    if (category === 'info') return alpha(theme.palette.info.main, 0.1);
    
    return theme.palette.action.hover;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: dashboardSpacing.cardPaddingSm,
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
        minHeight: 90,
        cursor: 'pointer',
        ...cardHoverStyles,
      }}
    >
      <Stack spacing={dashboardSpacing.contentGapSm} direction="column" sx={{ height: '100%' }}>
        {/* Header: Icon + Title */}
        <Stack direction="row" spacing={dashboardSpacing.contentGapSm} alignItems="center">
          <Stack
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: getIconBgColor(),
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            <IconifyIcon
              icon={icon.name}
              sx={{
                fontSize: 20,
                color: icon.color,
              }}
            />
          </Stack>
          <Typography variant="h5" color="text.primary">
            {title}
          </Typography>
        </Stack>

        {/* Value and Trend */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="mono" color="text.secondary">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {percentage !== undefined && percentage !== null && !isNaN(percentage) && (
            <Chip
              icon={
                <IconifyIcon
                  icon={
                    trend === 'up'
                      ? 'material-symbols:trending-up'
                      : 'material-symbols:trending-down'
                  }
                  sx={{
                    fontSize: 16,
                    color: trend === 'up' ? 'success.main' : 'error.main',
                  }}
                />
              }
              label={`${percentage.toFixed(1)}%`}
              size="small"
              sx={{
                height: 18,
                borderRadius: 1,
                bgcolor: trend === 'up' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                color: trend === 'up' ? 'success.main' : 'error.main',
                fontSize: '0.75rem',
                '& .MuiChip-icon': {
                  ml: 0.5,
                },
              }}
            />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default MetricCard;
