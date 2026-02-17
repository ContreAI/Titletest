"use client";

import { useRef } from "react";
import {
  ArrowRight,
  FileSignature,
  Upload,
  Download,
  CheckCircle,
  DollarSign,
  ClipboardCheck,
  Edit3,
  Lock,
  AlertTriangle,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button } from "@/components/common";
import { TransactionTask, PortalActionType } from "@/types";
import { getActionLabel } from "@/stores/taskStore";

gsap.registerPlugin(useGSAP);

interface NextActionHeroProps {
  task: TransactionTask | null;
  onAction?: (task: TransactionTask) => void;
}

const ACTION_ICONS: Record<PortalActionType, React.ComponentType<{ className?: string }>> = {
  acknowledge: CheckCircle,
  download: Download,
  upload: Upload,
  upload_pay: DollarSign,
  e_sign: FileSignature,
  review_approve: ClipboardCheck,
  upload_form: Edit3,
};

export default function NextActionHero({ task, onAction }: NextActionHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      ease: "power2.out",
    });
  }, [task?.id]);

  if (!task) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-14 h-14 rounded-full bg-fern/10 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-fern" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            You&apos;re all caught up!
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] max-w-sm">
            No tasks need your attention right now. We&apos;ll notify you when
            something comes up.
          </p>
        </div>
      </Card>
    );
  }

  const Icon = ACTION_ICONS[task.portalAction];
  const isOverdue = task.status === "overdue";
  const actionLabel = getActionLabel(task.portalAction);

  const accentColor = isOverdue ? "signal-red" : "royal";
  const bgAccent = isOverdue ? "bg-signal-red/5" : "bg-royal/5";
  const iconBg = isOverdue ? "bg-signal-red/10" : "bg-royal/10";
  const iconText = isOverdue ? "text-signal-red" : "text-royal";
  const borderAccent = isOverdue
    ? "border-l-signal-red"
    : "border-l-royal";

  return (
    <div ref={containerRef}>
      <Card
        variant="elevated"
        padding="none"
        className={`overflow-hidden border-l-4 ${borderAccent}`}
      >
        <div className={`p-5 ${bgAccent}`}>
          {/* Header row */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}
            >
              <Icon className={`w-6 h-6 ${iconText}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Label */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isOverdue ? "text-signal-red" : "text-royal"
                  }`}
                >
                  {isOverdue ? "Overdue" : "Your Next Step"}
                </span>
                {isOverdue && (
                  <AlertTriangle className="w-3.5 h-3.5 text-signal-red" />
                )}
                <span className="text-xs text-[var(--text-disabled)] font-[family-name:var(--font-mono)]">
                  {task.id}
                </span>
              </div>

              {/* Task title */}
              <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug mb-1">
                {task.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                {task.description}
              </p>

              {/* Who acts + due */}
              <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mb-4">
                <span>
                  Assigned to: <strong className="text-[var(--text-primary)]">{task.whoActs}</strong>
                </span>
                <span className="text-[var(--text-disabled)]">|</span>
                <span>
                  Due: <strong className="text-[var(--text-primary)]">{task.dueExpression}</strong>
                </span>
              </div>

              {/* Action button */}
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => onAction?.(task)}
                className="active:scale-[0.97]"
              >
                {actionLabel}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
