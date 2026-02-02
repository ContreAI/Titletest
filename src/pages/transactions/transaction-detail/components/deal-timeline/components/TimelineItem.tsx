import { Box, Typography, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material';
import { AlertCircle, AlertTriangle, Check } from 'lucide-react';
import type { TimelineState, AlertLevel, TimelineCheckpoint } from '../types';
import { getStateColors } from '../utils/timeline-colors.utils';

interface TimelineItemProps {
  item: {
    label: string;
    caption?: string;
    date?: string | null;
    state: TimelineState;
    alertLevel?: AlertLevel;
    alertMessage?: string;
    daysOverdue?: number;
    checkpoints?: TimelineCheckpoint[];
  };
  index: number;
  dotSize: number;
  stemHeight: number;
  isMobile: boolean;
}

const TimelineItem = ({ item, dotSize, stemHeight, isMobile: _isMobile }: TimelineItemProps) => {
  const theme = useTheme();
  const state = item.state || 'future';
  const alertLevel = item.alertLevel || 'none';
  const hasAlert = alertLevel !== 'none' && state !== 'past';
  const isError = alertLevel === 'error';
  const colors = getStateColors(state, theme, alertLevel);

  // Render dot content based on state and alert
  const renderDotContent = () => {
    if (state === 'not_applicable') {
      return (
        <Typography
          sx={{
            fontSize: '0.5rem',
            fontWeight: 600,
            color: theme.palette.text.disabled,
          }}
        >
          N/A
        </Typography>
      );
    }

    if (state === 'past') {
      return <Check size={dotSize * 0.6} color={theme.palette.common.white} strokeWidth={3} />;
    }

    if (hasAlert) {
      const IconComponent = isError ? AlertCircle : AlertTriangle;
      const iconColor = isError ? theme.palette.error.main : theme.palette.warning.main;
      return <IconComponent size={dotSize * 0.65} color={iconColor} />;
    }

    if (state === 'current') {
      return (
        <Box
          sx={{
            width: dotSize * 0.3,
            height: dotSize * 0.3,
            borderRadius: '50%',
            bgcolor: theme.palette.success.main,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        />
      );
    }

    return null;
  };

  // Tooltip content for alerts
  const tooltipContent = hasAlert && item.alertMessage ? (
    <Box>
      <Typography variant="caption" fontWeight={600}>
        {item.alertMessage}
      </Typography>
      {item.daysOverdue && item.daysOverdue > 0 && (
        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
          {item.daysOverdue} day{item.daysOverdue > 1 ? 's' : ''} overdue
        </Typography>
      )}
    </Box>
  ) : item.label;

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          flex: 1,
          opacity: colors.opacity,
          transition: 'opacity 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            opacity: 1,
          },
        }}
      >
        {/* Label (positioned above the rail) */}
        <Typography
          sx={{
            position: 'absolute',
            top: { xs: -34, sm: -28 },
            left: { xs: 0, sm: '50%' },
            fontWeight: colors.labelWeight,
            color: colors.label,
            fontSize: { xs: '0.625rem', sm: '0.6875rem' },
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
            letterSpacing: state === 'current' || hasAlert ? '-0.01em' : '0.01em',
            transform: { xs: 'rotate(-35deg)', sm: 'translateX(-50%)' },
            transformOrigin: { xs: 'bottom left', sm: 'center' },
            textAlign: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {state === 'not_applicable' ? 'N/A (Cash)' : item.label}
        </Typography>

        {/* Vertical stem connecting rail to dot */}
        <Box
          sx={{
            width: 2,
            height: stemHeight,
            bgcolor: colors.stem,
            transition: 'background-color 0.3s ease',
            ...(state === 'not_applicable' && {
              borderLeft: `1px dashed ${theme.palette.grey[400]}`,
              bgcolor: 'transparent',
            }),
          }}
        />

        {/* Dot with alert badge */}
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              bgcolor: colors.dot,
              boxShadow: colors.dotBorder,
              transition: 'all 0.3s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...(state === 'not_applicable' && {
                border: `1px dashed ${theme.palette.grey[400]}`,
                boxShadow: 'none',
              }),
            }}
          >
            {renderDotContent()}
          </Box>

          {/* Alert badge */}
          {hasAlert && (
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: isError ? 'error.main' : 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 1,
              }}
            >
              <Typography
                sx={{
                  color: 'common.white',
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                !
              </Typography>
            </Box>
          )}
        </Box>

        {/* Caption (below dot) */}
        <Typography
          sx={{
            color: colors.caption,
            fontSize: { xs: '0.5625rem', sm: '0.625rem' },
            textAlign: 'center',
            mt: 0.5,
            fontWeight: state === 'current' || hasAlert ? 500 : 400,
            whiteSpace: 'nowrap',
            transition: 'color 0.3s ease',
          }}
        >
          {state === 'not_applicable' ? '—' : (item.caption || '—')}
        </Typography>

        {/* Alert message for current/in-progress items */}
        {hasAlert && item.alertMessage && (
          <Typography
            sx={{
              fontSize: '0.5rem',
              fontWeight: 600,
              mt: 0.25,
              color: isError ? 'error.main' : 'warning.dark',
              whiteSpace: 'nowrap',
              maxWidth: 80,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.alertMessage}
          </Typography>
        )}

        {/* Checkpoints indicator */}
        {item.checkpoints && item.checkpoints.length > 0 && state !== 'not_applicable' && (
          <Box
            sx={{
              display: 'flex',
              gap: 0.25,
              mt: 0.5,
            }}
          >
            {item.checkpoints.map((cp) => (
              <Tooltip key={cp.id} title={cp.label} arrow>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: cp.complete ? 'success.main' : 'grey.300',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default TimelineItem;

