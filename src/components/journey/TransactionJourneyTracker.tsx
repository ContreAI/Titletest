'use client';

import { useRef, useEffect } from 'react';
import { TransactionPhase, PhaseStatusType, PhaseConfig, PhaseAlert, PhaseCheckpoint } from '@/types';
import { differenceInDays, format } from 'date-fns';
import { Check, Calendar, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// ── Phase configurations ───────────────────────────────────────────
const PHASE_CONFIGS: PhaseConfig[] = [
  {
    id: 'contract',
    label: 'Contract',
    shortLabel: 'Contract',
    description: 'Offer accepted, earnest money deposited',
    typicalDuration: '1-3 days',
    keyMilestones: ['Earnest money deposited', 'Purchase agreement executed', 'Contingencies begin'],
  },
  {
    id: 'title',
    label: 'Due Diligence',
    shortLabel: 'Title',
    description: 'Inspections and title work underway',
    typicalDuration: '7-14 days',
    keyMilestones: ['Inspection completed', 'Title commitment received', 'Title issues identified'],
  },
  {
    id: 'financing',
    label: 'Financing',
    shortLabel: 'Finance',
    description: 'Loan underwriting in progress',
    typicalDuration: '14-21 days',
    keyMilestones: ['Appraisal completed', 'All docs submitted', 'Underwriting approval'],
  },
  {
    id: 'clear_to_close',
    label: 'Clear to Close',
    shortLabel: 'CTC',
    description: 'Final preparations for closing',
    typicalDuration: '3-7 days',
    keyMilestones: ['CTC issued', 'Closing Disclosure sent', 'Final walkthrough'],
  },
  {
    id: 'closed',
    label: 'Closed',
    shortLabel: 'Closed',
    description: 'Transaction complete!',
    typicalDuration: 'Closing day',
    keyMilestones: ['Documents signed', 'Funds transferred', 'Deed recorded'],
  },
];

// ── Phase Node Component ───────────────────────────────────────────
interface PhaseNodeProps {
  config: PhaseConfig;
  status: PhaseStatusType;
  alert?: PhaseAlert;
  checkpoints?: PhaseCheckpoint[];
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: () => void;
  index: number;
}

const PhaseNode = ({ config, status, alert, checkpoints, isFirst, isLast, onClick, index }: PhaseNodeProps) => {
  const nodeRef = useRef<HTMLButtonElement>(null);
  const hasAlert = alert && alert.level !== 'none';
  const isError = alert?.level === 'error';
  const isWarning = alert?.level === 'warning';

  // Entrance animation for each node
  useGSAP(() => {
    if (nodeRef.current) {
      gsap.from(nodeRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        delay: index * 0.1 + 0.2,
        ease: 'back.out(1.4)',
      });
    }
  }, []);

  const getNodeClasses = () => {
    if (status === 'not_applicable') {
      return 'bg-elevation1 border-dashed border-[var(--text-disabled)] text-[var(--text-disabled)]';
    }
    if (hasAlert && status !== 'complete') {
      if (isError) {
        return 'bg-paper border-signal-red text-signal-red shadow-[0_0_0_3px_var(--bg-paper),0_0_0_5px_var(--signal-red),0_0_12px_rgba(220,38,38,0.3)]';
      }
      if (isWarning) {
        return 'bg-paper border-amber-500 text-amber-500 shadow-[0_0_0_3px_var(--bg-paper),0_0_0_5px_#f59e0b,0_0_12px_rgba(245,158,11,0.3)]';
      }
    }
    switch (status) {
      case 'complete':
        return 'bg-spruce border-spruce text-white shadow-[0_2px_8px_rgba(60,90,60,0.3)]';
      case 'in_progress':
        return 'bg-paper border-spruce text-spruce shadow-[0_0_0_3px_var(--bg-paper),0_0_0_5px_var(--spruce),0_0_12px_rgba(60,90,60,0.25)]';
      case 'upcoming':
      default:
        return 'bg-elevation2 border-elevation4 text-[var(--text-disabled)]';
    }
  };

  const getLabelClasses = () => {
    if (status === 'not_applicable') return 'text-[var(--text-disabled)]';
    if (hasAlert && status !== 'complete') {
      return isError ? 'text-signal-red-600 font-semibold' : 'text-amber-600 font-semibold';
    }
    switch (status) {
      case 'complete': return 'text-spruce font-semibold';
      case 'in_progress': return 'text-spruce font-bold';
      default: return 'text-[var(--text-disabled)]';
    }
  };

  const getConnectorClasses = (position: 'left' | 'right') => {
    if (status === 'not_applicable') return 'bg-elevation3';
    if (position === 'left') {
      return status === 'upcoming' ? 'bg-elevation3' : 'bg-spruce';
    }
    return status === 'complete' ? 'bg-spruce' : 'bg-elevation3';
  };

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      {/* Connector rail + Node row */}
      <div className="flex items-center w-full">
        {/* Left connector — 4px height matching ui-main rail */}
        {!isFirst && (
          <div
            className={`flex-1 h-1 rounded-full transition-all duration-500 ease-out ${getConnectorClasses('left')}`}
          />
        )}

        {/* Phase node */}
        <div className="relative shrink-0">
          <button
            ref={nodeRef}
            onClick={onClick}
            className={`
              w-10 h-10 md:w-12 md:h-12 rounded-full border-2
              flex items-center justify-center
              transition-all duration-300 ease-out
              hover:scale-110 cursor-pointer
              ${getNodeClasses()}
            `}
            title={alert?.message || config.label}
          >
            {status === 'not_applicable' ? (
              <span className="text-[10px] md:text-xs font-medium opacity-60">N/A</span>
            ) : status === 'complete' ? (
              <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            ) : hasAlert ? (
              isError ? (
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              ) : (
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
              )
            ) : status === 'in_progress' ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spruce opacity-50" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-spruce" />
              </span>
            ) : (
              <span className="text-sm font-medium">
                {PHASE_CONFIGS.findIndex(p => p.id === config.id) + 1}
              </span>
            )}
          </button>

          {/* Alert badge */}
          {hasAlert && status !== 'complete' && (
            <div
              className={`
                absolute -top-1 -right-1 w-[14px] h-[14px] rounded-full
                flex items-center justify-center text-white
                ${isError ? 'bg-signal-red animate-pulse' : 'bg-amber-500'}
              `}
            >
              <span className="text-[8px] font-bold leading-none">!</span>
            </div>
          )}
        </div>

        {/* Right connector */}
        {!isLast && (
          <div
            className={`flex-1 h-1 rounded-full transition-all duration-500 ease-out ${getConnectorClasses('right')}`}
          />
        )}
      </div>

      {/* Labels and checkpoints */}
      <div className="mt-3 text-center px-1 w-full">
        <div className={`text-xs md:text-sm leading-tight ${getLabelClasses()}`}>
          {status === 'not_applicable' ? 'N/A (Cash)' : config.label}
        </div>

        {/* Alert message */}
        {hasAlert && status !== 'complete' && (
          <div className={`text-[10px] md:text-xs mt-0.5 font-medium ${
            isError ? 'text-signal-red-600' : 'text-amber-600'
          }`}>
            {alert.message}
          </div>
        )}

        {/* Phase description for current */}
        {!hasAlert && status === 'in_progress' && (
          <div className="text-[10px] md:text-xs mt-0.5 text-[var(--text-tertiary)]">
            {config.description}
          </div>
        )}

        {/* Checkpoint progress — 6px dots matching ui-main */}
        {checkpoints && checkpoints.length > 0 && status !== 'not_applicable' && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-300
                  ${cp.complete
                    ? 'bg-spruce shadow-[0_0_4px_rgba(60,90,60,0.4)]'
                    : 'bg-elevation4'
                  }
                `}
                title={`${cp.label}${cp.complete && cp.completedDate ? ` — ${cp.completedDate}` : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── SVG Progress Ring ──────────────────────────────────────────────
interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  hasError?: boolean;
}

const ProgressRing = ({ percent, size = 72, strokeWidth = 5, hasError = false }: ProgressRingProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useGSAP(() => {
    if (circleRef.current && textRef.current) {
      // Animate stroke
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: circumference - (percent / 100) * circumference,
          duration: 1.2,
          delay: 0.5,
          ease: 'power2.out',
        }
      );
      // Animate number counter
      gsap.fromTo(
        textRef.current,
        { textContent: '0' },
        {
          textContent: String(percent),
          duration: 1.2,
          delay: 0.5,
          ease: 'power2.out',
          snap: { textContent: 1 },
          onUpdate() {
            if (textRef.current) {
              textRef.current.textContent = `${Math.round(parseFloat(textRef.current.textContent || '0'))}%`;
            }
          },
        }
      );
    }
  }, [percent]);

  const strokeColor = hasError ? 'var(--signal-red)' : 'var(--spruce)';
  const trackColor = 'var(--bg-elevation3)';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <circle
        ref={circleRef}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        className="transition-colors duration-300"
      />
      {/* Center text */}
      <text
        ref={textRef}
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[var(--text-primary)] text-lg font-bold font-[var(--font-mono)]"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: '16px', fontFamily: 'var(--font-mono)' }}
      >
        0%
      </text>
    </svg>
  );
};

