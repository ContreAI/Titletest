import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock useThemeMode hook
vi.mock('hooks/useThemeMode', () => ({
  useThemeMode: vi.fn(),
}));

import { useThemeMode } from 'hooks/useThemeMode';
const mockUseThemeMode = vi.mocked(useThemeMode);

// Store original env to restore later
const originalMapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Helper to create mock return value for useThemeMode
const createThemeModeMock = (mode: 'light' | 'dark') => ({
  mode,
  stableMode: mode,
  resetTheme: vi.fn(),
  isDark: mode === 'dark',
  systemMode: mode,
  setThemeMode: vi.fn(),
});

describe('useStaticMapUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockUseThemeMode.mockReturnValue(createThemeModeMock('light'));
    // Set test token for most tests
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = 'test-mapbox-token';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original token
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = originalMapboxToken;
  });

  describe('URL generation', () => {
    it('should return null when coordinates are undefined', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({ coordinates: undefined })
      );

      expect(result.current).toBeNull();
    });

    it('should return null when latitude is undefined', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: undefined as unknown as number, longitude: -122.4194 },
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null when longitude is undefined', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: undefined as unknown as number },
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null when latitude is NaN', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: NaN, longitude: -122.4194 },
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null when longitude is Infinity', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: Infinity },
        })
      );

      expect(result.current).toBeNull();
    });

    it('should return null when access token is not configured', async () => {
      // Set empty token before importing the module
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN = '';
      vi.resetModules();

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      expect(result.current).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'PropertyMapAvatar: VITE_MAPBOX_ACCESS_TOKEN not configured'
      );

      consoleSpy.mockRestore();
    });

    it('should generate valid Mapbox URL with coordinates', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      expect(result.current).toContain('https://api.mapbox.com/styles/v1/themewagon/');
      expect(result.current).toContain('-122.4194,37.7749');
      expect(result.current).toContain('access_token=test-mapbox-token');
    });

    it('should use light style in light mode', async () => {
      mockUseThemeMode.mockReturnValue(createThemeModeMock('light'));

      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      // Light style ID: clj57pads001701qo25756jtw
      expect(result.current).toContain('clj57pads001701qo25756jtw');
    });

    it('should use dark style in dark mode', async () => {
      mockUseThemeMode.mockReturnValue(createThemeModeMock('dark'));

      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      // Dark style ID: cljzg9juf007x01pk1bepfgew
      expect(result.current).toContain('cljzg9juf007x01pk1bepfgew');
    });
  });

  describe('size variants', () => {
    it('should use small image dimensions (80x80) for small size', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          size: 'small',
        })
      );

      expect(result.current).toContain('/80x80');
    });

    it('should use medium image dimensions (96x96) by default', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      expect(result.current).toContain('/96x96');
    });

    it('should use large image dimensions (112x112) for large size', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          size: 'large',
        })
      );

      expect(result.current).toContain('/112x112');
    });
  });

  describe('zoom level', () => {
    it('should use default zoom level 16', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      expect(result.current).toContain(',16/');
    });

    it('should use custom zoom level when provided', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          zoom: 14,
        })
      );

      expect(result.current).toContain(',14/');
    });
  });

  describe('retina support', () => {
    it('should include @2x suffix by default', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      expect(result.current).toContain('@2x');
    });

    it('should not include @2x suffix when retina is false', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          retina: false,
        })
      );

      expect(result.current).not.toContain('@2x');
    });
  });

  describe('marker overlay', () => {
    it('should not include marker by default', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
        })
      );

      expect(result.current).not.toContain('pin-s+');
    });

    it('should include marker when showMarker is true', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          showMarker: true,
        })
      );

      // Marker format: pin-s+{color}({lng},{lat})/
      expect(result.current).toContain('pin-s+1976d2(-122.4194,37.7749)/');
    });
  });

  describe('memoization', () => {
    it('should return same URL when dependencies have not changed', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const coordinates = { latitude: 37.7749, longitude: -122.4194 };

      const { result, rerender } = renderHook(() =>
        useStaticMapUrl({ coordinates })
      );

      const firstUrl = result.current;

      rerender();

      expect(result.current).toBe(firstUrl);
    });

    it('should return new URL when coordinates change', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result, rerender } = renderHook(
        ({ lat, lng }) =>
          useStaticMapUrl({
            coordinates: { latitude: lat, longitude: lng },
          }),
        {
          initialProps: { lat: 37.7749, lng: -122.4194 },
        }
      );

      const firstUrl = result.current;

      rerender({ lat: 40.7128, lng: -74.006 });

      expect(result.current).not.toBe(firstUrl);
      expect(result.current).toContain('40.7128');
      expect(result.current).toContain('-74.006');
    });
  });

  describe('edge cases', () => {
    it('should handle coordinates at 0,0 (valid coordinates)', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 0, longitude: 0 },
        })
      );

      expect(result.current).toContain('0,0');
    });

    it('should handle negative coordinates', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: -33.8688, longitude: 151.2093 },
        })
      );

      expect(result.current).toContain('-33.8688');
      expect(result.current).toContain('151.2093');
    });

    it('should handle extreme valid coordinates', async () => {
      const { useStaticMapUrl } = await import('../useStaticMapUrl');
      const { result } = renderHook(() =>
        useStaticMapUrl({
          coordinates: { latitude: 89.9999, longitude: -179.9999 },
        })
      );

      expect(result.current).toContain('89.9999');
      expect(result.current).toContain('-179.9999');
    });
  });
});
