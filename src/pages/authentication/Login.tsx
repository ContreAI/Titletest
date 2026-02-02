/**
 * Login Page
 *
 * Handles user authentication via:
 * - Email/Password (Supabase signInWithPassword)
 * - Magic Link (Supabase signInWithOtp)
 * - Google OAuth (Supabase signInWithOAuth)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import { supabase } from 'lib/supabase/client';
import { useAuthStore } from 'modules/auth/store/auth.store';
import useCountdown from 'hooks/useCountdown';
import PasswordTextField from 'components/common/PasswordTextField';
import Logo from 'components/common/Logo';
import Image from 'components/base/Image';
import google_logo from 'assets/images/logo/32x32/google.webp';
import paths from 'routes/paths';
import CheckMagicLinkDialog from 'components/sections/authentications/CheckMagicLinkDialog';

type LoginMethod = 'password' | 'magic-link';

interface LoginFormValues {
  email: string;
  password: string;
}

interface MagicLinkFormValues {
  email: string;
}

const passwordSchema = yup
  .object({
    email: yup
      .string()
      .email('Please provide a valid email address.')
      .required('Email is required'),
    password: yup.string().required('Password is required'),
  })
  .required();

const magicLinkSchema = yup
  .object({
    email: yup
      .string()
      .email('Please provide a valid email address.')
      .required('Email is required'),
  })
  .required();

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || paths.dashboard;
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLinkDialog, setShowMagicLinkDialog] = useState(false);
  const { initSession } = useAuthStore();
  const { time, startTimer } = useCountdown();

  // Password login form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(passwordSchema),
  });

  // Magic link form
  const {
    register: registerMagicLink,
    handleSubmit: handleMagicLinkSubmit,
    watch: watchMagicLink,
    formState: { errors: magicLinkErrors, isSubmitting: isMagicLinkSubmitting },
  } = useForm<MagicLinkFormValues>({
    resolver: yupResolver(magicLinkSchema),
  });

  const magicLinkEmail = watchMagicLink('email');

  const onPasswordSubmit = async (data: LoginFormValues) => {
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Initialize session to fetch user profile from backend
    await initSession();

    // Successful login - navigate to dashboard or redirect URL
    navigate(redirectTo, { replace: true });
  };

  const onMagicLinkSubmit = async (data: MagicLinkFormValues) => {
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        // Don't create new users - only existing users can use magic link
        shouldCreateUser: false,
      },
    });

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMagicLinkSent(true);
    setShowMagicLinkDialog(true);
    startTimer(60, () => {
      setMagicLinkSent(false);
    });
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (oAuthError) {
      setError(oAuthError.message);
      setIsGoogleLoading(false);
    }
    // On success, user is redirected to Google - no need to handle here
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: LoginMethod) => {
    setLoginMethod(newValue);
    setError(null);
  };

  const handleResendMagicLink = () => {
    if (magicLinkEmail) {
      onMagicLinkSubmit({ email: magicLinkEmail });
    }
  };

  const isLoading = isPasswordSubmitting || isMagicLinkSubmitting || isGoogleLoading;

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
              <Typography variant="h4">Welcome Back</Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access your dashboard
              </Typography>
            </Stack>

            {/* Google OAuth Button */}
            <Button
              fullWidth
              variant="contained"
              color="neutral"
              size="large"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              startIcon={<Image src={google_logo} height={21} width={21} alt="Google" />}
            >
              {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
            </Button>

            <Divider>
              <Typography variant="body2" color="text.secondary">
                or sign in with email
              </Typography>
            </Divider>

            {/* Login Method Tabs */}
            <Tabs
              value={loginMethod}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="login method tabs"
            >
              <Tab label="Password" value="password" />
              <Tab label="Magic Link" value="magic-link" />
            </Tabs>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loginMethod === 'password' ? (
              /* Email/Password Form */
              <Box component="form" noValidate onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      size="medium"
                      id="email"
                      type="email"
                      label="Email"
                      autoComplete="email"
                      error={!!passwordErrors.email}
                      helperText={passwordErrors.email?.message}
                      {...registerPassword('email')}
                    />
                  </Grid>
                  <Grid size={12}>
                    <PasswordTextField
                      fullWidth
                      size="medium"
                      id="password"
                      label="Password"
                      autoComplete="current-password"
                      error={!!passwordErrors.password}
                      helperText={passwordErrors.password?.message}
                      {...registerPassword('password')}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Stack direction="row" justifyContent="flex-end">
                      <Link href={paths.defaultJwtForgotPassword} variant="body2">
                        Forgot Password?
                      </Link>
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Button
                      fullWidth
                      type="submit"
                      size="large"
                      variant="contained"
                      disabled={isLoading}
                    >
                      {isPasswordSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              /* Magic Link Form */
              <Box component="form" noValidate onSubmit={handleMagicLinkSubmit(onMagicLinkSubmit)}>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Enter your email and we'll send you a magic link to sign in instantly - no
                      password needed.
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      size="medium"
                      id="magic-link-email"
                      type="email"
                      label="Email"
                      autoComplete="email"
                      error={!!magicLinkErrors.email}
                      helperText={magicLinkErrors.email?.message}
                      {...registerMagicLink('email')}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button
                      fullWidth
                      type="submit"
                      size="large"
                      variant="contained"
                      disabled={isLoading || magicLinkSent}
                    >
                      {isMagicLinkSubmitting
                        ? 'Sending...'
                        : magicLinkSent
                          ? `Send again in ${time}s`
                          : 'Send Magic Link'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Typography variant="body2" align="center" color="text.secondary">
              Don't have an account?{' '}
              <Link href={paths.defaultJwtSignup}>Sign Up</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>

      <CheckMagicLinkDialog
        open={showMagicLinkDialog}
        handleClose={() => setShowMagicLinkDialog(false)}
        email={magicLinkEmail || ''}
        time={time}
        handleSendAgain={handleResendMagicLink}
      />
    </Box>
  );
};

export default Login;
