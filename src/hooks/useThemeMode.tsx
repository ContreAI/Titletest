import { useCallback } from 'react';
import { useColorScheme } from '@mui/material';
import { ThemeMode } from 'config';
import { useStableValue } from './useStableValue';

export const useThemeMode = () => {
  const { mode, systemMode, setMode } = useColorScheme();

  // Debounced mode value that doesn't change rapidly from system signals.
  // Use this in effects to prevent cascading re-renders.
  const stableMode = useStableValue(mode);

  const isDark = mode === 'system' ? systemMode === 'dark' : mode === 'dark';

  const setThemeMode = useCallback(
    (themeMode?: ThemeMode) => {
      const currentIsDark = mode === 'system' ? systemMode === 'dark' : mode === 'dark';
      setMode(themeMode ?? (currentIsDark ? 'light' : 'dark'));
    },
    [setMode, mode, systemMode],
  );

  const resetTheme = useCallback(() => {
    setMode(null);
  }, [setMode]);

  return {
    /** Current mode (may change rapidly from system signals) */
    mode,
    /** Debounced mode that only updates after changes stabilize - use for effects */
    stableMode,
    resetTheme,
    isDark,
    systemMode,
    setThemeMode,
  };
};
