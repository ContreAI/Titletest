import { SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

// Re-export canonical types from transactions module to avoid duplication
export type {
  GeocodingStatus,
  GeocodingSource,
  Coordinates,
} from 'modules/transactions/typings/transactions.types';

import type { GeocodingStatus, Coordinates } from 'modules/transactions/typings/transactions.types';

/**
 * Property address for display and fallback
 * Subset of PropertyAddress from transactions - zipCode optional for display purposes
 */
export interface PropertyAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode?: string;
}

/**
 * Size variants for the avatar
 */
export type AvatarSize = 'small' | 'medium' | 'large';

/**
 * Size configuration mapping
 */
export const AVATAR_SIZES: Record<AvatarSize, { display: number; image: number }> = {
  small: { display: 40, image: 80 },
  medium: { display: 48, image: 96 },
  large: { display: 56, image: 112 },
};

/**
 * Props for the PropertyMapAvatar component
 */
export interface PropertyMapAvatarProps {
  /**
   * Property address for alt text and fallback display
   */
  address?: PropertyAddress;

  /**
   * Pre-geocoded coordinates from backend (from PostGIS location column)
   */
  coordinates?: Coordinates;

  /**
   * Current geocoding status from backend
   * @default undefined (treated as 'failed' - shows fallback)
   */
  geocodingStatus?: GeocodingStatus;

  /**
   * Geocoding confidence score (0-1) for potential quality indicators
   */
  geocodingConfidence?: number;

  /**
   * Avatar size variant
   * @default 'medium'
   */
  size?: AvatarSize;

  /**
   * Show pin marker on map
   * @default false
   */
  showMarker?: boolean;

  /**
   * Click handler - typically opens map modal
   */
  onClick?: () => void;

  /**
   * Error callback for image load failures
   */
  onError?: (error: Error) => void;

  /**
   * Custom fallback content when map unavailable
   */
  fallbackIcon?: ReactNode;

  /**
   * MUI sx prop for additional styling
   */
  sx?: SxProps<Theme>;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}
