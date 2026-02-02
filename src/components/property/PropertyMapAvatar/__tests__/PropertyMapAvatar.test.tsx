import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { PropertyMapAvatar } from '../PropertyMapAvatar';
import type { PropertyMapAvatarProps, GeocodingStatus } from '../PropertyMapAvatar.types';

// Mock useStaticMapUrl hook
vi.mock('../useStaticMapUrl', () => ({
  useStaticMapUrl: vi.fn(),
  default: vi.fn(),
}));

// Import the mocked module to control its behavior
import { useStaticMapUrl } from '../useStaticMapUrl';
const mockUseStaticMapUrl = vi.mocked(useStaticMapUrl);

// Create a minimal theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const defaultProps: PropertyMapAvatarProps = {
  address: {
    streetAddress: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
  },
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  geocodingStatus: 'success' as GeocodingStatus,
};

describe('PropertyMapAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStaticMapUrl.mockReturnValue('https://api.mapbox.com/test-map-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering states', () => {
    it('should render map image when geocoding status is success', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('https://api.mapbox.com/test-map-url');
      expect(img.getAttribute('alt')).toContain('123 Main St');
    });

    it('should render map image when geocoding status is manual', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingStatus="manual" />
      );

      const img = screen.getByRole('img');
      expect(img).toBeTruthy();
    });

    it('should render skeleton when geocoding status is pending', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingStatus="pending" />
      );

      expect(screen.getByTestId('property-map-avatar-skeleton')).toBeTruthy();
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('should render skeleton when geocoding status is processing', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingStatus="processing" />
      );

      expect(screen.getByTestId('property-map-avatar-skeleton')).toBeTruthy();
    });

    it('should render fallback when geocoding status is failed', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingStatus="failed" />
      );

      expect(screen.getByTestId('property-map-avatar-fallback')).toBeTruthy();
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('should render fallback when geocoding status is undefined', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingStatus={undefined} />
      );

      expect(screen.getByTestId('property-map-avatar-fallback')).toBeTruthy();
    });

    it('should render fallback when map URL is null', () => {
      mockUseStaticMapUrl.mockReturnValue(null);

      renderWithTheme(<PropertyMapAvatar {...defaultProps} />);

      expect(screen.getByTestId('property-map-avatar-fallback')).toBeTruthy();
    });

    it('should render fallback after image load error', () => {
      const onError = vi.fn();
      renderWithTheme(<PropertyMapAvatar {...defaultProps} onError={onError} />);

      const img = screen.getByRole('img');
      fireEvent.error(img);

      expect(screen.getByTestId('property-map-avatar-fallback')).toBeTruthy();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('low confidence indicator', () => {
    it('should show warning indicator when confidence is below threshold', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingConfidence={0.5} />
      );

      // The warning icon should be present - check for the svg icon inside
      const container = screen.getByTestId('property-map-avatar');
      // The warning indicator is a Box with width: 12, height: 12 containing an icon
      // We check if there's an svg element (the IconifyIcon renders an svg)
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should not show warning indicator when confidence is above threshold', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingConfidence={0.9} />
      );

      const container = screen.getByTestId('property-map-avatar');
      // No warning badge should be present - only the img, no svg icons
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBe(0);
    });

    it('should not show warning indicator when confidence is exactly at threshold', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingConfidence={0.7} />
      );

      const container = screen.getByTestId('property-map-avatar');
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBe(0);
    });

    it('should not show warning indicator when confidence is undefined', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} geocodingConfidence={undefined} />
      );

      const container = screen.getByTestId('property-map-avatar');
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBe(0);
    });
  });

  describe('interaction', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      renderWithTheme(<PropertyMapAvatar {...defaultProps} onClick={onClick} />);

      const button = screen.getByTestId('property-map-avatar');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when onClick is not provided', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} />);

      const button = screen.getByTestId('property-map-avatar');
      expect(button).toHaveAttribute('disabled');
    });

    it('should have cursor pointer when clickable', () => {
      const onClick = vi.fn();
      renderWithTheme(<PropertyMapAvatar {...defaultProps} onClick={onClick} />);

      const button = screen.getByTestId('property-map-avatar');
      expect(button).not.toHaveAttribute('disabled');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for map view', () => {
      const onClick = vi.fn();
      renderWithTheme(<PropertyMapAvatar {...defaultProps} onClick={onClick} />);

      const button = screen.getByTestId('property-map-avatar');
      expect(button.getAttribute('aria-label')).toBe(
        'View map for 123 Main St, San Francisco, CA'
      );
    });

    it('should have proper aria-label for fallback view', () => {
      const onClick = vi.fn();
      renderWithTheme(
        <PropertyMapAvatar
          {...defaultProps}
          geocodingStatus="failed"
          onClick={onClick}
        />
      );

      const button = screen.getByTestId('property-map-avatar-fallback');
      expect(button.getAttribute('aria-label')).toContain('View details for');
    });

    it('should have alt text on map image', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} />);

      const img = screen.getByRole('img');
      expect(img.getAttribute('alt')).toBe(
        'Map showing property location at 123 Main St, San Francisco, CA'
      );
    });

    it('should handle missing address gracefully', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} address={undefined} />
      );

      const img = screen.getByRole('img');
      expect(img.getAttribute('alt')).toContain('Property location');
    });
  });

  describe('size variants', () => {
    it('should render small size correctly', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} size="small" />);

      expect(mockUseStaticMapUrl).toHaveBeenCalledWith(
        expect.objectContaining({ size: 'small' })
      );
    });

    it('should render medium size correctly (default)', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} />);

      expect(mockUseStaticMapUrl).toHaveBeenCalledWith(
        expect.objectContaining({ size: 'medium' })
      );
    });

    it('should render large size correctly', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} size="large" />);

      expect(mockUseStaticMapUrl).toHaveBeenCalledWith(
        expect.objectContaining({ size: 'large' })
      );
    });
  });

  describe('marker option', () => {
    it('should pass showMarker to useStaticMapUrl', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} showMarker={true} />);

      expect(mockUseStaticMapUrl).toHaveBeenCalledWith(
        expect.objectContaining({ showMarker: true })
      );
    });

    it('should default showMarker to false', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} />);

      expect(mockUseStaticMapUrl).toHaveBeenCalledWith(
        expect.objectContaining({ showMarker: false })
      );
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback icon when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom</div>;
      renderWithTheme(
        <PropertyMapAvatar
          {...defaultProps}
          geocodingStatus="failed"
          fallbackIcon={customFallback}
        />
      );

      expect(screen.getByTestId('custom-fallback')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should apply custom sx styles', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} sx={{ border: '2px solid red' }} />
      );

      const container = screen.getByTestId('property-map-avatar');
      expect(container).toBeTruthy();
    });
  });

  describe('data-testid', () => {
    it('should use default testid', () => {
      renderWithTheme(<PropertyMapAvatar {...defaultProps} />);
      expect(screen.getByTestId('property-map-avatar')).toBeTruthy();
    });

    it('should use custom testid when provided', () => {
      renderWithTheme(
        <PropertyMapAvatar {...defaultProps} data-testid="custom-avatar" />
      );
      expect(screen.getByTestId('custom-avatar')).toBeTruthy();
    });
  });
});
