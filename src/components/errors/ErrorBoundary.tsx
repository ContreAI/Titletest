import { Component, ReactNode } from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check if it's a chunk loading error (common after deployments)
    const isChunkLoadError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module') ||
      error.name === 'ChunkLoadError';

    if (isChunkLoadError) {
      console.log('Detected chunk load error - likely due to new deployment. Reloading page...');
      // Reload the page to get the new version
      window.location.reload();
      return;
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
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
              <Stack spacing={3} alignItems="center" textAlign="center">
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
                    Oops! Something went wrong
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We're sorry for the inconvenience. The application encountered an unexpected error.
                  </Typography>
                </Box>

                {this.state.error && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {this.state.error.toString()}
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={this.handleReload} startIcon={<IconifyIcon icon="solar:refresh-bold-duotone" />}>
                    Reload Page
                  </Button>
                  <Button variant="outlined" onClick={this.handleReset} startIcon={<IconifyIcon icon="solar:home-bold-duotone" />}>
                    Go Home
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

