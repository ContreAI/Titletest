import { useEffect, useCallback } from 'react';
import { useUserSettingsStore } from '../store/user-settings.store';
import type {
  NotificationPreferences,
  AccessibilitySettings,
  UserPreferences,
} from '../typings/user-settings.types';

/**
 * Hook for managing all user settings
 */
export function useUserSettings() {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    updateNotificationPreferences,
    updateAccessibilitySettings,
    updateUserPreferences,
    clearError,
  } = useUserSettingsStore();

  // Fetch settings on mount
  useEffect(() => {
    if (!settings) {
      fetchSettings().catch(() => {
        // Error already handled in store
      });
    }
  }, [settings, fetchSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    updateNotificationPreferences,
    updateAccessibilitySettings,
    updateUserPreferences,
    clearError,
  };
}

/**
 * Hook for notification preferences
 */
export function useNotificationPreferences() {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    updateNotificationPreferences,
    clearError,
  } = useUserSettingsStore();

  // Fetch settings on mount if not loaded
  useEffect(() => {
    if (!settings) {
      fetchSettings().catch(() => {
        // Error already handled in store
      });
    }
  }, [settings, fetchSettings]);

  const preferences = settings?.notificationPreferences || {
    emailMarketing: true,
    emailUpdates: true,
    emailAlerts: true,
    pushEnabled: false,
    pushTransactions: true,
    pushDocuments: true,
    pushTeam: true,
    digestFrequency: 'daily' as const,
  };

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      await updateNotificationPreferences(updates);
    },
    [updateNotificationPreferences]
  );

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    updatePreferences,
    clearError,
  };
}

/**
 * Hook for accessibility settings
 */
export function useAccessibilitySettings() {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    updateAccessibilitySettings,
    clearError,
  } = useUserSettingsStore();

  // Fetch settings on mount if not loaded
  useEffect(() => {
    if (!settings) {
      fetchSettings().catch(() => {
        // Error already handled in store
      });
    }
  }, [settings, fetchSettings]);

  const accessibilitySettings = settings?.accessibilitySettings || {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    fontSize: 16,
    screenReaderOptimized: false,
    keyboardNavigation: true,
  };

  const updateSettings = useCallback(
    async (updates: Partial<AccessibilitySettings>) => {
      await updateAccessibilitySettings(updates);
    },
    [updateAccessibilitySettings]
  );

  return {
    settings: accessibilitySettings,
    isLoading,
    isSaving,
    error,
    updateSettings,
    clearError,
  };
}

/**
 * Hook for user preferences (theme, language, etc.)
 */
export function usePreferences() {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    updateUserPreferences,
    clearError,
  } = useUserSettingsStore();

  // Fetch settings on mount if not loaded
  useEffect(() => {
    if (!settings) {
      fetchSettings().catch(() => {
        // Error already handled in store
      });
    }
  }, [settings, fetchSettings]);

  const preferences = settings?.preferences || {
    theme: 'system' as const,
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  };

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      await updateUserPreferences(updates);
    },
    [updateUserPreferences]
  );

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    updatePreferences,
    clearError,
  };
}
