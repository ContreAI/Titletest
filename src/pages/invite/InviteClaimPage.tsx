import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAuthStore } from 'modules/auth';
import { useTenantStore } from 'modules/tenant/store/tenant.store';
import { teamControllerClaimInvite } from '@contreai/api-client';
import paths from 'routes/paths';
import type { ClaimInviteResponse } from 'modules/team';

type ClaimStatus = 'loading' | 'claiming' | 'success' | 'error' | 'unauthenticated';

const InviteClaimPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, initSession } = useAuthStore();
  const { loadTenantClaims } = useTenantStore();

  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setStatus('error');
      return;
    }

    const claimInvite = async () => {
      // First check if user is authenticated
      if (!isAuthenticated) {
        // Try to initialize session (user might have just signed up)
        try {
          await initSession();
        } catch {
          // Still not authenticated
          setStatus('unauthenticated');
          return;
        }
      }

      setStatus('claiming');

      try {
        const response = await teamControllerClaimInvite(token);
        // Response type is ClaimInviteResponseDto with { success, data }
        const data = response as unknown as ClaimInviteResponse;

        if (data.success) {
          // Clear pending invite from session storage
          sessionStorage.removeItem('contre_pending_invite');

          // Refresh tenant claims to get new membership
          await loadTenantClaims();

          setStatus('success');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate(paths.dashboard);
          }, 2000);
        } else {
          setError(data.message || 'Failed to claim invite');
          setStatus('error');
        }
      } catch (err: any) {
        console.error('Failed to claim invite:', err);

        // Handle specific error cases
        if (err.response?.status === 409) {
          setError('This invite has already been claimed');
        } else if (err.response?.status === 410) {
          setError('This invite has expired');
        } else if (err.response?.status === 403) {
          setError('Email address does not match the invite');
        } else {
          setError(err.message || 'Failed to claim invite. Please try again.');
        }
        setStatus('error');
      }
    };

    claimInvite();
  }, [token, isAuthenticated, initSession, loadTenantClaims, navigate]);

  const handleRetry = () => {
    setStatus('loading');
    setError(null);
    window.location.reload();
  };

  const handleGoToLogin = () => {
    const authUrl = import.meta.env.VITE_AUTH_URL || 'https://contre.ai';
    const returnUrl = window.location.href;
    window.location.href = `${authUrl}/authentication/login?redirectTo=${encodeURIComponent(returnUrl)}`;
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
      <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
        {status === 'loading' || status === 'claiming' ? (
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={48} />
            <Typography variant="h6">
              {status === 'loading' ? 'Validating...' : 'Joining team...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we process your request
            </Typography>
          </Stack>
        ) : status === 'success' ? (
          <Stack spacing={3} alignItems="center">
            <IconifyIcon
              icon="mdi:check-circle"
              sx={{ fontSize: 64, color: 'success.main' }}
            />
            <Typography variant="h6">Welcome to the team!</Typography>
            <Typography variant="body2" color="text.secondary">
              You have successfully joined. Redirecting to dashboard...
            </Typography>
            <CircularProgress size={24} />
          </Stack>
        ) : status === 'unauthenticated' ? (
          <Stack spacing={3} alignItems="center">
            <IconifyIcon
              icon="mdi:account-alert-outline"
              sx={{ fontSize: 64, color: 'warning.main' }}
            />
            <Typography variant="h6">Sign in required</Typography>
            <Typography variant="body2" color="text.secondary">
              Please sign in or create an account to accept this invite.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoToLogin}
              startIcon={<IconifyIcon icon="mdi:login" />}
            >
              Sign In
            </Button>
          </Stack>
        ) : (
          <Stack spacing={3} alignItems="center">
            <IconifyIcon
              icon="mdi:alert-circle-outline"
              sx={{ fontSize: 64, color: 'error.main' }}
            />
            <Typography variant="h6">Something went wrong</Typography>
            <Alert severity="error" sx={{ textAlign: 'left' }}>
              {error}
            </Alert>
            <Stack direction="row" spacing={2}>
              <Button
                variant="soft"
                color="neutral"
                onClick={() => navigate('/')}
              >
                Go Home
              </Button>
              <Button variant="contained" onClick={handleRetry}>
                Try Again
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default InviteClaimPage;
