import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStableValue } from '../useStableValue';

describe('useStableValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useStableValue('initial'));
    expect(result.current).toBe('initial');
  });

  it('should not update value before debounce delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: 'first' } },
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second' });
    expect(result.current).toBe('first'); // Still the old value

    act(() => {
      vi.advanceTimersByTime(100); // Less than default 150ms
    });
    expect(result.current).toBe('first'); // Still waiting
  });

  it('should update value after debounce delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: 'first' } },
    );

    rerender({ value: 'second' });

    act(() => {
      vi.advanceTimersByTime(150); // Default delay
    });

    expect(result.current).toBe('second');
  });

  it('should only apply the last value when rapidly changing', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: 'first' } },
    );

    // Rapid changes
    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: 'fourth' });

    // Value should still be 'first' since no debounce completed
    expect(result.current).toBe('first');

    // Now wait for debounce to complete
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Should be the last value
    expect(result.current).toBe('fourth');
  });

  it('should respect custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useStableValue(value, delay),
      { initialProps: { value: 'first', delay: 300 } },
    );

    rerender({ value: 'second', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(150); // Default would have fired
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(150); // Now at 300ms
    });
    expect(result.current).toBe('second');
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { rerender, unmount } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: 'first' } },
    );

    rerender({ value: 'second' }); // Starts a timeout

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should work with different types', () => {
    // Number
    const { result: numResult, rerender: numRerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: 1 } },
    );
    expect(numResult.current).toBe(1);
    numRerender({ value: 2 });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(numResult.current).toBe(2);

    // Object
    const obj1 = { a: 1 };
    const obj2 = { a: 2 };
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useStableValue(value),
      { initialProps: { value: obj1 } },
    );
    expect(objResult.current).toBe(obj1);
    objRerender({ value: obj2 });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(objResult.current).toBe(obj2);
  });
});
