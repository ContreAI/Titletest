/**
 * Portal Login Page
 *
 * Simple password-based authentication for title portal access.
 * Each transaction side (buyer/seller) has its own password.
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import { Building2, Lock } from 'lucide-react';
import { usePortalAuthStore } from 'modules/portal-auth/store/portal-auth.store';
import { PortalSide } from 'modules/portal/types/portal.types';
import { portalPaths } from 'routes/paths';

const PortalLoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { transactionId, side } = useParams<{ transactionId: string; side: string }>();
  const { login, isLoading } = usePortalAuthStore();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Validate URL parameters
  const validSide = side === 'buyer' || side === 'seller' ? (side as PortalSide) : null;

  if (!transactionId || !validSide) {
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
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Invalid Portal Link
            </Typography>
            <Typography color="text.secondary">
              The portal link you're trying to access is invalid. Please check with your title company for the correct link.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    const success = await login(transactionId, validSide, password);

    if (success) {
      navigate(portalPaths.home(transactionId, validSide), { replace: true });
    } else {
      setError('Invalid password. Please try again or contact your title company.');
    }
  };

  const sideLabel = validSide === 'buyer' ? 'Buyer Agent' : 'Seller Agent';
  const sideColor = validSide === 'buyer' ? 'primary' : 'secondary';

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
        <Paper sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={4} direction="column">
            {/* Header */}
            <Stack spacing={2} alignItems="center" direction="column">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={32} color={theme.palette.primary.main} />
              </Box>

              <Typography variant="h4" textAlign="center">
                Transaction Portal
              </Typography>

              <Chip
                label={sideLabel}
                color={sideColor}
                size="medium"
                sx={{ fontWeight: 500 }}
              />

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Enter your portal password to access transaction documents and details.
              </Typography>
            </Stack>

            {/* Transaction ID Display */}
            <Box
              sx={{
                bgcolor: theme.palette.action.hover,
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Transaction ID
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                {transactionId}
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  size="medium"
                  type="password"
                  label="Portal Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Lock size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
                    ),
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Access Portal'}
                </Button>
              </Stack>
            </Box>

            {/* Help Text */}
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don't have a password? Contact your title company for access credentials.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PortalLoginPage;
