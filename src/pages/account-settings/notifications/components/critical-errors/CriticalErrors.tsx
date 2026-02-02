import { useFormContext } from 'react-hook-form';
import {
  Box,
  Typography,
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

const CriticalErrors = () => {
  const { watch, register, setValue } = useFormContext<NotificationSettings>();
  const enabled = watch('criticalErrors.enabled');

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
                Critical Errors
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: (theme) => theme.typography.fontFamily,
                  color: 'text.secondary',
                }}
              >
                Immediate alerts for document processing errors or system issues.
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0, ml: 2 }}>
              <ToggleSwitch
                checked={enabled}
                onChange={(checked) => setValue('criticalErrors.enabled', checked)}
              />
            </Box>
          </Box>

          {/* Divider */}
          <Divider />

          {/* Two Column Content: Email Alerts (Left) and SMS Alerts (Right) */}
          {enabled && (
            <Grid container spacing={3}>
              {/* Left Column: Email Alerts */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Email Alerts
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('criticalErrors.emailProcessingFailures')}
                        defaultChecked
                      />
                    }
                    label={<CheckboxLabel>Processing failures</CheckboxLabel>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('criticalErrors.emailSecurityAlerts')}
                        defaultChecked
                      />
                    }
                    label={<CheckboxLabel>Security alerts</CheckboxLabel>}
                  />
                  <FormControlLabel
                    control={<Checkbox {...register('criticalErrors.email1Day')} />}
                    label={<CheckboxLabel>1 day before deadline</CheckboxLabel>}
                  />
                </FormGroup>
              </Grid>

              {/* Right Column: SMS Alerts */}
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
                    SMS Alerts
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox {...register('criticalErrors.smsCriticalFailures')} disabled />}
                      label={<CheckboxLabel>Critical failures only</CheckboxLabel>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...register('criticalErrors.smsSecurityBreaches')}
                          disabled
                        />
                      }
                      label={<CheckboxLabel>Security breaches</CheckboxLabel>}
                    />
                  </FormGroup>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CriticalErrors;

