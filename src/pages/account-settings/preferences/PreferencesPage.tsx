import { useEffect, useState, useCallback } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Box, Button, FormControlLabel, Switch, MenuItem, Select, Typography, FormControl, InputLabel, CircularProgress, Alert, Snackbar } from '@mui/material';
import SectionHeader from 'components/base/SectionHeader';
import { useSettingsContext } from 'providers/SettingsProvider';
import { useThemeMode } from 'hooks/useThemeMode';
import { usePreferences } from 'modules/user-settings/hooks/useUserSettings';
import type { SupportedLocales, TextDirection } from 'config';

interface PreferencesSettings {
  language: SupportedLocales;
  textDirection: TextDirection;
  compactMode: boolean;
  showWelcomeScreen: boolean;
  autoSave: boolean;
  defaultView: 'grid' | 'list';
}

const PreferencesPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { config, setConfig } = useSettingsContext();
  const { isDark, setThemeMode } = useThemeMode();

  const {
    preferences: apiPreferences,
    isLoading,
    isSaving,
    error,
    updatePreferences,
    clearError,
  } = usePreferences();

  // Map API preferences to form structure
  const mapPreferencesToForm = useCallback((): PreferencesSettings => ({
    language: (apiPreferences.language as SupportedLocales) || config.locale,
    textDirection: config.textDirection,
    compactMode: false,
    showWelcomeScreen: true,
    autoSave: true,
    defaultView: 'grid',
  }), [apiPreferences.language, config.locale, config.textDirection]);

  const methods = useForm<PreferencesSettings>({
    defaultValues: mapPreferencesToForm(),
  });

  const { handleSubmit, control, reset } = methods;

  // Update form when preferences load
  useEffect(() => {
    if (!isLoading) {
      reset(mapPreferencesToForm());
    }
  }, [isLoading, reset, mapPreferencesToForm]);

  const onSubmit = async (data: PreferencesSettings) => {
    try {
      // Update local settings context
      setConfig({
        locale: data.language,
        textDirection: data.textDirection,
      });

      // Update API preferences
      await updatePreferences({
        language: data.language.split('-')[0], // Convert 'en-US' to 'en'
        theme: isDark ? 'dark' : 'light',
      });

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
            title="Preferences"
            description="Customize your application experience."
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Appearance
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isDark}
                  onChange={() => setThemeMode()}
                />
              }
              label="Dark mode"
              sx={{ ml: 0 }}
            />

            <Controller
              name="compactMode"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Compact mode"
                  sx={{ ml: 0 }}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Language & Region
            </Typography>

            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                  <InputLabel id="language-label">Language</InputLabel>
                  <Select
                    {...field}
                    labelId="language-label"
                    label="Language"
                  >
                    <MenuItem value="en-US">English (US)</MenuItem>
                    <MenuItem value="fr-FR">French</MenuItem>
                    <MenuItem value="zh-CN">Chinese (Simplified)</MenuItem>
                    <MenuItem value="hi-IN">Hindi</MenuItem>
                    <MenuItem value="ar-SA">Arabic</MenuItem>
                    <MenuItem value="bn-BD">Bengali</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="textDirection"
              control={control}
              render={({ field }) => (
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                  <InputLabel id="text-direction-label">Text Direction</InputLabel>
                  <Select
                    {...field}
                    labelId="text-direction-label"
                    label="Text Direction"
                  >
                    <MenuItem value="ltr">Left to Right</MenuItem>
                    <MenuItem value="rtl">Right to Left</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Behavior
            </Typography>

            <Controller
              name="showWelcomeScreen"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Show welcome screen on startup"
                  sx={{ ml: 0 }}
                />
              )}
            />

            <Controller
              name="autoSave"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Auto-save changes"
                  sx={{ ml: 0 }}
                />
              )}
            />

            <Controller
              name="defaultView"
              control={control}
              render={({ field }) => (
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                  <InputLabel id="default-view-label">Default View</InputLabel>
                  <Select
                    {...field}
                    labelId="default-view-label"
                    label="Default View"
                  >
                    <MenuItem value="grid">Grid</MenuItem>
                    <MenuItem value="list">List</MenuItem>
                  </Select>
                </FormControl>
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
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </Box>
      </form>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="Preferences saved successfully"
      />
    </FormProvider>
  );
};

export default PreferencesPage;
