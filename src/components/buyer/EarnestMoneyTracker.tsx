"use client";

import { useRef } from "react";
import { Check, Clock, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card } from "@/components/common";
import { WireTracker } from "@/types";

gsap.registerPlugin(useGSAP);

interface EarnestMoneyTrackerProps {
  tracker: WireTracker;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function EarnestMoneyTracker({ tracker }: EarnestMoneyTrackerProps) {
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

  const currentStepIndex = tracker.steps.findIndex((s) => s.status === "active");
  const completedCount = tracker.steps.filter((s) => s.status === "completed").length;

  return (
    <div ref={containerRef}>
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            {tracker.type === "earnest_money" ? "Earnest Money" : "Closing Funds"}
          </h3>
          {tracker.totalAmount && (
            <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              {formatCurrency(tracker.totalAmount)}
            </span>
          )}
        </div>

        {/* Step tracker */}
        <div className="flex items-center gap-0">
          {tracker.steps.map((step, i) => {
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";
            const isPending = step.status === "pending";

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Node */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isCompleted
                        ? "bg-fern text-white"
                        : isActive
                          ? "bg-spruce text-white ring-4 ring-spruce/20"
                          : "bg-elevation2 border-2 border-divider"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : isActive ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-disabled)]">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 text-center max-w-[80px] leading-tight ${
                      isCompleted
                        ? "text-fern font-medium"
                        : isActive
                          ? "text-spruce font-medium"
                          : "text-[var(--text-disabled)]"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCompleted && step.completedDate && (
                    <span className="text-[10px] text-[var(--text-disabled)] font-[family-name:var(--font-mono)]">
                      {step.completedDate}
                    </span>
                  )}
                </div>

                {/* Connector */}
                {i < tracker.steps.length - 1 && (
                  <div className="flex-1 mx-2 mb-6">
                    <div
                      className={`h-0.5 rounded-full transition-colors duration-500 ${
                        isCompleted ? "bg-fern" : "bg-divider"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
