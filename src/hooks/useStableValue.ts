import { useEffect, useRef, useState } from 'react';

/** Default debounce period in milliseconds */
const DEFAULT_DEBOUNCE_MS = 150;

/**
 * Returns a debounced version of the input value that only updates
 * after the value has been stable for the specified delay.
 *
 * Useful for preventing rapid state changes from triggering cascading
 * re-renders or effects (e.g., system theme signal changes).
 *
 * Note: The initial value is returned immediately on first render without
 * debouncing. This is intentional to avoid flash of undefined/stale content.
 * Only subsequent changes are debounced.
 *
 * @param value - The value to debounce
 * @param delayMs - Debounce delay in milliseconds (default: 150ms)
 * @returns The debounced/stable value
 */
export function useStableValue<T>(value: T, delayMs: number = DEFAULT_DEBOUNCE_MS): T {
  const [stableValue, setStableValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce value changes to prevent rapid updates
    timeoutRef.current = setTimeout(() => {
      setStableValue(value);
      timeoutRef.current = null;
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delayMs]);

  return stableValue;
}
