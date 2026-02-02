import { useMemo } from 'react';
import { useThemeMode } from 'hooks/useThemeMode';
import { Coordinates, AvatarSize, AVATAR_SIZES } from './PropertyMapAvatar.types';

/**
 * Themewagon custom Mapbox style IDs
 * These are already used in the existing Mapbox.tsx component
 */
const MAPBOX_STYLES = {
  light: 'clj57pads001701qo25756jtw',
  dark: 'cljzg9juf007x01pk1bepfgew',
} as const;

/**
 * Default map zoom level for property thumbnails
 * Zoom 16 provides street-level context
 */
const DEFAULT_ZOOM = 16;

/**
 * Primary brand color for map markers (hex without #)
 */
const MARKER_COLOR = '1976d2';

export interface UseStaticMapUrlOptions {
  /**
   * Geographic coordinates for the map center
   */
  coordinates: Coordinates | undefined;

  /**
   * Avatar size variant (determines image dimensions)
   * @default 'medium'
   */
  size?: AvatarSize;

  /**
   * Map zoom level (14-18 recommended for property context)
   * @default 16
   */
  zoom?: number;

  /**
   * Whether to use @2x retina images
   * @default true
   */
  retina?: boolean;

  /**
   * Whether to show a pin marker at the location
   * @default false
   */
  showMarker?: boolean;
}

/**
 * Hook to generate Mapbox Static Images API URL
 *
 * Uses the existing VITE_MAPBOX_ACCESS_TOKEN environment variable
 * and Themewagon custom styles for light/dark mode consistency.
 *
 * @example
 * ```tsx
 * const mapUrl = useStaticMapUrl({
 *   coordinates: { latitude: 37.7749, longitude: -122.4194 },
 *   size: 'medium',
 * });
 * // Returns: https://api.mapbox.com/styles/v1/themewagon/clj57pads.../static/-122.4194,37.7749,16/96x96@2x?access_token=...
 * ```
 */
export function useStaticMapUrl(options: UseStaticMapUrlOptions): string | null {
  const { mode } = useThemeMode();

  // Extract primitive values from options to use as stable dependencies
  const latitude = options.coordinates?.latitude;
  const longitude = options.coordinates?.longitude;
  const size = options.size ?? 'medium';
  const zoom = options.zoom ?? DEFAULT_ZOOM;
  const retina = options.retina ?? true;
  const showMarker = options.showMarker ?? false;

  return useMemo(() => {
    // Return null if no coordinates provided
    // Use explicit undefined check to allow 0 values (though unlikely for real estate)
    if (latitude === undefined || longitude === undefined) {
      return null;
    }

    // Validate coordinates are finite numbers
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    // Get access token from environment
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn('PropertyMapAvatar: VITE_MAPBOX_ACCESS_TOKEN not configured');
      return null;
    }

    // Select style based on theme mode
    const styleId = mode === 'dark' ? MAPBOX_STYLES.dark : MAPBOX_STYLES.light;

    // Get image dimensions for the size variant
    const { image: imageSize } = AVATAR_SIZES[size];

    // Build URL components
    const retinaFlag = retina ? '@2x' : '';

    // Optional marker overlay
    // Format: pin-s+{color}({lng},{lat})/
    const markerOverlay = showMarker ? `pin-s+${MARKER_COLOR}(${longitude},${latitude})/` : '';

    // Construct final URL
    // https://docs.mapbox.com/api/maps/static-images/
    return `https://api.mapbox.com/styles/v1/themewagon/${styleId}/static/${markerOverlay}${longitude},${latitude},${zoom}/${imageSize}x${imageSize}${retinaFlag}?access_token=${accessToken}`;
  }, [latitude, longitude, size, zoom, retina, showMarker, mode]);
}

export default useStaticMapUrl;
