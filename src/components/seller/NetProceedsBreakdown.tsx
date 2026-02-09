"use client";

import { useRef } from "react";
import { Info, DollarSign } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card } from "@/components/common";
import { NetProceedsEstimate, NetProceedsLineItem } from "@/types";

gsap.registerPlugin(useGSAP);

interface NetProceedsBreakdownProps {
  estimate: NetProceedsEstimate;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_LABELS: Record<NetProceedsLineItem["category"], string> = {
  payoff: "Mortgage Payoffs",
  commission: "Commissions",
  fee: "Fees & Costs",
  proration: "Prorations",
  credit: "Credits",
};

export default function NetProceedsBreakdown({
  estimate,
}: NetProceedsBreakdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 8,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  // Group deductions by category
  const grouped = estimate.deductions.reduce(
    (acc, item) => {
      const group = acc[item.category] || [];
      group.push(item);
      acc[item.category] = group;
      return acc;
    },
    {} as Record<string, NetProceedsLineItem[]>
  );

  const categoryOrder: NetProceedsLineItem["category"][] = [
    "payoff",
    "commission",
    "fee",
    "proration",
    "credit",
  ];

  return (
    <div ref={containerRef}>
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-fern/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-fern" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Detailed Net Proceeds
          </h3>
        </div>

        {/* Sale Price */}
        <div className="flex justify-between text-sm mb-1 pb-3 border-b border-divider">
          <span className="font-semibold text-[var(--text-primary)]">
            Sale Price
          </span>
          <span className="font-bold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
            {formatCurrency(estimate.purchasePrice)}
          </span>
        </div>

        {/* Grouped deductions */}
        <div className="space-y-4 mt-4">
          {categoryOrder.map((category) => {
            const items = grouped[category];
            if (!items || items.length === 0) return null;

            const categoryTotal = items.reduce(
              (sum, item) => sum + Math.abs(item.amount),
              0
            );

            return (
              <div key={category}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
                    -{formatCurrency(categoryTotal)}
                  </span>
                </div>

                <div className="space-y-1 ml-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--text-secondary)]">
                          {item.label}
                        </span>
                        {item.isEstimate && (
                          <span className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold">
                            est
                          </span>
                        )}
                        {item.tooltip && (
                          <div className="group relative">
                            <Info className="w-3 h-3 text-[var(--text-disabled)] cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-52 p-2 bg-elevation3 text-xs text-[var(--text-secondary)] rounded-lg shadow-[var(--shadow-2)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              {item.tooltip}
                            </div>
                          </div>
                        )}
                      </div>
                      <span
                        className={`font-[family-name:var(--font-mono)] ${
                          category === "credit"
                            ? "text-fern"
                            : "text-signal-red-600"
                        }`}
                      >
                        {category === "credit" ? "+" : "-"}
                        {formatCurrency(Math.abs(item.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="border-t-2 border-divider pt-3 mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-[var(--text-tertiary)]">
              Total Deductions
            </span>
            <span className="text-sm font-[family-name:var(--font-mono)] text-signal-red-600">
              -{formatCurrency(Math.abs(estimate.totalDeductions))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-base font-bold text-[var(--text-primary)]">
              Estimated Net Proceeds
            </span>
            <span className="text-xl font-bold font-[family-name:var(--font-mono)] text-fern">
              {formatCurrency(estimate.estimatedNet)}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-1.5 mt-4">
          <Info className="w-3.5 h-3.5 text-[var(--text-disabled)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--text-disabled)] leading-relaxed">
            {estimate.disclaimer}
          </p>
        </div>
      </Card>
    </div>
  );
}
