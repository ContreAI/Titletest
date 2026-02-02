export type TimelineState = 'past' | 'current' | 'future' | 'not_applicable';

export type AlertLevel = 'none' | 'warning' | 'error';

export interface TimelineCheckpoint {
  id: string;
  label: string;
  complete: boolean;
  completedDate?: string;
}

export interface TimelineDate {
  /** Label shown above the progress bar (e.g., "Day 1") */
  label: string;
  /** Secondary label shown below the dot (e.g., "Jan 15, 2024") */
  caption?: string;
  /** Raw date string for calculating relative time (e.g., "2024-11-15") */
  date?: string | null;
  /** State of this milestone: past (completed), current (active), future, or not_applicable (cash) */
  state?: TimelineState;
  /** @deprecated Use state instead. Kept for backwards compatibility */
  active?: boolean;
  /** Alert level for overdue or at-risk items */
  alertLevel?: AlertLevel;
  /** Alert message to display (e.g., "Lender docs not received") */
  alertMessage?: string;
  /** Number of days overdue (for alert display) */
  daysOverdue?: number;
  /** Checkpoints within this phase (e.g., EM received, docs submitted) */
  checkpoints?: TimelineCheckpoint[];
}

