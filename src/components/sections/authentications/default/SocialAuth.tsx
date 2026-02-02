import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import google_logo from 'assets/images/logo/32x32/google.webp';
import microsoft_logo from 'assets/images/logo/32x32/microsoft.webp';
import Image from 'components/base/Image';

const SocialAuth = () => {
  // Social auth is currently disabled - using Supabase authentication
  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: 'center',
      }}
    >
      <Grid
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="neutral"
          size="large"
          sx={{ flex: 1, whiteSpace: 'nowrap' }}
          startIcon={<Image src={google_logo} height={21} width={21} alt="icon" />}
          disabled
        >
          Sign in with google
        </Button>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 6,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="neutral"
          size="large"
          sx={{ flex: 1, whiteSpace: 'nowrap' }}
          startIcon={<Image src={microsoft_logo} height={21} width={21} alt="icon" />}
          disabled
        >
          Sign in with Microsoft
        </Button>
      </Grid>
    </Grid>
  );
};

export default SocialAuth;
