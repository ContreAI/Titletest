/**
 * Transaction Invite Claim Page
 *
 * Automatically claims the transaction invite for authenticated users.
 * Redirects to the transaction detail page on success.
 */

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
import axios from 'services/axios/axiosInstance';
import { apiEndpoints } from 'routes/paths';
import paths from 'routes/paths';

type ClaimStatus = 'loading' | 'claiming' | 'success' | 'error' | 'unauthenticated';

interface ClaimInviteResponse {
  success: boolean;
  participant?: {
    id: string;
    transactionId: string;
    userId: string;
    status: string;
  };
  message?: string;
}

const TransactionInviteClaimPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, initSession } = useAuthStore();

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
        // Note: axiosInstance interceptor returns response.data directly
        const response = await axios.post<ClaimInviteResponse>(
          apiEndpoints.transactionInvites.claim(token)
        ) as unknown as ClaimInviteResponse;

        if (response.success && response.participant) {
          // Clear pending invite from session storage
          sessionStorage.removeItem('contre_pending_transaction_invite');

          setStatus('success');

          // Redirect to transaction detail after a short delay
          setTimeout(() => {
            navigate(paths.dealDetails(response.participant!.transactionId));
          }, 2000);
        } else {
          setError(response.message || 'Failed to claim invite');
          setStatus('error');
        }
      } catch (err: unknown) {
        console.error('Failed to claim invite:', err);
        const error = err as { status?: number; data?: { transactionId?: string; message?: string } };

        // Handle specific error cases
        if (error.status === 409) {
          setError('You are already a participant in this transaction');
          // Still redirect to the transaction
          const txId = error.data?.transactionId;
          if (txId) {
            setTimeout(() => navigate(paths.dealDetails(txId)), 2000);
          }
        } else if (error.status === 410) {
          setError('This invite has expired');
        } else if (error.status === 403) {
          setError('Email address does not match the invite');
        } else if (error.status === 404) {
          setError('This invite is invalid or has already been claimed');
        } else {
          setError(error.data?.message || 'Failed to claim invite. Please try again.');
        }
        setStatus('error');
      }
    };

    claimInvite();
  }, [token, isAuthenticated, initSession, navigate]);

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
              {status === 'loading' ? 'Validating...' : 'Joining transaction...'}
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
            <Typography variant="h6">Welcome to the transaction!</Typography>
            <Typography variant="body2" color="text.secondary">
              You have successfully joined. Redirecting...
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

export default TransactionInviteClaimPage;
