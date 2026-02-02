/**
 * Set Password Page
 *
 * Handles password reset after clicking email link
 * Uses Supabase updateUser to set new password
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import { supabase } from 'lib/supabase/client';
import PasswordTextField from 'components/common/PasswordTextField';
import Logo from 'components/common/Logo';
import paths from 'routes/paths';

interface SetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const schema = yup
  .object({
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  })
  .required();

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const verifyToken = async () => {
      // First check if we already have a session (e.g., from hash fragment auth)
      const { data: { session: existingSession } } = await supabase.auth.getSession();

      if (existingSession) {
        setIsValidSession(true);
        setIsVerifying(false);
        return;
      }

      // Get token_hash from URL params (for custom email template links)
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (tokenHash && type === 'recovery') {
        // Verify the OTP token to create a session
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });

        if (verifyError) {
          console.error('Token verification failed:', verifyError.message);
          setIsValidSession(false);
          setIsVerifying(false);
          return;
        }

        // Verify we actually got a session back from verifyOtp
        if (!data.session) {
          console.error('Token verified but no session returned');
          // Try to get the session again - it may have been set asynchronously
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (!newSession) {
            console.error('Failed to establish session after token verification');
            setError('Auth session missing!');
            setIsValidSession(true); // Show form but with error
            setIsVerifying(false);
            return;
          }
        }

        // Token verified successfully, session should now be active
        setIsValidSession(true);
        setIsVerifying(false);
        return;
      }

      // No valid token or session found
      setIsValidSession(false);
      setIsVerifying(false);
    };

    verifyToken();
  }, [searchParams]);

  const onSubmit = async (data: SetPasswordFormValues) => {
    setError(null);

    // Verify we still have a valid session before updating password
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Auth session missing! Please request a new password reset link.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
  };

  if (isVerifying) {
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
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Verifying your link...</Typography>
        </Stack>
      </Box>
    );
  }

  if (!isValidSession) {
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
            <Stack spacing={3} alignItems="center" direction="column">
              <Logo />
              <Typography variant="h4">Invalid or Expired Link</Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                This password reset link is invalid or has expired. Please request a new one.
              </Typography>
              <Button variant="contained" href={paths.defaultJwtForgotPassword}>
                Request New Link
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (success) {
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
            <Stack spacing={3} alignItems="center" direction="column">
              <Logo />
              <Typography variant="h4">Password Updated</Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Your password has been successfully updated. You can now sign in with your new
                password.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(paths.defaultJwtLogin, { replace: true })}
              >
                Sign In
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

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
            <Stack spacing={1} alignItems="center" direction="column">
              <Logo />
              <Typography variant="h4">Set New Password</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Enter your new password below.
              </Typography>
            </Stack>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                action={
                  error.includes('session missing') ? (
                    <Button color="inherit" size="small" href={paths.defaultJwtForgotPassword}>
                      Request New Link
                    </Button>
                  ) : undefined
                }
              >
                {error}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <PasswordTextField
                    fullWidth
                    size="medium"
                    id="password"
                    label="New Password"
                    autoComplete="new-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register('password')}
                  />
                </Grid>
                <Grid size={12}>
                  <PasswordTextField
                    fullWidth
                    size="medium"
                    id="confirmPassword"
                    label="Confirm New Password"
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                </Grid>
                <Grid size={12}>
                  <Button
                    fullWidth
                    type="submit"
                    size="large"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default SetPassword;
