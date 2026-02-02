import type { TimelineDate, TimelineState } from '../types';

/**
 * Calculate relative time cue for a date
 */
export const getRelativeTimeCue = (
  dateStr: string | null | undefined
): { text: string; color: 'normal' | 'warning' | 'error' } | null => {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffMs = date.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: 'Today', color: 'warning' };
    } else if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return { text: `${absDays}d overdue`, color: 'error' };
    } else if (diffDays <= 7) {
      return { text: `In ${diffDays}d`, color: diffDays <= 2 ? 'warning' : 'normal' };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Normalize timeline items to use state property (backwards compat with active)
 */
export const normalizeTimelineItems = (items: TimelineDate[]): Array<TimelineDate & { state: TimelineState }> => {
  const lastActiveIndex = items.reduce((acc, it, i) => (it.active ? i : acc), -1);

  return items.map((item, index) => {
    if (item.state) return { ...item, state: item.state };

    // Convert legacy active boolean to state
    let state: TimelineState;
    if (item.active) {
      state = index === lastActiveIndex ? 'current' : 'past';
    } else {
      state = 'future';
    }

    return { ...item, state };
  });
};

