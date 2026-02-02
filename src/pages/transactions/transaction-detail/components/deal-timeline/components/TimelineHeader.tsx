import { Box, Typography } from '@mui/material';

const TimelineHeader = () => {
  return (
    <Box
      sx={{
        px: 3,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
        <Typography
          component="h3"
          variant="h5"
          sx={{
            fontWeight: 400,
            color: 'text.primary',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          Key Dates
        </Typography>
    </Box>
  );
};

export default TimelineHeader;

