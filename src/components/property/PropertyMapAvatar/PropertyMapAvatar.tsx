import { useState, useCallback } from 'react';
import { Box, Skeleton, Tooltip, Theme } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useStaticMapUrl } from './useStaticMapUrl';
import {
  PropertyMapAvatarProps,
  GeocodingStatus,
  AVATAR_SIZES,
} from './PropertyMapAvatar.types';

/**
 * Confidence threshold below which we show a warning indicator
 * Addresses with confidence below this may have inaccurate coordinates
 */
const LOW_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Formats address for alt text and tooltips
 */
function formatAddress(address: PropertyMapAvatarProps['address']): string {
  if (!address) return 'Property location';

  const parts = [address.streetAddress, address.city, address.state].filter(Boolean);
  return parts.join(', ');
}

/**
 * Determines if we should show the map based on geocoding status
 */
function shouldShowMap(status: GeocodingStatus | undefined): boolean {
  return status === 'success' || status === 'manual';
}

/**
 * Determines if geocoding is still in progress
 */
function isGeocodingInProgress(status: GeocodingStatus | undefined): boolean {
  return status === 'pending' || status === 'processing';
}

/**
 * PropertyMapAvatar - Displays a static map thumbnail for a property location
 *
 * Shows different states based on geocoding status:
 * - pending/processing: Loading skeleton
 * - success/manual: Map thumbnail from Mapbox Static Images API
 * - failed/undefined: Fallback home icon
 *
 * @example
 * ```tsx
 * <PropertyMapAvatar
 *   address={{ streetAddress: '123 Main St', city: 'San Francisco', state: 'CA' }}
 *   coordinates={{ latitude: 37.7749, longitude: -122.4194 }}
 *   geocodingStatus="success"
 *   size="medium"
 *   onClick={() => openMapModal()}
 * />
 * ```
 */
export function PropertyMapAvatar({
  address,
  coordinates,
  geocodingStatus,
  geocodingConfidence,
  size = 'medium',
  showMarker = false,
  onClick,
  onError,
  fallbackIcon,
  sx,
  'data-testid': testId = 'property-map-avatar',
}: PropertyMapAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get static map URL from Mapbox
  const mapUrl = useStaticMapUrl({
    coordinates,
    size,
    showMarker,
  });

  // Get display dimensions
  const { display: displaySize } = AVATAR_SIZES[size];

  // Handle image load error
  const handleImageError = useCallback(() => {
    setImageError(true);
    onError?.(new Error('Failed to load map image'));
  }, [onError]);

  // Common container styles
  const containerSx = {
    width: displaySize,
    height: displaySize,
    borderRadius: 1, // 8px - matches theme cardBorderRadius
    overflow: 'hidden',
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'box-shadow 150ms ease-in-out, transform 150ms ease-in-out',
    '&:hover': onClick
      ? {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'scale(1.02)',
        }
      : {},
    '&:focus-visible': {
      outline: (theme: Theme) => `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
    ...sx,
  };

  // Format address for accessibility
  const addressText = formatAddress(address);

  // Render loading skeleton for pending/processing status
  if (isGeocodingInProgress(geocodingStatus)) {
    return (
      <Skeleton
        variant="rounded"
        width={displaySize}
        height={displaySize}
        data-testid={`${testId}-skeleton`}
        sx={{ borderRadius: 1 }}
      />
    );
  }

  // Render map image if geocoding succeeded and we have a valid URL
  if (shouldShowMap(geocodingStatus) && mapUrl && !imageError) {
    const isLowConfidence =
      geocodingConfidence !== undefined && geocodingConfidence < LOW_CONFIDENCE_THRESHOLD;

    const mapImage = (
      <Box
        component="button"
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={`View map for ${addressText}`}
        data-testid={testId}
        sx={{
          ...containerSx,
          p: 0,
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          background: 'none',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src={mapUrl}
          alt={`Map showing property location at ${addressText}`}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Low confidence indicator */}
        {isLowConfidence && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              bgcolor: 'warning.main',
              borderRadius: '50%',
              width: 12,
              height: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconifyIcon
              icon="material-symbols:warning-rounded"
              fontSize={8}
              color="warning.contrastText"
            />
          </Box>
        )}
      </Box>
    );

    // Wrap with tooltip if low confidence
    if (isLowConfidence) {
      return (
        <Tooltip title="Location may be approximate" arrow>
          {mapImage}
        </Tooltip>
      );
    }

    return mapImage;
  }

  // Render fallback for failed status, no coordinates, or image error
  const fallbackContent = fallbackIcon ?? (
    <IconifyIcon
      icon="material-symbols:home-outline-rounded"
      fontSize={displaySize * 0.5}
      color="text.secondary"
    />
  );

  const tooltipTitle =
    geocodingStatus === 'failed' ? 'Map unavailable for this address' : 'Property location';

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        component="button"
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={onClick ? `View details for ${addressText}` : addressText}
        data-testid={`${testId}-fallback`}
        sx={{
          ...containerSx,
          p: 0,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
        }}
      >
        {fallbackContent}
      </Box>
    </Tooltip>
  );
}

export default PropertyMapAvatar;
