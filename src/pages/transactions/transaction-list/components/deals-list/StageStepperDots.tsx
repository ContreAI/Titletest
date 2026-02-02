import { Box, Typography, useTheme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import type { DealStage } from 'types/deals';

interface StageStepperDotsProps {
  stages: DealStage[];
}

/**
 * StageStepperDots - Connected dots showing deal stage progress
 *
 * Design: ●───●───●───○───○
 *         Active  Post EM  Inspection  Financing  Closing
 *                 ↑ current
 *
 * - Completed stages: filled dot in success color
 * - Current stage: filled dot with ring/glow effect
 * - Future stages: outline dot in muted color
 * - Lines: solid for completed, lighter for future
 */
const StageStepperDots = ({ stages }: StageStepperDotsProps) => {
  const theme = useTheme();

  // Find the current stage (first incomplete stage, or last if all complete)
  const currentIndex = stages.findIndex((stage) => !stage.completed);
  const allCompleted = currentIndex === -1;
  const effectiveCurrentIndex = allCompleted ? stages.length - 1 : currentIndex;

  // Get the current stage name (show "Closed" if all stages complete)
  const currentStageName = allCompleted ? 'Closed' : stages[effectiveCurrentIndex]?.name || '';

  // Determine stage state
  const getStageState = (index: number): 'completed' | 'current' | 'future' => {
    if (index < effectiveCurrentIndex) return 'completed';
    if (index === effectiveCurrentIndex) return 'current';
    return 'future';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {/* Dots and Lines */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {stages.map((stage, index) => {
          const state = getStageState(index);
          const isLast = index === stages.length - 1;

          return (
            <Box
              key={stage.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Dot - or checkmark icon for final completed stage */}
              {isLast && allCompleted ? (
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconifyIcon
                    icon="mdi:check"
                    sx={{
                      fontSize: (theme) => theme.typography.caption.fontSize,
                      color: 'white',
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: state === 'current' ? 10 : 8,
                    height: state === 'current' ? 10 : 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    ...(state === 'completed' && {
                      bgcolor: theme.palette.success.main,
                    }),
                    ...(state === 'current' && {
                      bgcolor: theme.palette.primary.main,
                      boxShadow: `0 0 0 3px ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.2)'}`,
                    }),
                    ...(state === 'future' && {
                      bgcolor: 'transparent',
                      border: '2px solid',
                      borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400],
                    }),
                  }}
                />
              )}

              {/* Connecting Line (not after last dot) */}
              {!isLast && (
                <Box
                  sx={{
                    width: { xs: 16, sm: 24 },
                    height: 2,
                    flexShrink: 0,
                    transition: 'background-color 0.2s ease',
                    bgcolor:
                      state === 'completed' || state === 'current'
                        ? theme.palette.success.main
                        : theme.palette.mode === 'dark'
                          ? theme.palette.grey[700]
                          : theme.palette.grey[300],
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Current Stage Label */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: allCompleted ? 600 : 500,
          color: allCompleted ? 'success.main' : 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {currentStageName}
      </Typography>
    </Box>
  );
};

export default StageStepperDots;

