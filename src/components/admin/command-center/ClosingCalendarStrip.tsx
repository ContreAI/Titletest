"use client";

import { useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminTransaction } from "@/types/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClosingCalendarStripProps {
  transactions: AdminTransaction[];
  onDayClick: (date: string) => void;
}

interface CalendarDay {
  /** ISO date string YYYY-MM-DD */
  dateISO: string;
  /** Day-of-month number */
  day: number;
  /** 3-letter weekday abbreviation */
  weekday: string;
  isToday: boolean;
  isWeekend: boolean;
  closingCount: number;
  hasTRIDRisk: boolean;
  closingTransactionIds: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Returns true if the closing is within 3 business days AND the closing
 * disclosure has not been sent (buyerCDStatus / sellerCDStatus still in
 * early stages).
 */
function isTRIDAtRisk(tx: AdminTransaction): boolean {
  if (!tx.tridCompliance) return false;
  const { isCompliant, daysRemaining, buyerCDStatus, sellerCDStatus } =
    tx.tridCompliance;

  if (isCompliant) return false;

  // CD not yet sent to at least one party while within 3-business-day window
  const cdNotSent =
    buyerCDStatus === "not_generated" ||
    buyerCDStatus === "generated" ||
    sellerCDStatus === "not_generated" ||
    sellerCDStatus === "generated";

  return daysRemaining <= 3 && cdNotSent;
}

function buildDays(
  transactions: AdminTransaction[],
  dayCount: number
): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  // Index closings by date
  const closingsByDate = new Map<
    string,
    { ids: string[]; hasTRIDRisk: boolean }
  >();

  for (const tx of transactions) {
    const closingISO = tx.dates.closingDate.slice(0, 10);
    const entry = closingsByDate.get(closingISO) ?? {
      ids: [],
      hasTRIDRisk: false,
    };
    entry.ids.push(tx.id);
    if (isTRIDAtRisk(tx)) entry.hasTRIDRisk = true;
    closingsByDate.set(closingISO, entry);
  }

  const days: CalendarDay[] = [];
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = toISODate(d);
    const dow = d.getDay();
    const entry = closingsByDate.get(iso);

    days.push({
      dateISO: iso,
      day: d.getDate(),
      weekday: WEEKDAYS[dow],
      isToday: iso === todayISO,
      isWeekend: dow === 0 || dow === 6,
      closingCount: entry?.ids.length ?? 0,
      hasTRIDRisk: entry?.hasTRIDRisk ?? false,
      closingTransactionIds: entry?.ids ?? [],
    });
  }

  return days;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClosingCalendarStrip({
  transactions,
  onDayClick,
}: ClosingCalendarStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => buildDays(transactions, 14), [transactions]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      {/* Scroll left button */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="
          absolute left-0 top-1/2 -translate-y-1/2 z-10
          w-7 h-7 rounded-full bg-paper border border-divider
          flex items-center justify-center
          shadow-[var(--shadow-1)]
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          hover:bg-elevation1
        "
      >
        <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>

      {/* Strip container */}
      <div
        ref={scrollRef}
        className="
          flex gap-1.5 overflow-x-auto scrollbar-none
          px-2 py-2
        "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {days.map((d) => (
          <button
            key={d.dateISO}
            onClick={() => onDayClick(d.dateISO)}
            className={`
              flex flex-col items-center justify-center
              min-w-[56px] w-14 py-2.5 rounded-lg
              transition-all duration-150 cursor-pointer
              border
              ${
                d.isToday
                  ? "ring-2 ring-royal ring-offset-1 ring-offset-[var(--bg-paper)] border-royal bg-royal/5"
                  : d.hasTRIDRisk
                    ? "bg-amber/10 border-amber/40"
                    : d.isWeekend
                      ? "bg-elevation1 border-divider/50 opacity-60"
                      : "bg-paper border-divider hover:bg-elevation1 hover:border-sea-glass"
              }
              active:scale-[0.97]
            `}
          >
            {/* Weekday abbreviation */}
            <span
              className={`
                text-[10px] font-semibold uppercase tracking-wide
                ${
                  d.isToday
                    ? "text-royal"
                    : d.hasTRIDRisk
                      ? "text-amber-400"
                      : "text-[var(--text-tertiary)]"
                }
              `}
            >
              {d.weekday}
            </span>

            {/* Date number */}
            <span
              className={`
                text-lg font-semibold leading-tight
                font-[family-name:var(--font-mono)]
                ${
                  d.isToday
                    ? "text-royal"
                    : d.hasTRIDRisk
                      ? "text-amber-400"
                      : "text-[var(--text-primary)]"
                }
              `}
            >
              {d.day}
            </span>

            {/* Closing indicators */}
            <div className="flex items-center gap-0.5 mt-1 min-h-[14px]">
              {d.closingCount > 0 && (
                <>
                  {/* Show up to 3 dots, then count */}
                  {d.closingCount <= 3 ? (
                    Array.from({ length: d.closingCount }).map((_, i) => (
                      <span
                        key={i}
                        className={`
                          w-1.5 h-1.5 rounded-full
                          ${
                            d.hasTRIDRisk
                              ? "bg-amber-500"
                              : "bg-royal"
                          }
                        `}
                      />
                    ))
                  ) : (
                    <>
                      <span
                        className={`
                          w-1.5 h-1.5 rounded-full
                          ${d.hasTRIDRisk ? "bg-amber-500" : "bg-royal"}
                        `}
                      />
                      <span
                        className={`
                          text-[10px] font-semibold
                          font-[family-name:var(--font-mono)]
                          ${
                            d.hasTRIDRisk
                              ? "text-amber-400"
                              : "text-royal"
                          }
                        `}
                      >
                        {d.closingCount}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Scroll right button */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="
          absolute right-0 top-1/2 -translate-y-1/2 z-10
          w-7 h-7 rounded-full bg-paper border border-divider
          flex items-center justify-center
          shadow-[var(--shadow-1)]
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          hover:bg-elevation1
        "
      >
        <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>
    </div>
  );
}
