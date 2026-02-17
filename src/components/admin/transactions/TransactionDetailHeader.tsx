"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  DollarSign,
  MapPin,
  MessageSquare,
  Upload,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button, Badge } from "@/components/common";
import { PIPELINE_STAGES, type PipelineStage } from "@/types/admin";

gsap.registerPlugin(useGSAP);

interface TransactionDetailHeaderProps {
  transaction: {
    id: string;
    property: {
      address: string;
      city: string;
      state: string;
      zip: string;
    };
    buyerNames: string[];
    sellerNames: string[];
    financials: {
      purchasePrice: number;
    };
    pipelineStage: string;
    priority: string;
    assignedCloserName?: string;
    dates: {
      closingDate: string;
    };
  };
  onStageChange?: (stage: string) => void;
  onBack?: () => void;
}

// --- Helpers ---

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDaysUntilClosing(closingDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closing = new Date(closingDate);
  closing.setHours(0, 0, 0, 0);
  return Math.ceil(
    (closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function formatClosingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const PRIORITY_CONFIG: Record<
  string,
  { variant: "default" | "success" | "warning" | "error" | "info" | "muted"; label: string }
> = {
  low: { variant: "muted", label: "Low" },
  normal: { variant: "info", label: "Normal" },
  high: { variant: "warning", label: "High" },
  urgent: { variant: "error", label: "Urgent" },
};

const STAGE_OPTIONS = Object.entries(PIPELINE_STAGES)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([key, value]) => ({ key, label: value.label }));

// --- Main Component ---

export default function TransactionDetailHeader({
  transaction,
  onStageChange,
  onBack,
}: TransactionDetailHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);

  const daysUntil = useMemo(
    () => getDaysUntilClosing(transaction.dates.closingDate),
    [transaction.dates.closingDate]
  );

  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil <= 3 && daysUntil >= 0;

  const priorityConfig = PRIORITY_CONFIG[transaction.priority] ?? PRIORITY_CONFIG.normal;

  const currentStageLabel =
    PIPELINE_STAGES[transaction.pipelineStage as PipelineStage]?.label ??
    transaction.pipelineStage;

  // GSAP entrance
  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.from(containerRef.current, {
        y: -12,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div
      ref={containerRef}
      className="bg-paper border-b border-divider px-6 py-4"
    >
      {/* Top row: back button + address + actions */}
      <div className="flex items-start gap-4">
        {/* Back button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-1 p-2 rounded-lg hover:bg-elevation1 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Address block */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[var(--text-primary)] truncate">
            {transaction.property.address}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[var(--text-disabled)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              {transaction.property.city}, {transaction.property.state}{" "}
              {transaction.property.zip}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload Doc
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
          >
            Send Message
          </Button>
        </div>
      </div>

      {/* Detail row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Buyer -> Seller */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--text-primary)] font-medium truncate max-w-[180px]">
            {transaction.buyerNames.join(", ") || "TBD"}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-disabled)] flex-shrink-0" />
          <span className="text-[var(--text-primary)] font-medium truncate max-w-[180px]">
            {transaction.sellerNames.join(", ") || "TBD"}
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-divider hidden sm:block" />

        {/* Purchase price */}
        <div className="flex items-center gap-1.5 text-sm">
          <DollarSign className="w-3.5 h-3.5 text-[var(--text-disabled)]" />
          <span className="font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
            {formatCurrency(transaction.financials.purchasePrice)}
          </span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-divider hidden sm:block" />

        {/* Pipeline stage dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-royal/10 text-royal text-xs font-semibold
              hover:bg-royal/20 transition-colors"
          >
            {currentStageLabel}
            {onStageChange && <ChevronDown className="w-3 h-3" />}
          </button>
          {stageDropdownOpen && onStageChange && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStageDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-20 bg-paper border border-divider rounded-lg shadow-[var(--shadow-3)] py-1 min-w-[160px]">
                {STAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      onStageChange(opt.key);
                      setStageDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-elevation1 transition-colors
                      ${opt.key === transaction.pipelineStage ? "text-royal font-semibold" : "text-[var(--text-primary)]"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Priority badge */}
        <Badge variant={priorityConfig.variant} size="sm">
          {priorityConfig.label}
        </Badge>

        {/* Divider */}
        <div className="h-5 w-px bg-divider hidden sm:block" />

        {/* Assigned closer */}
        {transaction.assignedCloserName && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-sea-glass to-royal-200 rounded-full flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
              <span className="text-[10px] font-semibold text-storm-gray">
                {getInitials(transaction.assignedCloserName)}
              </span>
            </div>
            <span className="text-[var(--text-secondary)]">
              {transaction.assignedCloserName}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="h-5 w-px bg-divider hidden sm:block" />

        {/* Closing date */}
        <div className="flex items-center gap-1.5 text-sm">
          <Calendar className="w-3.5 h-3.5 text-[var(--text-disabled)]" />
          <span
            className={`font-medium font-[family-name:var(--font-mono)] ${
              isOverdue
                ? "text-signal-red"
                : isUrgent
                  ? "text-amber-400"
                  : "text-[var(--text-primary)]"
            }`}
          >
            {formatClosingDate(transaction.dates.closingDate)}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-semibold font-[family-name:var(--font-mono)] ${
              isOverdue
                ? "bg-signal-red/10 text-signal-red-400"
                : isUrgent
                  ? "bg-amber/10 text-amber-400"
                  : "bg-elevation2 text-[var(--text-tertiary)]"
            }`}
          >
            {isOverdue
              ? `${Math.abs(daysUntil)}d overdue`
              : daysUntil === 0
                ? "Today"
                : `${daysUntil}d`}
          </span>
        </div>
      </div>
    </div>
  );
}
