import { Box, Paper, Skeleton, Stack } from '@mui/material';
import { dashboardSpacing } from 'theme/spacing';

interface SkeletonCardProps {
  /** Number of text lines to show in content area */
  lines?: number;
  /** Show icon placeholder */
  showIcon?: boolean;
  /** Show action buttons placeholder */
  showActions?: boolean;
  /** Custom height for the card */
  height?: number | string;
  /** Variant style: 'default' for standard cards, 'subtle' for muted background */
  variant?: 'default' | 'subtle';
}

/**
 * SkeletonCard - Skeleton loader matching the card component shape
 *
 * Used to show loading state with proper layout preservation
 * for card-based content like DocumentCard, ExpandableCard, etc.
 */
const SkeletonCard = ({
  lines = 3,
  showIcon = true,
  showActions = true,
  height,
  variant = 'default',
}: SkeletonCardProps) => {
  return (
    <Paper
      sx={{
        p: { xs: dashboardSpacing.cardPaddingSm, sm: dashboardSpacing.cardPadding },
        bgcolor: variant === 'subtle' ? 'background.subtle' : 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
        width: '100%',
        height,
      }}
    >
      <Stack spacing={dashboardSpacing.contentGapSm}>
        {/* Header row with icon and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showIcon && (
            <Skeleton
              variant="rounded"
              width={40}
              height={40}
              sx={{ flexShrink: 0, borderRadius: 1.5 }}
            />
          )}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={18} />
          </Box>
        </Box>

        {/* Metadata row */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Content lines */}
        <Stack spacing={0.75}>
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={index === lines - 1 ? '75%' : '100%'}
              height={20}
            />
          ))}
        </Stack>

        {/* Action buttons */}
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 1 }}>
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default SkeletonCard;
