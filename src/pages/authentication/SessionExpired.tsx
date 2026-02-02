/**
 * Session Expired Page
 * 
 * Shown when user session has expired
 * Provides option to login again
 */

import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import IconifyIcon from 'components/base/IconifyIcon';

const SessionExpired = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/authentication/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center" textAlign="center" direction={"column"}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'warning.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconifyIcon icon="solar:logout-2-bold-duotone" width={48} color="warning.main" />
            </Box>
            
            <Box>
              <Typography variant="h4" gutterBottom>
                Session Expired
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your session has expired. Please login again to continue.
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              startIcon={<IconifyIcon icon="solar:login-2-bold-duotone" />}
              sx={{ mt: 2 }}
            >
              Login Again
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default SessionExpired;

