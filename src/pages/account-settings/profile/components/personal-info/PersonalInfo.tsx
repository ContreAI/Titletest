import { useFormContext } from 'react-hook-form';
import { Box, Typography, TextField, Grid } from '@mui/material';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

const PersonalInfo = () => {
  const { register } = useFormContext<ProfileFormData>();

  return (
    <Box>
      <Typography
        variant="body1"
        sx={{
          fontFamily: (theme) => theme.typography.fontFamily,
          fontWeight: 600,
          fontSize: '1.125rem',
          mb: 2,
        }}
      >
        Personal/Business Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              First Name
            </Typography>
            <TextField
              fullWidth
              autoComplete="given-name"
              spellCheck={false}
              {...register('firstName')}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              Last Name
            </Typography>
            <TextField
              fullWidth
              autoComplete="family-name"
              spellCheck={false}
              {...register('lastName')}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              Email Address
            </Typography>
            <TextField
              fullWidth
              type="email"
              autoComplete="email"
              spellCheck={false}
              {...register('email')}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              Street Address
            </Typography>
            <TextField
              fullWidth
              autoComplete="street-address"
              spellCheck={false}
              {...register('streetAddress')}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              City
            </Typography>
            <TextField
              fullWidth
              autoComplete="address-level2"
              spellCheck={false}
              {...register('city')}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              State
            </Typography>
            <TextField
              fullWidth
              autoComplete="address-level1"
              spellCheck={false}
              {...register('state')}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
              Zip Code
            </Typography>
            <TextField
              fullWidth
              autoComplete="postal-code"
              spellCheck={false}
              {...register('zipCode')}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalInfo;

