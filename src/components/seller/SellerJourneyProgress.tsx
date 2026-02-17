"use client";

import { useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card } from "@/components/common";
import { TaskPhaseProgress } from "@/types";

gsap.registerPlugin(useGSAP);

interface SellerJourneyProgressProps {
  phases: TaskPhaseProgress[];
}

function PhaseRow({
  phase,
  isLast,
  index,
}: {
  phase: TaskPhaseProgress;
  isLast: boolean;
  index: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!rowRef.current) return;
    gsap.from(rowRef.current, {
      opacity: 0,
      x: -12,
      duration: 0.4,
      delay: index * 0.08,
      ease: "power2.out",
    });
  }, []);

  const isComplete = phase.status === "complete";
  const isInProgress = phase.status === "in_progress";
  const isUpcoming = phase.status === "upcoming" || phase.status === "locked";

  // Subtitle text
  let subtitle = "";
  if (isComplete) {
    subtitle = `${phase.completed} of ${phase.total} tasks done`;
  } else if (isInProgress) {
    if (phase.overdue > 0) {
      subtitle = `${phase.completed}/${phase.total} done, ${phase.overdue} overdue`;
    } else {
      subtitle = `${phase.completed} of ${phase.total} tasks done`;
    }
  }

  return (
    <div ref={rowRef} className="flex gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        {/* Node */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isComplete
              ? "bg-fern text-white"
              : isInProgress
                ? "bg-royal text-white"
                : "bg-elevation2 border-2 border-divider"
          }`}
        >
          {isComplete ? (
            <Check className="w-4 h-4" />
          ) : isInProgress ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[var(--text-disabled)]" />
          )}
        </div>

        {/* Connector line */}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[24px] transition-colors duration-500 ${
              isComplete ? "bg-fern" : "bg-divider"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className={`pb-4 ${isLast ? "" : ""}`}>
        <span
          className={`text-sm font-medium leading-none ${
            isComplete
              ? "text-[var(--text-primary)]"
              : isInProgress
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-disabled)]"
          }`}
        >
          {phase.phaseName}
        </span>
        {subtitle && (
          <p
            className={`text-xs mt-0.5 ${
              phase.overdue > 0
                ? "text-signal-red"
                : isComplete
                  ? "text-fern"
                  : "text-[var(--text-tertiary)]"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SellerJourneyProgress({
  phases,
}: SellerJourneyProgressProps) {
  return (
    <Card variant="default" padding="md">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
        Your Progress
      </h3>
      <div className="flex flex-col">
        {phases.map((phase, i) => (
          <PhaseRow
            key={phase.phase}
            phase={phase}
            isLast={i === phases.length - 1}
            index={i}
          />
        ))}
      </div>
    </Card>
  );
}
