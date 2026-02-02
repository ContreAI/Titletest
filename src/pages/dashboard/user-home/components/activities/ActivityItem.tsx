import {
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { dashboardSpacing } from 'theme/spacing';
import IconifyIcon from 'components/base/IconifyIcon';
import { useStaggeredAnimation } from 'hooks/useStaggeredAnimation';

interface ActivityItemProps {
  icon: string;
  title: string;
  description: string;
  time: string;
  isLast: boolean;
  index?: number;
}

const ActivityItem = ({ icon, title, description, time, isLast, index = 0 }: ActivityItemProps) => {
  const animationSx = useStaggeredAnimation(index);

  return (
    <TimelineItem sx={{ mb: isLast ? 0 : dashboardSpacing.componentSpacing, bgcolor: 'background.elevation1', py: .5, px: dashboardSpacing.contentGapXs , alignItems: 'center', borderRadius: 1, ...animationSx }} >
      <TimelineSeparator>
        <TimelineDot
          sx={{
            boxShadow: 'none',
            border: 0,
            p: dashboardSpacing.contentGapXs,
            bgcolor: 'background.paper',
          }}
        >
          <IconifyIcon icon={icon} sx={{ fontSize: 18, color: 'text.secondary', borderRadius: 1 }} />
        </TimelineDot>
        {/* {!isLast && <TimelineConnector sx={{ bgcolor: 'divider', width: '1px' }} />} */}
      </TimelineSeparator>
      <TimelineContent sx={{ pb: 0, pt: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            <IconifyIcon
              icon="material-symbols:schedule-outline"
              sx={{ fontSize: 14 }}
            />
            <Typography variant="caption">
              {time}
            </Typography>
            <IconButton size="small" sx={{ ml: 0.5 }} aria-label="More activity options">
              <IconifyIcon icon="material-symbols:more-vert" sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
};

export default ActivityItem;

