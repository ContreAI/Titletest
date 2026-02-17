"use client";

import { useRef } from "react";
import { DollarSign, ChevronRight, Info } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card } from "@/components/common";
import { NetProceedsEstimate } from "@/types";

gsap.registerPlugin(useGSAP);

interface NetProceedsCardProps {
  estimate: NetProceedsEstimate;
  onViewBreakdown?: () => void;
  compact?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function NetProceedsCard({
  estimate,
  onViewBreakdown,
  compact = false,
}: NetProceedsCardProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate the big number counting up
  useGSAP(() => {
    if (!valueRef.current || !containerRef.current) return;

    // Container entrance
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 12,
      duration: 0.5,
      ease: "power2.out",
    });

    // Counter animation
    const obj = { val: 0 };
    gsap.to(obj, {
      val: estimate.estimatedNet,
      duration: 1.2,
      ease: "power2.out",
      snap: { val: 100 }, // Snap to nearest $100
      onUpdate: () => {
        if (valueRef.current) {
          valueRef.current.textContent = formatCurrency(obj.val);
        }
      },
    });
  }, [estimate.estimatedNet]);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-fern/10 border border-fern/20">
        <DollarSign className="w-3.5 h-3.5 text-fern" />
        <span className="text-sm font-semibold font-[family-name:var(--font-mono)] text-fern-400">
          {formatCurrency(estimate.estimatedNet)}
        </span>
        <span className="text-xs text-fern-400">est. net</span>
      </div>
    );
  }

  // Top 3 deductions for the mini-summary
  const topDeductions = [...estimate.deductions]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 3);

  return (
    <div ref={containerRef}>
      <Card variant="elevated" padding="lg" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-fern/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-fern" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Your Estimated Net Proceeds
          </h3>
        </div>

        {/* Big number */}
        <div className="mb-5">
          <span
            ref={valueRef}
            className="text-[40px] leading-none font-bold font-[family-name:var(--font-mono)] text-fern"
          >
            {formatCurrency(0)}
          </span>
        </div>

        {/* Mini breakdown */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Purchase Price</span>
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              {formatCurrency(estimate.purchasePrice)}
            </span>
          </div>

          {topDeductions.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">{item.label}</span>
              <span className="font-[family-name:var(--font-mono)] text-signal-red-400">
                -{formatCurrency(Math.abs(item.amount))}
              </span>
            </div>
          ))}

          {estimate.deductions.length > 3 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-disabled)] italic">
                +{estimate.deductions.length - 3} more deductions
              </span>
              <span className="font-[family-name:var(--font-mono)] text-signal-red-400">
                -{formatCurrency(
                  Math.abs(
                    estimate.totalDeductions -
                      topDeductions.reduce((sum, d) => sum + Math.abs(d.amount), 0)
                  )
                )}
              </span>
            </div>
          )}

          {/* Divider and net */}
          <div className="border-t border-divider pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Estimated Net
              </span>
              <span className="text-lg font-bold font-[family-name:var(--font-mono)] text-fern">
                {formatCurrency(estimate.estimatedNet)}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 mb-4">
          <Info className="w-3.5 h-3.5 text-[var(--text-disabled)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--text-disabled)] leading-relaxed">
            {estimate.disclaimer}
          </p>
        </div>

        {/* CTA */}
        {onViewBreakdown && (
          <button
            onClick={onViewBreakdown}
            className="flex items-center gap-1 text-sm font-medium text-royal hover:text-royal-700 transition-colors"
          >
            View Full Breakdown
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </Card>
    </div>
  );
}
