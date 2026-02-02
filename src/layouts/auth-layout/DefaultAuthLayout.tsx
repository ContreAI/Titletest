import { PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { useMatch } from 'react-router';
import { Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
// Removed unused auth JSON animations - using Supabase auth
// Removed unused Lottie import
import { getItemFromStore } from 'lib/utils';
import Logo from 'components/common/Logo';
// Removed unused auth icons - using Supabase authentication
import DefaultLoader from 'components/loading/DefaultLoader';

const DefaultAuthLayout = ({ children }: PropsWithChildren) => {
  const storedProvider = getItemFromStore('auth_provider');
  const jwtMatch = useMatch('/authentication/default/jwt/:page');
  const auth0Match = useMatch('/authentication/default/auth0/:page');
  const firebaseMatch = useMatch('/authentication/default/firebase/:page');
  const [_value, setValue] = useState(storedProvider || 'jwt');

  useEffect(() => {
    if (jwtMatch) {
      setValue('jwt');
    }
    if (auth0Match) {
      setValue('auth0');
    }
    if (firebaseMatch) {
      setValue('firebase');
    }
  }, [auth0Match, firebaseMatch, jwtMatch]);

  return (
    <Grid
      container
      sx={{
        height: { md: '100vh' },
        minHeight: '100vh',
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
      }}
    >
      <Grid
        sx={{
          borderRight: { md: 1 },
          borderColor: { md: 'divider' },
        }}
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Stack
          direction="column"
          sx={{
            justifyContent: 'space-between',
            height: 1,
            p: { xs: 3, sm: 5 },
          }}
        >
          <Stack
            sx={{
              justifyContent: { xs: 'center', md: 'flex-start' },
              mb: { xs: 5, md: 0 },
            }}
          >
            <Logo />
          </Stack>

          <Stack
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              display: { xs: 'none', md: 'flex', flexDirection: 'row-reverse' },
              transform: (theme) => (theme.direction === 'rtl' ? 'scaleX(-1)' : 'unset'),
            }}
          >
            {/* Auth animation removed - using Supabase authentication */}
          </Stack>

          {/* <Stack
            sx={{
              justifyContent: 'center',
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              sx={{
                bgcolor: 'background.elevation1',
                p: 1,
                borderRadius: 9,
                [`& .${tabsClasses.indicator}`]: {
                  height: 1,
                  bgcolor: (theme) => cssVarRgba(theme.vars.palette.primary.mainChannel, 0.1),
                  borderRadius: 12,
                },
              }}
            >
              <Tab
                component={Link}
                underline="none"
                href={paths.defaultJwtLogin}
                value="jwt"
                label="jwt"
                icon={<JwtIcon />}
                iconPosition="start"
                disableRipple
                sx={{ px: 1.75 }}
              />
              <Tab
                component={Link}
                underline="none"
                href={paths.defaultAuth0Login}
                value="auth0"
                label="Auth 0"
                icon={<Auth0Icon />}
                iconPosition="start"
                disableRipple
                sx={{ px: 1.75 }}
              />
              <Tab
                component={Link}
                underline="none"
                href={paths.defaultFirebaseLogin}
                value="firebase"
                label="Firebase"
                icon={<FirebaseIcon />}
                iconPosition="start"
                disableRipple
                sx={{ px: 1.75 }}
              />
            </Tabs>
          </Stack> */}
        </Stack>
      </Grid>
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
        sx={{
          display: { xs: 'flex', md: 'block' },
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Suspense fallback={<DefaultLoader />}>{children}</Suspense>
      </Grid>
    </Grid>
  );
};

export default DefaultAuthLayout;
