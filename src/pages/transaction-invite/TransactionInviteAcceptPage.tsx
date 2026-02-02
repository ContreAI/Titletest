/**
 * Transaction Invite Accept Page
 *
 * Public page for accepting transaction participation invites.
 * Validates the invite token and shows invite details before accepting.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAuthStore } from 'modules/auth';
import axios from 'services/axios/axiosInstance';
import { apiEndpoints } from 'routes/paths';
import paths from 'routes/paths';
import type { ParticipantRole, ParticipantPermissionLevel } from 'modules/transaction-participants';
import { getRoleLabel, getPermissionLabel } from 'modules/transaction-participants';

interface TransactionInviteDetails {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: ParticipantRole;
  roleLabel?: string;
  permissionLevel: ParticipantPermissionLevel;
  personalMessage?: string;
  expiresAt: string;
  transaction: {
    id: string;
    name: string;
    propertyAddress?: {
      streetAddress?: string;
      city?: string;
      state?: string;
    };
  };
  invitedBy: {
    name: string;
    email: string;
  };
}

interface ValidateInviteResponse {
  valid: boolean;
  invite?: TransactionInviteDetails;
  error?: {
    code: string;
    message: string;
  };
}

const TransactionInviteAcceptPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<TransactionInviteDetails | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setIsLoading(false);
      return;
    }

    const validateInvite = async () => {
      try {
        // Note: axiosInstance interceptor returns response.data directly
        const response = await axios.get<ValidateInviteResponse>(
          apiEndpoints.transactionInvites.validate(token)
        ) as unknown as ValidateInviteResponse;

        if (response.valid && response.invite) {
          setInvite(response.invite);
        } else {
          setError(response.error?.message || 'Invalid or expired invite');
        }
      } catch (err: unknown) {
        console.error('Failed to validate invite:', err);
        const error = err as { status?: number };
        if (error.status === 404) {
          setError('This invite link is invalid or has already been used');
        } else if (error.status === 410) {
          setError('This invite has expired');
        } else {
          setError('Failed to validate invite. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  const handleAccept = () => {
    if (!token || !invite) return;

    if (isAuthenticated && user?.email === invite.email) {
      // User is already logged in with matching email - go directly to claim
      navigate(paths.transactionInviteClaim(token));
    } else {
      // Store invite token for after signup
      sessionStorage.setItem('contre_pending_transaction_invite', JSON.stringify({
        token,
        email: invite.email,
        transactionId: invite.transaction.id,
        timestamp: Date.now(),
      }));

      // Redirect to signup with invite context
      const authUrl = import.meta.env.VITE_AUTH_URL || 'https://contre.ai';
      const claimUrl = `${window.location.origin}${paths.transactionInviteClaim(token)}`;

      window.location.href = `${authUrl}/authentication/signup?` +
        `invite=${encodeURIComponent(token)}` +
        `&email=${encodeURIComponent(invite.email)}` +
        `&type=transaction` +
        `&redirectTo=${encodeURIComponent(claimUrl)}`;
    }
  };

  const handleDecline = () => {
    // Simply navigate away - no need to call an API for declining
    navigate('/');
  };

  const formatAddress = (addr?: TransactionInviteDetails['transaction']['propertyAddress']) => {
    if (!addr) return 'Address not available';
    return [addr.streetAddress, addr.city, addr.state].filter(Boolean).join(', ');
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
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
          <IconifyIcon
            icon="mdi:alert-circle-outline"
            sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            Invalid Invite
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!invite) return null;

  const isEmailMismatch = isAuthenticated && user?.email !== invite.email;

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
      <Paper sx={{ p: 4, maxWidth: 480, width: '100%' }}>
        <Stack spacing={3} alignItems="center">
          {/* Header */}
          <IconifyIcon
            icon="mdi:home-account"
            sx={{ fontSize: 64, color: 'primary.main' }}
          />
          <Typography variant="h5" fontWeight={600} textAlign="center">
            Transaction Invitation
          </Typography>

          {/* Transaction Info */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 2,
              width: '100%',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {invite.transaction.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatAddress(invite.transaction.propertyAddress)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Invited by {invite.invitedBy.name}
            </Typography>
          </Box>

          {/* Personal Message */}
          {invite.personalMessage && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.50',
                borderRadius: 2,
                width: '100%',
                borderLeft: 3,
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="body2" fontStyle="italic">
                "{invite.personalMessage}"
              </Typography>
            </Box>
          )}

          {/* Invite Details */}
          <Box sx={{ width: '100%' }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {invite.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Your Role:
                </Typography>
                <Chip
                  label={invite.roleLabel || getRoleLabel(invite.role)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Access Level:
                </Typography>
                <Chip
                  label={getPermissionLabel(invite.permissionLevel)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Stack>
          </Box>

          {/* Email Mismatch Warning */}
          {isEmailMismatch && (
            <Alert severity="warning" sx={{ width: '100%' }}>
              <Typography variant="body2">
                You are currently logged in as <strong>{user?.email}</strong>, but this invite
                was sent to <strong>{invite.email}</strong>.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please log out and sign in with the invited email address.
              </Typography>
            </Alert>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="soft"
              color="neutral"
              fullWidth
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAccept}
              disabled={isEmailMismatch}
              startIcon={<IconifyIcon icon="mdi:check" />}
            >
              {isAuthenticated && user?.email === invite.email
                ? 'Accept & Join'
                : 'Accept & Sign Up'}
            </Button>
          </Stack>

          {isEmailMismatch && (
            <Button
              variant="text"
              size="small"
              onClick={() => {
                const authUrl = import.meta.env.VITE_AUTH_URL || 'https://contre.ai';
                window.location.href = `${authUrl}/authentication/logout?redirectTo=${encodeURIComponent(window.location.href)}`;
              }}
            >
              Log out and use different account
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default TransactionInviteAcceptPage;
