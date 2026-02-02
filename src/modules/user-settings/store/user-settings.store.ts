/**
 * User Settings Store - Manages user settings state
 */

import { create } from 'zustand';
import {
  userSettingsControllerGetUserSettings,
  userSettingsControllerUpdateNotificationPreferences,
  userSettingsControllerUpdateAccessibilitySettings,
  userSettingsControllerUpdateUserPreferences,
  type UpdateNotificationPreferencesDto,
  type UpdateAccessibilitySettingsDto,
  type UpdateUserPreferencesDto,
} from '@contreai/api-client';
import type {
  UserSettingsStore,
  UserSettings,
  NotificationPreferences,
  AccessibilitySettings,
  UserPreferences,
} from '../typings/user-settings.types';

const initialState = {
  settings: null as UserSettings | null,
  isLoading: false,
  isSaving: false,
  error: null as string | null,
};

export const useUserSettingsStore = create<UserSettingsStore>()((set, get) => ({
  ...initialState,

  /**
   * Fetch all user settings
   */
  fetchSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      // Use generated client - response is UserSettingsDto directly (no wrapper)
      const settings = await userSettingsControllerGetUserSettings();

      // Types are now aliases to API DTOs, no transformation needed
      set({
        settings,
        isLoading: false,
      });
    } catch (error) {
      console.error('[UserSettings] Failed to fetch settings:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (updates: Partial<NotificationPreferences>) => {
    const previousSettings = get().settings;
    if (!previousSettings) return;

    // Optimistic update
    set({
      isSaving: true,
      error: null,
      settings: {
        ...previousSettings,
        notificationPreferences: {
          ...previousSettings.notificationPreferences,
          ...updates,
        },
      },
    });

    try {
      // Use generated client - response is NotificationPreferencesDto directly (no wrapper)
      const notificationPreferences = await userSettingsControllerUpdateNotificationPreferences(
        updates as UpdateNotificationPreferencesDto
      );

      set((state) => ({
        isSaving: false,
        settings: state.settings
          ? {
              ...state.settings,
              notificationPreferences,
            }
          : null,
      }));
    } catch (error) {
      console.error('[UserSettings] Failed to update notification preferences:', error);
      // Revert on failure
      set({
        settings: previousSettings,
        error: error instanceof Error ? error.message : 'Failed to update notification preferences',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Update accessibility settings
   */
  updateAccessibilitySettings: async (updates: Partial<AccessibilitySettings>) => {
    const previousSettings = get().settings;
    if (!previousSettings) return;

    // Optimistic update
    set({
      isSaving: true,
      error: null,
      settings: {
        ...previousSettings,
        accessibilitySettings: {
          ...previousSettings.accessibilitySettings,
          ...updates,
        },
      },
    });

    try {
      // Use generated client - response is AccessibilitySettingsDto directly (no wrapper)
      const accessibilitySettings = await userSettingsControllerUpdateAccessibilitySettings(
        updates as UpdateAccessibilitySettingsDto
      );

      set((state) => ({
        isSaving: false,
        settings: state.settings
          ? {
              ...state.settings,
              accessibilitySettings,
            }
          : null,
      }));
    } catch (error) {
      console.error('[UserSettings] Failed to update accessibility settings:', error);
      // Revert on failure
      set({
        settings: previousSettings,
        error: error instanceof Error ? error.message : 'Failed to update accessibility settings',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Update user preferences
   */
  updateUserPreferences: async (updates: Partial<UserPreferences>) => {
    const previousSettings = get().settings;
    if (!previousSettings) return;

    // Optimistic update
    set({
      isSaving: true,
      error: null,
      settings: {
        ...previousSettings,
        preferences: {
          ...previousSettings.preferences,
          ...updates,
        },
      },
    });

    try {
      // Use generated client - response is UserPreferencesDto directly (no wrapper)
      const preferences = await userSettingsControllerUpdateUserPreferences(
        updates as UpdateUserPreferencesDto
      );

      set((state) => ({
        isSaving: false,
        settings: state.settings
          ? {
              ...state.settings,
              preferences,
            }
          : null,
      }));
    } catch (error) {
      console.error('[UserSettings] Failed to update preferences:', error);
      // Revert on failure
      set({
        settings: previousSettings,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
        isSaving: false,
      });
      throw error;
    }
  },

  /**
   * Clear any error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset the store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));
