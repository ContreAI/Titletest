/**
 * Signup Page
 *
 * Handles user registration via:
 * - Email/Password (Supabase signUp)
 * - Google OAuth (Supabase signInWithOAuth)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import { supabase } from 'lib/supabase/client';
import PasswordTextField from 'components/common/PasswordTextField';
import Logo from 'components/common/Logo';
import Image from 'components/base/Image';
import google_logo from 'assets/images/logo/32x32/google.webp';
import paths from 'routes/paths';

interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup
  .object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup
      .string()
      .email('Please provide a valid email address.')
      .required('Email is required'),
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

const Signup = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
        },
        emailRedirectTo: `${window.location.origin}${paths.dashboard}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Show success message - user needs to verify email
    setSuccess(true);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${paths.dashboard}`,
      },
    });

    if (oAuthError) {
      setError(oAuthError.message);
      setIsGoogleLoading(false);
    }
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
                We've sent a confirmation link to your email address. Please click the link to
                verify your account and complete registration.
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
              <Typography variant="h4">Create Account</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign up to get started
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Google OAuth Button */}
            <Button
              fullWidth
              variant="contained"
              color="neutral"
              size="large"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              startIcon={<Image src={google_logo} height={21} width={21} alt="Google" />}
            >
              {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
            </Button>

            <Divider>
              <Typography variant="body2" color="text.secondary">
                or sign up with email
              </Typography>
            </Divider>

            {/* Email/Password Form */}
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="medium"
                    id="firstName"
                    label="First Name"
                    autoComplete="given-name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    {...register('firstName')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="medium"
                    id="lastName"
                    label="Last Name"
                    autoComplete="family-name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    {...register('lastName')}
                  />
                </Grid>
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
                  <PasswordTextField
                    fullWidth
                    size="medium"
                    id="password"
                    label="Password"
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
                    label="Confirm Password"
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
                    disabled={isSubmitting || isGoogleLoading}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body2" align="center" color="text.secondary">
              Already have an account?{' '}
              <Link href={paths.defaultJwtLogin}>Sign In</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
