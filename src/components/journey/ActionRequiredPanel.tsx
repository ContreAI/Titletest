'use client';

import { useRef } from 'react';
import { ActionItem, ActionType } from '@/types';
import { AlertTriangle, FileSignature, Upload, Calendar, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import { differenceInDays, differenceInHours, format } from 'date-fns';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const ACTION_CONFIG: Record<ActionType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  buttonLabel: string;
}> = {
  review: {
    icon: FileSignature,
    label: 'Review Required',
    buttonLabel: 'Review',
  },
  sign: {
    icon: FileSignature,
    label: 'Signature Required',
    buttonLabel: 'Sign Now',
  },
  upload: {
    icon: Upload,
    label: 'Upload Needed',
    buttonLabel: 'Upload',
  },
  schedule: {
    icon: Calendar,
    label: 'Scheduling Required',
    buttonLabel: 'Schedule',
  },
  confirm: {
    icon: CheckCircle,
    label: 'Confirmation Needed',
    buttonLabel: 'Confirm',
  },
};

// ── Countdown helper ───────────────────────────────────────────────
function getCountdown(dueDate: string): string {
  const now = new Date();
  const due = new Date(dueDate);
  const hoursLeft = differenceInHours(due, now);
  const daysLeft = differenceInDays(due, now);

  if (hoursLeft < 0) {
    return `${Math.abs(daysLeft)}d overdue`;
  }
  if (hoursLeft < 24) {
    return `${hoursLeft}h remaining`;
  }
  if (daysLeft <= 3) {
    const remainingHours = hoursLeft % 24;
    return `${daysLeft}d ${remainingHours}h remaining`;
  }
  return `${daysLeft}d remaining`;
}

// ── Action Item Row ────────────────────────────────────────────────
interface ActionItemRowProps {
  item: ActionItem;
  onAction?: (item: ActionItem) => void;
  index: number;
}

function ActionItemRow({ item, onAction, index }: ActionItemRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const config = ACTION_CONFIG[item.actionType];
  const Icon = config.icon;
  const daysUntilDue = differenceInDays(new Date(item.dueDate), new Date());
  const isOverdue = daysUntilDue < 0;
  const isUrgent = item.urgency === 'high' || daysUntilDue <= 2;
  const countdown = getCountdown(item.dueDate);

  // Staggered entrance
  useGSAP(() => {
    if (rowRef.current) {
      gsap.from(rowRef.current, {
        y: 8,
        opacity: 0,
        duration: 0.3,
        delay: index * 0.08 + 0.15,
        ease: 'power2.out',
      });
    }
  }, []);

  const getUrgencyStyles = () => {
    if (isOverdue) return 'bg-signal-red-50 border-signal-red-200 border-l-[3px] border-l-signal-red shadow-[inset_0_0_0_1px_rgba(220,38,38,0.05)]';
    if (isUrgent) return 'bg-amber-50 border-amber-200 border-l-[3px] border-l-amber-500';
    return 'bg-paper border-divider';
  };

  const getButtonStyles = () => {
    switch (item.urgency) {
      case 'high':
        return 'bg-signal-red-600 hover:bg-signal-red-700 text-white shadow-[0_2px_6px_rgba(220,38,38,0.25)]';
      case 'medium':
        return 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_2px_6px_rgba(245,158,11,0.2)]';
      case 'low':
        return 'bg-elevation2 hover:bg-elevation3 text-[var(--text-secondary)]';
    }
  };

  return (
    <div
      ref={rowRef}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-[var(--shadow-1)] ${getUrgencyStyles()}`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        isOverdue ? 'bg-signal-red-100' : isUrgent ? 'bg-amber-100' : 'bg-elevation2'
      }`}>
        <Icon className={`w-5 h-5 ${
          isOverdue ? 'text-signal-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--text-tertiary)]'
        }`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-[var(--text-primary)] truncate">{item.title}</h4>
          {isOverdue && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-signal-red-100 text-signal-red-700 rounded animate-pulse">
              Overdue
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--text-tertiary)] line-clamp-1">{item.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs font-medium ${
            isOverdue ? 'text-signal-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--text-tertiary)]'
          }`}>
            Due: {format(new Date(item.dueDate), 'MMM d')}
          </span>
          {/* Countdown timer */}
          <span className={`flex items-center gap-1 text-[11px] font-semibold font-[family-name:var(--font-mono)] ${
            isOverdue ? 'text-signal-red-600' : isUrgent ? 'text-amber-600' : 'text-[var(--text-disabled)]'
          }`}>
            <Clock className="w-3 h-3" />
            {countdown}
          </span>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={() => onAction?.(item)}
        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 shrink-0 transition-all duration-200 active:scale-[0.97] ${getButtonStyles()}`}
      >
        {config.buttonLabel}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
interface ActionRequiredPanelProps {
  items: ActionItem[];
  onAction?: (item: ActionItem) => void;
}

export default function ActionRequiredPanel({ items, onAction }: ActionRequiredPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        y: 10,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, []);

  if (items.length === 0) return null;

  const highPriorityCount = items.filter(i => i.urgency === 'high').length;

  return (
    <div ref={containerRef} className="bg-paper rounded-lg border border-amber-200 shadow-[var(--shadow-1)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Action Required</h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            {items.length} item{items.length !== 1 ? 's' : ''} need{items.length === 1 ? 's' : ''} your attention
            {highPriorityCount > 0 && (
              <span className="text-signal-red-600 font-semibold"> &bull; {highPriorityCount} urgent</span>
            )}
          </p>
        </div>
      </div>

      {/* Items — staggered entrance */}
      <div className="p-4 space-y-3">
        {items
          .sort((a, b) => {
            const urgencyOrder = { high: 0, medium: 1, low: 2 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            }
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          })
          .map((item, index) => (
            <ActionItemRow key={item.id} item={item} onAction={onAction} index={index} />
          ))}
      </div>
    </div>
  );
}
