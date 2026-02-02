import { useEffect, useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Box, Button, FormControlLabel, Switch, Slider, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import SectionHeader from 'components/base/SectionHeader';
import { useAccessibilitySettings } from 'modules/user-settings/hooks/useUserSettings';

interface AccessibilitySettingsForm {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  fontSize: number;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
}

const AccessibilityPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    settings: apiSettings,
    isLoading,
    isSaving,
    error,
    updateSettings,
    clearError,
  } = useAccessibilitySettings();

  const methods = useForm<AccessibilitySettingsForm>({
    defaultValues: {
      reduceMotion: apiSettings.reduceMotion,
      highContrast: apiSettings.highContrast,
      largeText: apiSettings.largeText,
      fontSize: apiSettings.fontSize,
      screenReaderOptimized: apiSettings.screenReaderOptimized,
      keyboardNavigation: apiSettings.keyboardNavigation,
    },
  });

  const { handleSubmit, control, watch, reset } = methods;
  const largeText = watch('largeText');

  // Update form when settings load
  useEffect(() => {
    if (!isLoading) {
      reset({
        reduceMotion: apiSettings.reduceMotion,
        highContrast: apiSettings.highContrast,
        largeText: apiSettings.largeText,
        fontSize: apiSettings.fontSize,
        screenReaderOptimized: apiSettings.screenReaderOptimized,
        keyboardNavigation: apiSettings.keyboardNavigation,
      });
    }
  }, [apiSettings, isLoading, reset]);

  const onSubmit = async (data: AccessibilitySettingsForm) => {
    try {
      await updateSettings(data);
      setShowSuccess(true);
    } catch {
      // Error already handled in store
    }
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

          <SectionHeader
            title="Accessibility Settings"
            description="Customize your experience to make the application more accessible."
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Visual
            </Typography>

            <Controller
              name="reduceMotion"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Reduce motion"
                  sx={{ ml: 0 }}
                />
              )}
            />

            <Controller
              name="highContrast"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="High contrast mode"
                  sx={{ ml: 0 }}
                />
              )}
            />

            <Controller
              name="largeText"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Large text"
                  sx={{ ml: 0 }}
                />
              )}
            />

            {largeText && (
              <Box sx={{ px: 2, maxWidth: 400 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Font size: {watch('fontSize')}px
                </Typography>
                <Controller
                  name="fontSize"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      {...field}
                      min={14}
                      max={24}
                      step={1}
                      marks={[
                        { value: 14, label: '14px' },
                        { value: 18, label: '18px' },
                        { value: 24, label: '24px' },
                      ]}
                    />
                  )}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Navigation
            </Typography>

            <Controller
              name="screenReaderOptimized"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Optimize for screen readers"
                  sx={{ ml: 0 }}
                />
              )}
            />

            <Controller
              name="keyboardNavigation"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Enhanced keyboard navigation"
                  sx={{ ml: 0 }}
                />
              )}
            />
          </Box>

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
              {isSaving ? 'Saving...' : 'Save Accessibility Settings'}
            </Button>
          </Box>
        </Box>
      </form>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Accessibility settings saved successfully"
      />
    </FormProvider>
  );
};

export default AccessibilityPage;
