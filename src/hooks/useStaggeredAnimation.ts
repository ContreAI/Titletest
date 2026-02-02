import { useMemo, useSyncExternalStore } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Configuration for staggered entrance animations
 */
export interface StaggeredAnimationConfig {
  /** Base delay before first item animates (ms) */
  baseDelay?: number;
  /** Delay between each item (ms) */
  staggerDelay?: number;
  /** Animation duration (ms) - kept under 300ms for perceived responsiveness */
  duration?: number;
  /** Whether the item is currently being dragged (skip animation) */
  isDragging?: boolean;
}

// Subscribe to reduced motion preference changes
function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Hook to detect prefers-reduced-motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot
  );
}

/**
 * Hook that provides staggered fade-in animation styles for list items.
 * Automatically respects prefers-reduced-motion for accessibility.
 * Uses the global staggeredFadeIn keyframe defined in theme/styles/keyFrames.ts
 *
 * @param index - The index of the item in the list (0-based)
 * @param config - Optional animation configuration
 * @returns SxProps object to spread onto MUI components
 *
 * @example
 * ```tsx
 * const animationSx = useStaggeredAnimation(index);
 * return <Box sx={animationSx}>...</Box>;
 * ```
 */
export function useStaggeredAnimation(
  index: number,
  config: StaggeredAnimationConfig = {}
): SxProps<Theme> {
  const {
    baseDelay = 0,
    staggerDelay = 50,
    duration = 250,
    isDragging = false,
  } = config;

  const prefersReducedMotion = usePrefersReducedMotion();

  return useMemo(() => {
    // Skip animation if dragging or reduced motion is preferred
    if (isDragging || prefersReducedMotion) {
      return {};
    }

    const delay = baseDelay + index * staggerDelay;
    // Cap the delay at 500ms to prevent very long waits for long lists
    const cappedDelay = Math.min(delay, 500);

    return {
      animation: `staggeredFadeIn ${duration}ms ease-out ${cappedDelay}ms both`,
    };
  }, [index, baseDelay, staggerDelay, duration, isDragging, prefersReducedMotion]);
}

/**
 * Simplified version that returns inline style object for non-MUI elements.
 * Useful for drag-and-drop wrappers using plain divs.
 *
 * @param index - The index of the item in the list (0-based)
 * @param config - Optional animation configuration
 * @returns CSS properties object
 */
export function useStaggeredAnimationStyle(
  index: number,
  config: StaggeredAnimationConfig = {}
): React.CSSProperties {
  const {
    baseDelay = 0,
    staggerDelay = 50,
    duration = 250,
    isDragging = false,
  } = config;

  const prefersReducedMotion = usePrefersReducedMotion();

  return useMemo(() => {
    // Skip animation if dragging or reduced motion is preferred
    if (isDragging || prefersReducedMotion) {
      return {};
    }

    const delay = baseDelay + index * staggerDelay;
    const cappedDelay = Math.min(delay, 500);

    return {
      animation: `staggeredFadeIn ${duration}ms ease-out ${cappedDelay}ms both`,
    };
  }, [index, baseDelay, staggerDelay, duration, isDragging, prefersReducedMotion]);
}

export default useStaggeredAnimation;
