import { PropsWithChildren, createContext, use, useEffect, useState, useMemo, useCallback } from 'react';
import { Breakpoint, Theme, useTheme } from '@mui/material';
import { useMediaQuery } from '@mui/material';

interface BreakpointContextInterface {
  currentBreakpoint: Breakpoint;
  up: (key: Breakpoint | number) => boolean;
  down: (key: Breakpoint | number) => boolean;
  only: (key: Breakpoint | number) => boolean;
  between: (start: Breakpoint | number, end: Breakpoint | number) => boolean;
}

export const BreakpointContext = createContext({} as BreakpointContextInterface);

const BreakpointsProvider = ({ children }: PropsWithChildren) => {
  const theme = useTheme();
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');

  // Pre-compute all breakpoint media queries at the top level (rules of hooks)
  const isUpXs = useMediaQuery<Theme>((t) => t.breakpoints.up('xs'));
  const isUpSm = useMediaQuery<Theme>((t) => t.breakpoints.up('sm'));
  const isUpMd = useMediaQuery<Theme>((t) => t.breakpoints.up('md'));
  const isUpLg = useMediaQuery<Theme>((t) => t.breakpoints.up('lg'));
  const isUpXl = useMediaQuery<Theme>((t) => t.breakpoints.up('xl'));

  const isDownXs = useMediaQuery<Theme>((t) => t.breakpoints.down('xs'));
  const isDownSm = useMediaQuery<Theme>((t) => t.breakpoints.down('sm'));
  const isDownMd = useMediaQuery<Theme>((t) => t.breakpoints.down('md'));
  const isDownLg = useMediaQuery<Theme>((t) => t.breakpoints.down('lg'));
  const isDownXl = useMediaQuery<Theme>((t) => t.breakpoints.down('xl'));

  // Create lookup maps for pre-computed values
  const upMap = useMemo(
    () => ({
      xs: isUpXs,
      sm: isUpSm,
      md: isUpMd,
      lg: isUpLg,
      xl: isUpXl,
    }),
    [isUpXs, isUpSm, isUpMd, isUpLg, isUpXl]
  );

  const downMap = useMemo(
    () => ({
      xs: isDownXs,
      sm: isDownSm,
      md: isDownMd,
      lg: isDownLg,
      xl: isDownXl,
    }),
    [isDownXs, isDownSm, isDownMd, isDownLg, isDownXl]
  );

  // Create functions that use the pre-computed values
  const up = useCallback(
    (key: Breakpoint | number): boolean => {
      if (typeof key === 'number') {
        // For numeric values, use theme breakpoints to determine
        const breakpoints = theme.breakpoints.values;
        if (key <= breakpoints.xs) return upMap.xs;
        if (key <= breakpoints.sm) return upMap.sm;
        if (key <= breakpoints.md) return upMap.md;
        if (key <= breakpoints.lg) return upMap.lg;
        return upMap.xl;
      }
      return upMap[key] ?? false;
    },
    [upMap, theme.breakpoints.values]
  );

  const down = useCallback(
    (key: Breakpoint | number): boolean => {
      if (typeof key === 'number') {
        const breakpoints = theme.breakpoints.values;
        if (key <= breakpoints.xs) return downMap.xs;
        if (key <= breakpoints.sm) return downMap.sm;
        if (key <= breakpoints.md) return downMap.md;
        if (key <= breakpoints.lg) return downMap.lg;
        return downMap.xl;
      }
      return downMap[key] ?? false;
    },
    [downMap, theme.breakpoints.values]
  );

  const only = useCallback(
    (key: Breakpoint | number): boolean => {
      const breakpoint = typeof key === 'number' ? getBreakpointFromNumber(key, theme) : key;
      return up(breakpoint) && down(getNextBreakpoint(breakpoint));
    },
    [up, down, theme]
  );

  const between = useCallback(
    (start: Breakpoint | number, end: Breakpoint | number): boolean => {
      const startBp = typeof start === 'number' ? getBreakpointFromNumber(start, theme) : start;
      const endBp = typeof end === 'number' ? getBreakpointFromNumber(end, theme) : end;
      return up(startBp) && down(endBp);
    },
    [up, down, theme]
  );

  // Compute current breakpoint based on pre-computed values
  const isXs = isUpXs && isDownSm;
  const isSm = isUpSm && isDownMd;
  const isMd = isUpMd && isDownLg;
  const isLg = isUpLg && isDownXl;
  const isXl = isUpXl;

  useEffect(() => {
    if (isXl) {
      setCurrentBreakpoint('xl');
    } else if (isLg) {
      setCurrentBreakpoint('lg');
    } else if (isMd) {
      setCurrentBreakpoint('md');
    } else if (isSm) {
      setCurrentBreakpoint('sm');
    } else if (isXs) {
      setCurrentBreakpoint('xs');
    }
  }, [isXs, isSm, isMd, isLg, isXl]);

  return (
    <BreakpointContext value={{ currentBreakpoint, up, down, only, between }}>
      {children}
    </BreakpointContext>
  );
};

// Helper function to get breakpoint from number
function getBreakpointFromNumber(value: number, theme: Theme): Breakpoint {
  const breakpoints = theme.breakpoints.values;
  if (value < breakpoints.sm) return 'xs';
  if (value < breakpoints.md) return 'sm';
  if (value < breakpoints.lg) return 'md';
  if (value < breakpoints.xl) return 'lg';
  return 'xl';
}

// Helper function to get next breakpoint
function getNextBreakpoint(breakpoint: Breakpoint): Breakpoint {
  const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const index = order.indexOf(breakpoint);
  return order[Math.min(index + 1, order.length - 1)];
}

export const useBreakpoints = () => use(BreakpointContext);

export default BreakpointsProvider;
