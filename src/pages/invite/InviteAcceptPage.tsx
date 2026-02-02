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
  Avatar,
  Chip,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useAuthStore } from 'modules/auth';
import {
  teamControllerValidateInvite,
  teamControllerDeclineInvite,
} from '@contreai/api-client';
import type { InviteDetails, InviteValidationResponse } from 'modules/team';

const InviteAcceptPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteDetails | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link');
      setIsLoading(false);
      return;
    }

    const validateInvite = async () => {
      try {
        const response = await teamControllerValidateInvite(token);
        // Response type is ValidateInviteResponseDto with { success, data }
        const data = response as unknown as InviteValidationResponse;

        if (data.valid && data.invite) {
          setInvite(data.invite);
        } else {
          setError(data.error?.message || 'Invalid invite');
        }
      } catch (err) {
        console.error('Failed to validate invite:', err);
        setError('Failed to validate invite. Please try again.');
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
      navigate(`/invite/${token}/claim`);
    } else {
      // Store invite token for after signup
      sessionStorage.setItem('contre_pending_invite', JSON.stringify({
        token,
        email: invite.email,
        timestamp: Date.now(),
      }));

      // Redirect to signup with invite context
      const authUrl = import.meta.env.VITE_AUTH_URL || 'https://contre.ai';
      const claimUrl = `${window.location.origin}/invite/${token}/claim`;

      window.location.href = `${authUrl}/authentication/signup?` +
        `invite=${encodeURIComponent(token)}` +
        `&email=${encodeURIComponent(invite.email)}` +
        `&redirectTo=${encodeURIComponent(claimUrl)}`;
    }
  };

  const handleDecline = async () => {
    if (!token) return;

    try {
      await teamControllerDeclineInvite(token);
      navigate('/');
    } catch (err) {
      console.error('Failed to decline invite:', err);
      setError('Failed to decline invite. Please try again.');
    }
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
            icon="mdi:email-check-outline"
            sx={{ fontSize: 64, color: 'primary.main' }}
          />
          <Typography variant="h5" fontWeight={600} textAlign="center">
            You've been invited!
          </Typography>

          {/* Brokerage Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 2,
              width: '100%',
            }}
          >
            <Avatar
              src={invite.brokerage.logo}
              alt={invite.brokerage.name}
              sx={{ width: 56, height: 56 }}
            >
              {invite.brokerage.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {invite.brokerage.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invited by {invite.invitedBy.name}
              </Typography>
            </Box>
          </Box>

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
                  Role:
                </Typography>
                <Chip
                  label={invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              {invite.isMaster && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Access:
                  </Typography>
                  <Chip
                    label="Master Account"
                    size="small"
                    color="warning"
                    icon={<IconifyIcon icon="mdi:star" sx={{ fontSize: 14 }} />}
                  />
                </Box>
              )}
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
                Please log out and sign up with the invited email address.
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
                // Trigger logout and redirect back here
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

export default InviteAcceptPage;
