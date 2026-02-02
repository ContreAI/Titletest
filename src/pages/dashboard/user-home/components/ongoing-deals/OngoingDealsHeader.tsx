import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';

const OngoingDealsHeader = () => {
  const navigate = useNavigate();

  const handleNewDeal = () => {
    console.log('[OngoingDealsHeader] New Deal clicked, navigating to:', paths.createTransaction);
    navigate(paths.createTransaction);
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
      <Typography variant="h3">
        Ongoing Deals
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add" />}
          onClick={handleNewDeal}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
          }}
        >
          New Deal
        </Button>
        <Button
          size="small"
          sx={{
            minWidth: 'auto',
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.elevation1',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'divider',
            },
          }}
        >
          <IconifyIcon icon="material-symbols:more-horiz" sx={{ fontSize: 20, color: 'text.secondary' }} />
        </Button>
      </Stack>
    </Stack>
  );
};

export default OngoingDealsHeader;

