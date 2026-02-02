import { MixinsOptions, SxProps, Theme } from '@mui/material';
import { Breakpoint } from '@mui/material';
import { TopnavType } from 'config';

/**
 * Shared card hover styles for consistent interactive feedback.
 * Combines subtle translateY lift with enhanced shadow for clear feedback.
 */
export const cardHoverStyles: SxProps<Theme> = {
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 2,
  },
};

/**
 * Creates card hover styles with custom options.
 * @param options.translateY - Vertical lift amount (default: -2px)
 * @param options.shadow - MUI shadow level for hover state (default: 2)
 */
export const createCardHoverStyles = (options?: {
  translateY?: number | string;
  shadow?: number;
}): SxProps<Theme> => {
  const { translateY = -2, shadow = 2 } = options ?? {};
  const translateValue = typeof translateY === 'number' ? `${translateY}px` : translateY;

  return {
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: `translateY(${translateValue})`,
      boxShadow: shadow,
    },
  };
};

declare module '@mui/material/styles' {
  interface Mixins {
    topbar: Record<TopnavType, Partial<Record<Breakpoint, number>>>;
    ecommerceTopbar: Partial<Record<Breakpoint, number>>;
    footer: Required<Pick<Record<Breakpoint, number>, 'xs' | 'sm'>>;
    topOffset: (
      topbarHeight: Partial<Record<Breakpoint, number>>,
      offset?: number,
      important?: boolean,
    ) => Partial<Record<Breakpoint, number>>;
    contentHeight: (
      topnavType: Partial<Record<Breakpoint, number>>,
      offset?: number,
      important?: boolean,
    ) => {
      [key: string]: string;
    };
  }
}

const mixins: MixinsOptions = {
  ecommerceTopbar: {
    xs: 188,
    sm: 190,
    md: 162,
  },
  topbar: {
    default: {
      xs: 64,
      md: 82,
    },
    slim: {
      xs: 38,
    },
    stacked: {
      xs: 129,
      md: 103,
    },
  },
  footer: { xs: 72, sm: 56 },
  topOffset: (topbarHeight, offset: number = 0, important = false) =>
    topbarHeight
      ? Object.entries(topbarHeight).reduce((acc: { [key: string]: string }, [key, value]) => {
          acc[key] = `${value + offset}px${important ? ' !important' : ''}`;
          return acc;
        }, {})
      : {},

  contentHeight: (topbarHeight, offset = 0, important = false) =>
    topbarHeight
      ? Object.entries(topbarHeight).reduce((acc: { [key: string]: string }, [key, value]) => {
          acc[key] = `calc(100vh - ${value + offset}px)${important ? ' !important' : ''}`;
          return acc;
        }, {})
      : {},
};

export default mixins;
