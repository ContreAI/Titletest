import { Box, Paper, Skeleton, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { dashboardSpacing } from 'theme/spacing';

/**
 * TransactionDetailSkeleton - Full page skeleton for TransactionDetail
 *
 * Matches the exact layout of TransactionDetail page including:
 * - Header section with breadcrumb and title
 * - Timeline section with milestone dots
 * - Insight cards (3 cards in a row)
 * - Documents section
 * - Deal details section
 */
const TransactionDetailSkeleton = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* Header Section */}
        <Grid size={12}>
          <Paper sx={{ bgcolor: 'background.paper', p: 2 }}>
            <Grid container direction="column" spacing={1.5}>
              {/* Breadcrumb skeleton */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Skeleton variant="text" width={40} height={20} />
                  <Skeleton variant="text" width={8} height={20} />
                  <Skeleton variant="text" width={80} height={20} />
                  <Skeleton variant="text" width={8} height={20} />
                  <Skeleton variant="text" width={120} height={20} />
                </Box>
              </Grid>

              {/* Header with title and actions */}
              <Grid size={12}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                  }}
                >
                  {/* Title */}
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={36} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Timeline Section */}
        <Grid size={12} sx={{ px: 2 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            {/* Timeline header */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={100} height={24} />
            </Box>

            {/* Timeline content */}
            <Box sx={{ pt: 4, pb: 2, px: 4 }}>
              <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
                {/* Rail */}
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={4}
                  sx={{ position: 'absolute', top: 6 }}
                />

                {/* Timeline dots and labels */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: 80,
                      }}
                    >
                      <Skeleton variant="circular" width={12} height={12} />
                      <Box sx={{ height: 10 }} />
                      <Skeleton variant="text" width={60} height={14} />
                      <Skeleton variant="text" width={50} height={12} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Insight Cards Section - 3 cards */}
        <Grid size={12} sx={{ px: 2 }}>
          <Grid container spacing={2}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
                <InsightCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Documents Section */}
        <Grid size={12} sx={{ px: 2 }}>
          <Paper sx={{ bgcolor: 'background.paper', p: dashboardSpacing.cardPadding }}>
            {/* Section header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={140} height={28} />
              </Box>
              <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 1 }} />
            </Box>

            {/* Document cards */}
            <Stack spacing={dashboardSpacing.listItemSpacing}>
              {Array.from({ length: 3 }).map((_, index) => (
                <DocumentCardSkeleton key={index} />
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Deal Details Section */}
        <Grid size={12} sx={{ px: 2, mb: 2 }}>
          <Paper sx={{ bgcolor: 'background.paper', p: dashboardSpacing.cardPadding }}>
            {/* Section header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={120} height={28} />
            </Box>

            {/* Detail fields */}
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="70%" height={22} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * InsightCardSkeleton - Skeleton for individual insight cards
 */
const InsightCardSkeleton = () => (
  <Paper
    sx={{
      p: dashboardSpacing.cardPadding,
      bgcolor: 'background.paper',
      borderRadius: 1,
      height: '100%',
      minHeight: 200,
    }}
  >
    <Stack spacing={2}>
      {/* Header with icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 1.5 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
      </Box>

      {/* Content lines */}
      <Stack spacing={1}>
        <Skeleton variant="text" width="100%" height={18} />
        <Skeleton variant="text" width="90%" height={18} />
        <Skeleton variant="text" width="75%" height={18} />
      </Stack>

      {/* Action button */}
      <Box sx={{ pt: 1 }}>
        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 1 }} />
      </Box>
    </Stack>
  </Paper>
);

/**
 * DocumentCardSkeleton - Skeleton for document cards
 */
const DocumentCardSkeleton = () => (
  <Paper
    sx={{
      p: { xs: 1.5, sm: 2 },
      bgcolor: 'background.subtle',
      borderRadius: 1,
      overflow: 'hidden',
      width: '100%',
    }}
  >
    <Grid container spacing={1.5}>
      {/* Header */}
      <Grid size={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width="50%" height={22} />
        </Box>
      </Grid>

      {/* Metadata and actions row */}
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          {/* Badges */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1 }} />
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Paper>
);

export default TransactionDetailSkeleton;
export { InsightCardSkeleton, DocumentCardSkeleton };
