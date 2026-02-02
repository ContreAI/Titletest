import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUserSettingsStore } from '../store/user-settings.store';

// Mock the generated API client
vi.mock('@contreai/api-client', () => ({
  userSettingsControllerGetUserSettings: vi.fn(),
  userSettingsControllerUpdateNotificationPreferences: vi.fn(),
  userSettingsControllerUpdateAccessibilitySettings: vi.fn(),
  userSettingsControllerUpdateUserPreferences: vi.fn(),
}));

describe('User Settings Store', () => {
  const mockSettings = {
    userId: 'user-1',
    activeTenantId: 'tenant-1',
    notificationPreferences: {
      emailNotifications: true,
      pushEnabled: false,
      documentAlerts: true,
    },
    accessibilitySettings: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/Los_Angeles',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    useUserSettingsStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useUserSettingsStore.getState();
      expect(state.settings).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSettings', () => {
    it('should fetch and store settings', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.userSettingsControllerGetUserSettings).mockResolvedValueOnce(
        mockSettings as any
      );

      await useUserSettingsStore.getState().fetchSettings();

      expect(apiClient.userSettingsControllerGetUserSettings).toHaveBeenCalled();
      expect(useUserSettingsStore.getState().settings).not.toBeNull();
      expect(useUserSettingsStore.getState().settings?.userId).toBe('user-1');
      expect(useUserSettingsStore.getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const apiClient = await import('@contreai/api-client');
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(apiClient.userSettingsControllerGetUserSettings).mockReturnValueOnce(promise as any);

      const fetchPromise = useUserSettingsStore.getState().fetchSettings();
      expect(useUserSettingsStore.getState().isLoading).toBe(true);

      resolvePromise!(mockSettings);
      await fetchPromise;
      expect(useUserSettingsStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.userSettingsControllerGetUserSettings).mockRejectedValueOnce(
        new Error('Settings error')
      );

      await expect(useUserSettingsStore.getState().fetchSettings()).rejects.toThrow('Settings error');
      expect(useUserSettingsStore.getState().error).toBe('Settings error');
      expect(useUserSettingsStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences with optimistic update', async () => {
      const apiClient = await import('@contreai/api-client');
      const updatedPrefs = { ...mockSettings.notificationPreferences, pushEnabled: true };
      vi.mocked(apiClient.userSettingsControllerUpdateNotificationPreferences).mockResolvedValueOnce(
        updatedPrefs as any
      );

      useUserSettingsStore.setState({ settings: mockSettings as any });

      await useUserSettingsStore.getState().updateNotificationPreferences({ pushEnabled: true });

      expect(apiClient.userSettingsControllerUpdateNotificationPreferences).toHaveBeenCalledWith({
        pushEnabled: true,
      });
      expect(useUserSettingsStore.getState().settings?.notificationPreferences.pushEnabled).toBe(
        true
      );
    });

    it('should do nothing if no settings exist', async () => {
      const apiClient = await import('@contreai/api-client');
      useUserSettingsStore.setState({ settings: null });

      await useUserSettingsStore.getState().updateNotificationPreferences({ pushEnabled: true });

      expect(apiClient.userSettingsControllerUpdateNotificationPreferences).not.toHaveBeenCalled();
    });

    it('should revert on failure', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.userSettingsControllerUpdateNotificationPreferences).mockRejectedValueOnce(
        new Error('Update failed')
      );

      useUserSettingsStore.setState({ settings: mockSettings as any });

      await expect(
        useUserSettingsStore.getState().updateNotificationPreferences({ pushEnabled: true })
      ).rejects.toThrow();

      expect(useUserSettingsStore.getState().settings?.notificationPreferences.pushEnabled).toBe(
        false
      );
    });
  });

  describe('updateAccessibilitySettings', () => {
    it('should update accessibility settings with optimistic update', async () => {
      const apiClient = await import('@contreai/api-client');
      const updatedSettings = { ...mockSettings.accessibilitySettings, highContrast: true };
      vi.mocked(apiClient.userSettingsControllerUpdateAccessibilitySettings).mockResolvedValueOnce(
        updatedSettings as any
      );

      useUserSettingsStore.setState({ settings: mockSettings as any });

      await useUserSettingsStore.getState().updateAccessibilitySettings({ highContrast: true });

      expect(apiClient.userSettingsControllerUpdateAccessibilitySettings).toHaveBeenCalledWith({
        highContrast: true,
      });
      expect(useUserSettingsStore.getState().settings?.accessibilitySettings.highContrast).toBe(true);
    });

    it('should revert on failure', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.userSettingsControllerUpdateAccessibilitySettings).mockRejectedValueOnce(
        new Error('Update failed')
      );

      useUserSettingsStore.setState({ settings: mockSettings as any });

      await expect(
        useUserSettingsStore.getState().updateAccessibilitySettings({ highContrast: true })
      ).rejects.toThrow();

      expect(useUserSettingsStore.getState().settings?.accessibilitySettings.highContrast).toBe(false);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences with optimistic update', async () => {
      const apiClient = await import('@contreai/api-client');
      const updatedPrefs = { ...mockSettings.preferences, theme: 'dark' };
      vi.mocked(apiClient.userSettingsControllerUpdateUserPreferences).mockResolvedValueOnce(
        updatedPrefs as any
      );

      useUserSettingsStore.setState({ settings: mockSettings as any });

      await useUserSettingsStore.getState().updateUserPreferences({ theme: 'dark' } as any);

      expect(apiClient.userSettingsControllerUpdateUserPreferences).toHaveBeenCalledWith({
        theme: 'dark',
      });
      expect(useUserSettingsStore.getState().settings?.preferences.theme).toBe('dark');
    });

    it('should revert on failure', async () => {
      const apiClient = await import('@contreai/api-client');
      vi.mocked(apiClient.userSettingsControllerUpdateUserPreferences).mockRejectedValueOnce(
        new Error('Update failed')
      );

      useUserSettingsStore.setState({ settings: mockSettings as any });

      await expect(
        useUserSettingsStore.getState().updateUserPreferences({ theme: 'dark' } as any)
      ).rejects.toThrow();

      expect(useUserSettingsStore.getState().settings?.preferences.theme).toBe('light');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useUserSettingsStore.setState({ error: 'Some error' });
      useUserSettingsStore.getState().clearError();
      expect(useUserSettingsStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useUserSettingsStore.setState({
        settings: mockSettings as any,
        isLoading: true,
        isSaving: true,
        error: 'Error',
      });

      useUserSettingsStore.getState().reset();

      const state = useUserSettingsStore.getState();
      expect(state.settings).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
