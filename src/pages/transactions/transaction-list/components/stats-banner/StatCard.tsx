import { Paper, Box, Typography, alpha, useTheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface StatCardProps {
  icon: string;
  iconColor: string;
  title: string;
  value: string;
  subtitle: string;
}

/**
 * StatCard - Individual stat card for the stats banner
 *
 * Follows MetricCard pattern from dashboard:
 * - Colored icon in rounded box
 * - Large value display
 * - Descriptive subtitle
 */
const StatCard = ({ icon, iconColor, title, value, subtitle }: StatCardProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2.5,
        py: 2,
        bgcolor: 'background.paper',
        height: '100%',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: alpha(iconColor, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <IconifyIcon icon={icon} sx={{ fontSize: theme.typography.h2.fontSize, color: iconColor }} />
      </Box>

      {/* Content */}
      <Box sx={{ minWidth: 0 }}>
        {/* Title */}
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            color: 'text.secondary',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        {/* Value + Subtitle inline */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            variant="h5"
            sx={{
              color: 'text.primary',
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;