// ── Animated Counter ───────────────────────────────────────────────
interface AnimatedCounterProps {
  value: number;
  className?: string;
}

const AnimatedCounter = ({ value, className = '' }: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { textContent: '0' },
        {
          textContent: String(value),
          duration: 1,
          delay: 0.6,
          ease: 'power2.out',
          snap: { textContent: 1 },
          onUpdate() {
            if (ref.current) {
              ref.current.textContent = String(Math.round(parseFloat(ref.current.textContent || '0')));
            }
          },
        }
      );
    }
  }, [value]);

  return <span ref={ref} className={className}>0</span>;
};

// ── Main Component ─────────────────────────────────────────────────
interface TransactionJourneyTrackerProps {
  currentPhase: TransactionPhase;
  percentComplete: number;
  closingDate: string;
  contractDate?: string;
  isFinanced?: boolean;
  phaseAlerts?: Partial<Record<TransactionPhase, PhaseAlert>>;
  phaseCheckpoints?: Partial<Record<TransactionPhase, PhaseCheckpoint[]>>;
  onPhaseClick?: (phase: TransactionPhase) => void;
}

const getPhaseIndex = (phase: TransactionPhase): number => {
  return PHASE_CONFIGS.findIndex(p => p.id === phase);
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

export default function TransactionJourneyTracker({
  currentPhase,
  percentComplete,
  closingDate,
  contractDate,
  isFinanced = true,
  phaseAlerts = {},
  phaseCheckpoints = {},
  onPhaseClick,
}: TransactionJourneyTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPhaseIndex = getPhaseIndex(currentPhase);
  const daysUntilClosing = differenceInDays(new Date(closingDate), new Date());
  const formattedClosingDate = format(new Date(closingDate), 'MMMM d, yyyy');
  const totalDays = contractDate
    ? differenceInDays(new Date(closingDate), new Date(contractDate))
    : null;

  const hasErrorAlert = Object.values(phaseAlerts).some(
    (alert) => alert && alert.level === 'error'
  );

  // Entrance fade for the whole card
  useGSAP(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        y: 12,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-paper rounded-lg border border-divider shadow-[var(--shadow-1)] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-divider bg-gradient-to-r from-elevation1 to-paper">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Transaction Progress
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-tertiary)]">Est. Closing:</span>
            <span className="font-semibold text-[var(--text-primary)]">{formattedClosingDate}</span>
          </div>
        </div>
      </div>

      {/* Phase timeline */}
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-start">
          {PHASE_CONFIGS.map((config, index) => (
            <PhaseNode
              key={config.id}
              config={config}
              status={getPhaseStatus(index, currentPhaseIndex, config.id, isFinanced)}
              alert={phaseAlerts[config.id]}
              checkpoints={phaseCheckpoints[config.id]}
              isFirst={index === 0}
              isLast={index === PHASE_CONFIGS.length - 1}
              onClick={() => onPhaseClick?.(config.id)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Progress ring + stats footer */}
      <div className={`px-4 md:px-6 py-4 border-t ${
        hasErrorAlert ? 'bg-signal-red-50 border-signal-red-100' : 'bg-elevation1 border-divider'
      }`}>
        <div className="flex items-center gap-6">
          {/* SVG Progress Ring */}
          <div className="shrink-0 hidden md:block">
            <ProgressRing percent={percentComplete} hasError={hasErrorAlert} />
          </div>

          {/* Mobile: linear progress bar fallback */}
          <div className="flex-1 md:hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-sm font-medium ${
                hasErrorAlert ? 'text-signal-red-700' : 'text-[var(--text-secondary)]'
              }`}>
                {hasErrorAlert ? 'Action Required' : 'Overall Progress'}
              </span>
              <span className={`text-sm font-bold font-[family-name:var(--font-mono)] ${
                hasErrorAlert ? 'text-signal-red-600' : 'text-spruce'
              }`}>
                {percentComplete}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-elevation3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  hasErrorAlert
                    ? 'bg-gradient-to-r from-signal-red to-signal-red-400'
                    : 'bg-gradient-to-r from-spruce to-fern-400'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Desktop: label + progress text */}
          <div className="hidden md:flex flex-col flex-1 min-w-0">
            <span className={`text-sm font-medium ${
              hasErrorAlert ? 'text-signal-red-700' : 'text-[var(--text-secondary)]'
            }`}>
              {hasErrorAlert ? 'Action Required' : 'Overall Progress'}
            </span>
            <div className="w-full h-2 bg-elevation3 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  hasErrorAlert
                    ? 'bg-gradient-to-r from-signal-red to-signal-red-400'
                    : 'bg-gradient-to-r from-spruce to-fern-400'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-spruce/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-spruce" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-[var(--text-tertiary)] font-medium tracking-wide">Days Left</div>
                <div className={`text-lg font-bold font-[family-name:var(--font-mono)] ${
                  daysUntilClosing <= 7 ? 'text-amber-600' : 'text-[var(--text-primary)]'
                }`}>
                  <AnimatedCounter value={daysUntilClosing} />
                </div>
              </div>
            </div>

            {totalDays && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-elevation2 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--text-tertiary)] font-medium tracking-wide">Total Days</div>
                  <div className="text-lg font-bold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                    <AnimatedCounter value={totalDays} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
