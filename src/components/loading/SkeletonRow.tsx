import { Box, Skeleton } from '@mui/material';

interface SkeletonRowProps {
  /** Number of rows to render */
  count?: number;
  /** Show icon placeholder on the left */
  showIcon?: boolean;
  /** Show stage stepper dots on the right */
  showStepper?: boolean;
  /** Spacing between rows (in theme spacing units) */
  spacing?: number;
}

/**
 * SkeletonRow - Skeleton loader matching the DealRow/list row shape
 *
 * Used to show loading state with proper layout preservation
 * for list-based content like DealsListSection.
 */
const SkeletonRow = ({
  count = 1,
  showIcon = true,
  showStepper = true,
  spacing = 1.5,
}: SkeletonRowProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 2 },
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {/* Left Section: Icon + Content */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Icon placeholder */}
            {showIcon && (
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{ flexShrink: 0, borderRadius: 1.5 }}
              />
            )}

            {/* Content */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {/* Title line */}
              <Skeleton variant="text" width="70%" height={22} sx={{ mb: 0.5 }} />

              {/* Price and date line */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={120} height={16} />
              </Box>
            </Box>
          </Box>

          {/* Right Section: Stage Stepper dots */}
          {showStepper && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                flexShrink: 0,
                pl: { xs: 6.5, md: 0 },
                gap: 0.5,
              }}
            >
              {/* Stepper dots */}
              {Array.from({ length: 5 }).map((_, dotIndex) => (
                <Skeleton
                  key={dotIndex}
                  variant="circular"
                  width={12}
                  height={12}
                />
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default SkeletonRow;
