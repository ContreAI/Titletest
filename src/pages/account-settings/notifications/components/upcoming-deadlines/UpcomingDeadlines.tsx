import { useFormContext } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { CheckboxLabel, ToggleSwitch } from '../shared';

interface NotificationSettings {
  upcomingDeadlines: {
    enabled: boolean;
    email7Days: boolean;
    email3Days: boolean;
    email1Day: boolean;
    sms3Days: boolean;
    sms1Day: boolean;
    phoneNumber: string;
  };
  criticalErrors: {
    enabled: boolean;
    emailProcessingFailures: boolean;
    emailSecurityAlerts: boolean;
    email1Day: boolean;
    smsCriticalFailures: boolean;
    smsSecurityBreaches: boolean;
  };
}

const UpcomingDeadlines = () => {
  const { watch, register, setValue } = useFormContext<NotificationSettings>();
  const enabled = watch('upcomingDeadlines.enabled');

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 3.75 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  mb: 0.5,
                }}
              >
                Upcoming Deadlines
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  color: 'text.secondary',
                }}
              >
                Get notified about contract deadlines and important dates.
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0, ml: 2 }}>
              <ToggleSwitch
                checked={enabled}
                onChange={(checked) => setValue('upcomingDeadlines.enabled', checked)}
              />
            </Box>
          </Box>

          {/* Divider */}
          <Divider />

          {/* Two Column Content: Email Notifications (Left) and SMS Notifications (Right) */}
          {enabled && (
            <Grid container spacing={3}>
              {/* Left Column: Email Notifications */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Email Notifications
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox {...register('upcomingDeadlines.email7Days')} defaultChecked />
                    }
                    label={<CheckboxLabel>7 days before deadline</CheckboxLabel>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox {...register('upcomingDeadlines.email3Days')} defaultChecked />
                    }
                    label={<CheckboxLabel>3 days before deadline</CheckboxLabel>}
                  />
                  <FormControlLabel
                    control={<Checkbox {...register('upcomingDeadlines.email1Day')} />}
                    label={<CheckboxLabel>1 day before deadline</CheckboxLabel>}
                  />
                </FormGroup>
              </Grid>

              {/* Right Column: SMS Notifications */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    opacity: 0.5,
                    pointerEvents: 'none',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: (theme) => theme.typography.fontFamily,
                      fontWeight: 600,
                      mb: 2,
                      color: 'text.disabled',
                    }}
                  >
                    SMS Notifications
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox {...register('upcomingDeadlines.sms3Days')} disabled />}
                      label={<CheckboxLabel>3 days before deadline</CheckboxLabel>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox {...register('upcomingDeadlines.sms1Day')} disabled />
                      }
                      label={<CheckboxLabel>1 day before deadline</CheckboxLabel>}
                    />
                  </FormGroup>
                  <TextField
                    fullWidth
                    placeholder="+1 (555) 987-6543"
                    {...register('upcomingDeadlines.phoneNumber')}
                    disabled
                    sx={{
                      mt: 2,
                      maxWidth: 300,
                      '& .MuiInputBase-input': {
                        fontFamily: (theme) => theme.typography.fontFamily,
                      },
                      '& .MuiInputBase-root': {
                        fontFamily: (theme) => theme.typography.fontFamily,
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;

