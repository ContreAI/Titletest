import { useEffect, useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Box, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import SectionHeader from 'components/base/SectionHeader';
import IconifyIcon from 'components/base/IconifyIcon';
import { UpcomingDeadlines, CriticalErrors } from './components';
import { useNotificationPreferences } from 'modules/user-settings/hooks/useUserSettings';

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

const NotificationsPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    preferences,
    isLoading,
    isSaving,
    error,
    updatePreferences,
    clearError,
  } = useNotificationPreferences();

  // Map API preferences to form structure
  const mapPreferencesToForm = useCallback((): NotificationSettings => ({
    upcomingDeadlines: {
      enabled: preferences.emailUpdates,
      email7Days: preferences.emailUpdates,
      email3Days: preferences.emailUpdates,
      email1Day: preferences.emailAlerts,
      sms3Days: preferences.pushEnabled && preferences.pushTransactions,
      sms1Day: preferences.pushEnabled && preferences.pushTransactions,
      phoneNumber: '+1 (555) 987-6543', // This would come from user profile
    },
    criticalErrors: {
      enabled: preferences.emailAlerts,
      emailProcessingFailures: preferences.emailAlerts,
      emailSecurityAlerts: preferences.emailAlerts,
      email1Day: preferences.emailAlerts,
      smsCriticalFailures: preferences.pushEnabled,
      smsSecurityBreaches: preferences.pushEnabled,
    },
  }), [preferences]);

  const methods = useForm<NotificationSettings>({
    defaultValues: mapPreferencesToForm(),
  });

  const { handleSubmit, reset } = methods;

  // Update form when preferences load
  useEffect(() => {
    if (!isLoading) {
      reset(mapPreferencesToForm());
    }
  }, [preferences, isLoading, reset, mapPreferencesToForm]);

  const onSubmit = async (data: NotificationSettings) => {
    try {
      // Map form data back to API structure
      await updatePreferences({
        emailUpdates: data.upcomingDeadlines.enabled,
        emailAlerts: data.criticalErrors.enabled,
        pushEnabled: data.upcomingDeadlines.sms1Day || data.criticalErrors.smsCriticalFailures,
        pushTransactions: data.upcomingDeadlines.sms3Days || data.upcomingDeadlines.sms1Day,
        pushDocuments: data.criticalErrors.emailProcessingFailures,
      });
      setShowSuccess(true);
    } catch {
      // Error already handled in store
    }
  };

  const handleDownloadAll = () => {
    console.log('Download all notifications');
    // TODO: Implement download all functionality
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.75 }}>
          {error && (
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Row 1: Notification Settings Header */}
          <SectionHeader
            title="Notification Settings"
            description="Immediate alerts for document processing errors or system issues."
            action={
              <Button
                variant="outlined"
                startIcon={<IconifyIcon icon="custom:account-download" />}
                onClick={handleDownloadAll}
                sx={{ textTransform: 'none' }}
              >
                Download All
              </Button>
            }
          />

          {/* Row 2: Upcoming Deadlines */}
          <Box>
            <UpcomingDeadlines />
          </Box>

          {/* Row 3: Critical Errors */}
          <Box>
            <CriticalErrors />
          </Box>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSaving}
              sx={{
                textTransform: 'none',
                fontFamily: (theme) => theme.typography.fontFamily,
                minWidth: 200,
              }}
            >
              {isSaving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </Box>
        </Box>
      </form>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Notification settings saved successfully"
      />
    </FormProvider>
  );
};

export default NotificationsPage;
