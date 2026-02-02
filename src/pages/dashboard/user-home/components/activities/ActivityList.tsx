import { Timeline, timelineItemClasses } from '@mui/lab';
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { dashboardSpacing } from 'theme/spacing';
import ActivityItem from './ActivityItem';

interface Activity {
  id: string;
  icon: string;
  title: string;
  description: string;
  time: string;
}

interface ActivityListProps {
  activities: Activity[];
  date?: string;
}

const ActivityList = ({ activities, date }: ActivityListProps) => {
  // Get today's date for display in format: (23 July, 2024)
  const todayDate = date || (() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();
    return `${day} ${month}, ${year}`;
  })();

  return (
    <Box
      sx={{
        mt: dashboardSpacing.contentGapXs,
        px: dashboardSpacing.cardPaddingSm,
        flex: 1,
        overflowY: 'auto',
      }}
    >
      <Stack pb={1}>
        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
          Today <Typography component="span" variant="subtitle1" color="text.secondary" sx={{ fontWeight: 400 }}>
            ({todayDate})
          </Typography>
        </Typography>
      </Stack>

      <Timeline
        sx={{
          p: 0,
          m: 0,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            icon={activity.icon}
            title={activity.title}
            description={activity.description}
            time={activity.time}
            isLast={index === activities.length - 1}
            index={index}
          />
        ))}
      </Timeline>
    </Box>
  );
};

export default ActivityList;

