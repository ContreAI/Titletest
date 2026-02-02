import { Stack, Typography } from '@mui/material';

interface GreetingHeaderProps {
  userName?: string;
}

const GreetingHeader = ({ userName }: GreetingHeaderProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Stack spacing={0.5} direction="column" sx={{ mb: 3 }}>
      <Typography variant="h2">
        {getGreeting()}, {userName || 'Captain'}!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Here's a glance at your Real Estate business
      </Typography>
    </Stack>
  );
};

export default GreetingHeader;

