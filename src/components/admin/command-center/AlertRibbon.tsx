"use client";

import { useState, useCallback } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Zap,
  X,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AlertRibbonItem {
  type: "trid" | "overdue" | "wire";
  message: string;
  count?: number;
  transactionId?: string;
}

export interface AlertRibbonProps {
  items: AlertRibbonItem[];
  onDismiss?: () => void;
  onGoClick?: (transactionId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ICON_MAP: Record<AlertRibbonItem["type"], React.ComponentType<{ className?: string }>> = {
  trid: ShieldAlert,
  overdue: Clock,
  wire: Zap,
};

const LABEL_MAP: Record<AlertRibbonItem["type"], string> = {
  trid: "TRID Violation",
  overdue: "Overdue",
  wire: "Wire Alert",
};

function hasCritical(items: AlertRibbonItem[]): boolean {
  return items.some((i) => i.type === "trid" || i.type === "wire");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AlertRibbon({
  items,
  onDismiss,
  onGoClick,
}: AlertRibbonProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  // Auto-hide when no items or dismissed
  if (items.length === 0 || dismissed) return null;

  const critical = hasCritical(items);

  return (
    <div
      role="alert"
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-lg
        border transition-colors duration-200
        ${
          critical
            ? "bg-signal-red/10 border-signal-red/30 text-signal-red"
            : "bg-amber/10 border-amber/30 text-amber-400"
        }
      `}
    >
      {/* Leading icon */}
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />

      {/* Items list */}
      <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
        {items.map((item, idx) => {
          const Icon = ICON_MAP[item.type];
          return (
            <div
              key={`${item.type}-${item.transactionId ?? idx}`}
              className="flex items-center gap-2 text-sm"
            >
              <Icon className="w-4 h-4 flex-shrink-0 opacity-80" />

              <span className="font-medium truncate max-w-[260px]">
                {item.message}
              </span>

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center
                    font-[family-name:var(--font-mono)] text-xs font-semibold
                    min-w-[22px] h-5 px-1.5 rounded-full
                    ${
                      critical
                        ? "bg-signal-red/20 text-signal-red"
                        : "bg-amber/20 text-amber-400"
                    }
                  `}
                >
                  {item.count}
                </span>
              )}

              {item.transactionId && onGoClick && (
                <button
                  onClick={() => onGoClick(item.transactionId!)}
                  className={`
                    inline-flex items-center gap-0.5 text-xs font-semibold
                    px-2 py-0.5 rounded-md
                    transition-all duration-150
                    hover:underline
                    ${
                      critical
                        ? "text-signal-red hover:bg-signal-red/10"
                        : "text-amber-400 hover:bg-amber/10"
                    }
                  `}
                >
                  Go
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              {/* Separator between items */}
              {idx < items.length - 1 && (
                <span className="w-px h-4 bg-current opacity-20 ml-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss alert"
        className={`
          flex-shrink-0 p-1 rounded-md
          transition-all duration-150
          ${
            critical
              ? "hover:bg-signal-red/20 text-signal-red"
              : "hover:bg-amber/20 text-amber-400"
          }
        `}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
