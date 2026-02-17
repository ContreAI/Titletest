"use client";

import { useRef } from "react";
import { Info, Calculator } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card } from "@/components/common";

gsap.registerPlugin(useGSAP);

interface CashToCloseItem {
  id: string;
  label: string;
  amount: number;
  isDeduction?: boolean;
  isEstimate?: boolean;
  tooltip?: string;
}

interface CashToCloseCalculatorProps {
  purchasePrice: number;
  loanAmount: number;
  items: CashToCloseItem[];
  totalCashToClose: number;
  isFinalized: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CashToCloseCalculator({
  purchasePrice,
  loanAmount,
  items,
  totalCashToClose,
  isFinalized,
}: CashToCloseCalculatorProps) {
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

  return (
    <div ref={containerRef}>
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-royal/10 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-royal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Cash to Close
            </h3>
            {!isFinalized && (
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                Estimate
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {/* Purchase Price */}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Purchase Price</span>
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              {formatCurrency(purchasePrice)}
            </span>
          </div>

          {/* Loan Amount */}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Loan Amount</span>
            <span className="font-[family-name:var(--font-mono)] text-signal-red-400">
              -{formatCurrency(loanAmount)}
            </span>
          </div>

          {/* Down Payment */}
          <div className="flex justify-between text-sm border-t border-divider pt-2">
            <span className="text-[var(--text-secondary)] font-medium">Down Payment</span>
            <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)] font-medium">
              {formatCurrency(purchasePrice - loanAmount)}
            </span>
          </div>

          {/* Line items */}
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-[var(--text-secondary)]">{item.label}</span>
                {item.isEstimate && (
                  <span className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold">
                    est
                  </span>
                )}
                {item.tooltip && (
                  <div className="group relative">
                    <Info className="w-3 h-3 text-[var(--text-disabled)] cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-elevation3 text-xs text-[var(--text-secondary)] rounded-lg shadow-[var(--shadow-2)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {item.tooltip}
                    </div>
                  </div>
                )}
              </div>
              <span
                className={`font-[family-name:var(--font-mono)] ${
                  item.isDeduction
                    ? "text-signal-red-400"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {item.isDeduction ? "-" : ""}
                {formatCurrency(Math.abs(item.amount))}
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="border-t-2 border-divider pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Total Cash to Close
              </span>
              <span
                className={`text-lg font-bold font-[family-name:var(--font-mono)] ${
                  isFinalized ? "text-royal" : "text-amber-400"
                }`}
              >
                {formatCurrency(totalCashToClose)}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        {!isFinalized && (
          <div className="flex items-start gap-1.5 mt-4">
            <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-400 leading-relaxed">
              This is an estimate based on preliminary figures. Final amounts will be
              confirmed on the Closing Disclosure.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
