'use client';

import { useRef } from 'react';
import { TransactionPhase, PhaseStatusType, PhaseAlert } from '@/types';
import { differenceInDays, format } from 'date-fns';
import { Check, AlertCircle, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// ── Phase Indicator (compact dot + label) ──────────────────────────
interface PhaseIndicatorProps {
  phase: TransactionPhase;
  label: string;
  shortLabel: string;
  status: PhaseStatusType;
  alert?: PhaseAlert;
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: (phase: TransactionPhase) => void;
}

const PhaseIndicator = ({
  phase,
  label,
  shortLabel,
  status,
  alert,
  isFirst,
  isLast,
  onClick,
}: PhaseIndicatorProps) => {
  const hasAlert = alert && alert.level !== 'none';
  const isError = alert?.level === 'error';
  const isWarning = alert?.level === 'warning';

  const getStatusStyles = () => {
    if (status === 'not_applicable') {
      return 'bg-elevation1 border-dashed border-[var(--text-disabled)] text-[var(--text-disabled)]';
    }
    if (hasAlert && status !== 'complete') {
      if (isError) {
        return 'bg-paper border-signal-red text-signal-red shadow-[0_0_0_2px_var(--bg-paper),0_0_0_3px_var(--signal-red)]';
      }
      if (isWarning) {
        return 'bg-paper border-amber-500 text-amber-500 shadow-[0_0_0_2px_var(--bg-paper),0_0_0_3px_#f59e0b]';
      }
    }
    switch (status) {
      case 'complete':
        return 'bg-spruce text-white border-spruce shadow-[0_1px_4px_rgba(60,90,60,0.25)]';
      case 'in_progress':
        return 'bg-paper border-spruce text-spruce shadow-[0_0_0_2px_var(--bg-paper),0_0_0_3px_var(--spruce)]';
      case 'upcoming':
        return 'bg-elevation2 border-elevation4 text-[var(--text-disabled)]';
      default:
        return 'bg-elevation2 border-elevation4 text-[var(--text-disabled)]';
    }
  };

  const getConnectorStyles = () => {
    if (status === 'not_applicable') return 'bg-elevation3';
    switch (status) {
      case 'complete':
        return 'bg-spruce';
      case 'in_progress':
        return 'bg-gradient-to-r from-spruce to-elevation4';
      case 'upcoming':
        return 'bg-elevation4';
      default:
        return 'bg-elevation4';
    }
  };

  const getLabelStyles = () => {
    if (status === 'not_applicable') return 'text-[var(--text-disabled)]';
    if (hasAlert && status !== 'complete') {
      return isError ? 'text-signal-red-600' : 'text-amber-600';
    }
    return status === 'upcoming' ? 'text-[var(--text-disabled)]' : 'text-[var(--text-secondary)]';
  };

  return (
    <div className="flex items-center">
      {/* Connector line (before) */}
      {!isFirst && (
        <div className={`h-0.5 w-6 sm:w-10 rounded-full transition-all duration-400 ${getConnectorStyles()}`} />
      )}

      {/* Phase dot */}
      <div className="flex flex-col items-center relative">
        <button
          onClick={() => onClick?.(phase)}
          className={`
            w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[1.5px]
            flex items-center justify-center
            transition-all duration-300 cursor-pointer hover:scale-110
            ${getStatusStyles()}
          `}
          title={alert?.message || label}
        >
          {status === 'not_applicable' && (
            <span className="text-[8px] sm:text-[10px] font-medium opacity-60">N/A</span>
          )}
          {status === 'complete' && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />}
          {status === 'in_progress' && !hasAlert && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spruce opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-spruce" />
            </span>
          )}
          {hasAlert && status !== 'complete' && status !== 'not_applicable' && (
            isError
              ? <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              : <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </button>

        {/* Alert badge */}
        {hasAlert && status !== 'complete' && (
          <div
            className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center ${
              isError ? 'bg-signal-red' : 'bg-amber-500'
            }`}
          >
            <span className="text-white text-[7px] font-bold leading-none">!</span>
          </div>
        )}

        {/* Label */}
        <span className={`mt-1 text-[10px] sm:text-xs font-medium whitespace-nowrap ${getLabelStyles()}`}>
          <span className="hidden lg:inline">{status === 'not_applicable' ? 'N/A' : label}</span>
          <span className="lg:hidden">{status === 'not_applicable' ? 'N/A' : shortLabel}</span>
        </span>
      </div>

      {/* Connector line (after) */}
      {!isLast && (
        <div className={`h-0.5 w-6 sm:w-10 rounded-full transition-all duration-400 ${
          status === 'complete' ? 'bg-spruce' : 'bg-elevation4'
        }`} />
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────
interface MiniJourneyTrackerProps {
  currentPhase: TransactionPhase;
  percentComplete: number;
  closingDate: string;
  isFinanced?: boolean;
  phaseAlerts?: Partial<Record<TransactionPhase, PhaseAlert>>;
  onPhaseClick?: (phase: TransactionPhase) => void;
  className?: string;
}

const PHASES: Array<{
  id: TransactionPhase;
  label: string;
  shortLabel: string;
}> = [
  { id: 'contract', label: 'Contract', shortLabel: 'Contract' },
  { id: 'title', label: 'Due Diligence', shortLabel: 'DD' },
  { id: 'financing', label: 'Financing', shortLabel: 'Finance' },
  { id: 'clear_to_close', label: 'Clear to Close', shortLabel: 'CTC' },
  { id: 'closed', label: 'Closed', shortLabel: 'Closed' },
];

const getPhaseIndex = (phase: TransactionPhase): number => {
  return PHASES.findIndex(p => p.id === phase);
};

const getPhaseStatus = (
  phaseIndex: number,
  currentPhaseIndex: number,
  phaseId: TransactionPhase,
  isFinanced: boolean
): PhaseStatusType => {
  if (phaseId === 'financing' && !isFinanced) return 'not_applicable';
  if (phaseIndex < currentPhaseIndex) return 'complete';
  if (phaseIndex === currentPhaseIndex) return 'in_progress';
  return 'upcoming';
};

export default function MiniJourneyTracker({
  currentPhase,
  percentComplete,
  closingDate,
  isFinanced = true,
  phaseAlerts = {},
  onPhaseClick,
  className = '',
}: MiniJourneyTrackerProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPhaseIndex = getPhaseIndex(currentPhase);
  const daysUntilClosing = differenceInDays(new Date(closingDate), new Date());
  const formattedDate = format(new Date(closingDate), 'MMM d');

  const hasAnyAlert = Object.values(phaseAlerts).some(
    (alert) => alert && alert.level !== 'none'
  );

  // Animate progress bar on mount
  useGSAP(() => {
    if (barRef.current) {
      gsap.from(barRef.current, {
        width: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div ref={containerRef} className={`bg-paper border-b border-divider ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Desktop/Tablet Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          {/* Phase indicators */}
          <div className="flex items-center">
            {PHASES.map((phase, index) => (
              <PhaseIndicator
                key={phase.id}
                phase={phase.id}
                label={phase.label}
                shortLabel={phase.shortLabel}
                status={getPhaseStatus(index, currentPhaseIndex, phase.id, isFinanced)}
                alert={phaseAlerts[phase.id]}
                isFirst={index === 0}
                isLast={index === PHASES.length - 1}
                onClick={onPhaseClick}
              />
            ))}
          </div>

          {/* Progress bar and closing date */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-24 lg:w-32 h-2 bg-elevation3 rounded-full overflow-hidden">
                <div
                  ref={barRef}
                  className="h-full bg-spruce rounded-full"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <span className="text-xs font-semibold font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
                {percentComplete}%
              </span>
            </div>

            <div className="w-px h-6 bg-divider" />

            <div className="text-right">
              <div className="text-xs text-[var(--text-tertiary)]">Closing</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {formattedDate}{' '}
                <span className={`${daysUntilClosing <= 7 ? 'text-amber-600' : 'text-[var(--text-tertiary)]'}`}>
                  ({daysUntilClosing}d)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-spruce">
                  {PHASES[currentPhaseIndex]?.label || 'In Progress'}
                </span>
                {hasAnyAlert && (
                  <span className="flex items-center gap-1 text-xs text-signal-red-600">
                    <AlertCircle className="w-3 h-3" />
                    Alert
                  </span>
                )}
                <span className="text-xs text-[var(--text-disabled)]">&bull;</span>
                <span className="text-xs font-semibold font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
                  {percentComplete}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-elevation3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hasAnyAlert ? 'bg-signal-red' : 'bg-spruce'
                  }`}
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">Close</div>
              <div className={`text-sm font-bold font-[family-name:var(--font-mono)] ${
                hasAnyAlert ? 'text-signal-red-600' : daysUntilClosing <= 7 ? 'text-amber-600' : 'text-[var(--text-primary)]'
              }`}>
                {daysUntilClosing}d
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
