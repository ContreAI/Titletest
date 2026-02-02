/**
 * User Settings types - Re-exports from @contreai/api-client DTOs
 */

import type {
  UserSettingsDto,
  NotificationPreferencesDto,
  AccessibilitySettingsDto,
  UserPreferencesDto,
  NotificationPreferencesDtoDigestFrequency,
  UserPreferencesDtoTheme,
} from '@contreai/api-client';

// Type aliases for API DTOs - use these throughout the codebase
export type UserSettings = UserSettingsDto;
export type NotificationPreferences = NotificationPreferencesDto;
export type AccessibilitySettings = AccessibilitySettingsDto;
export type UserPreferences = UserPreferencesDto;
export type DigestFrequency = NotificationPreferencesDtoDigestFrequency;
export type Theme = UserPreferencesDtoTheme;

// Store types - UI-specific
export interface UserSettingsStore {
  settings: UserSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchSettings: () => Promise<void>;
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  updateAccessibilitySettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  updateUserPreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// API response types - Note: API returns data directly now (no wrapper)
export type GetUserSettingsResponse = UserSettings;
export type UpdateSettingsResponse = NotificationPreferences | AccessibilitySettings | UserPreferences;

// Default values - UI-specific
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailMarketing: true,
  emailUpdates: true,
  emailAlerts: true,
  pushEnabled: false,
  pushTransactions: true,
  pushDocuments: true,
  pushTeam: true,
  digestFrequency: 'daily',
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  fontSize: 16,
  screenReaderOptimized: false,
  keyboardNavigation: true,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: 'America/Los_Angeles',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
};
