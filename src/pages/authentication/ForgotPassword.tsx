/**
 * Forgot Password Page
 *
 * Handles password reset request via Supabase resetPasswordForEmail
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import { supabase } from 'lib/supabase/client';
import Logo from 'components/common/Logo';
import paths from 'routes/paths';

interface ForgotPasswordFormValues {
  email: string;
}

const schema = yup
  .object({
    email: yup
      .string()
      .email('Please provide a valid email address.')
      .required('Email is required'),
  })
  .required();

const ForgotPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}${paths.defaultJwtSetPassword}`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  };

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
              <Typography variant="h4">Check Your Email</Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                If an account exists with that email address, we've sent instructions to reset your
                password.
              </Typography>
              <Button variant="outlined" href={paths.defaultJwtLogin}>
                Back to Login
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
              <Typography variant="h4">Forgot Password</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="medium"
                    id="email"
                    type="email"
                    label="Email"
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register('email')}
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
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body2" align="center" color="text.secondary">
              Remember your password?{' '}
              <Link href={paths.defaultJwtLogin}>Sign In</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
