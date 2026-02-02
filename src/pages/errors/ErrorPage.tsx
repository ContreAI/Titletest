import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useRouteError } from 'react-router';
import IconifyIcon from 'components/base/IconifyIcon';

const ErrorPage = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  console.error('Route error:', error);

  // Check if it's a chunk loading error (common after deployments)
  const isChunkLoadError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed') ||
    error?.message?.includes('error loading dynamically imported module') ||
    error?.name === 'ChunkLoadError';

  if (isChunkLoadError) {
    console.log('Detected chunk load error - reloading page to get latest version...');
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
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
                  bgcolor: 'info.lighter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconifyIcon icon="solar:refresh-circle-bold-duotone" width={48} color="info.main" />
              </Box>
              <Box>
                <Typography variant="h4" gutterBottom>
                  New Version Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The app has been updated. Refreshing to load the latest version...
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleReload = () => {
    window.location.reload();
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
          <Stack spacing={3} alignItems="center" textAlign="center" direction="column">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'error.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconifyIcon icon="solar:danger-triangle-bold-duotone" width={48} color="error.main" />
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom>
                Unexpected Error
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {error?.statusText || error?.message || 'Something went wrong'}
              </Typography>
            </Box>

            {error && process.env.NODE_ENV === 'development' && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {error.stack || error.toString()}
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleReload} startIcon={<IconifyIcon icon="solar:refresh-bold-duotone" />}>
                Reload Page
              </Button>
              <Button variant="outlined" onClick={handleGoHome} startIcon={<IconifyIcon icon="solar:home-bold-duotone" />}>
                Go Home
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ErrorPage;

