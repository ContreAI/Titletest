"use client";

import {
  CheckCircle2,
  Circle,
  Lock,
  AlertTriangle,
  Clock,
  Loader2,
  FileSignature,
  Upload,
  Download,
  DollarSign,
  ClipboardCheck,
  Edit3,
  ChevronRight,
  Info,
} from "lucide-react";
import { TransactionTask, PortalActionType } from "@/types";
import { getActionLabel, getActionButtonVariant } from "@/stores/taskStore";
import { Button, Badge } from "@/components/common";

interface BuyerTaskRowProps {
  task: TransactionTask;
  onAction?: (task: TransactionTask) => void;
  onDependencyClick?: (taskId: string) => void;
  dependencyLabels?: Record<string, string>; // taskId -> task title for tooltip
}

const ACTION_ICONS: Record<PortalActionType, React.ComponentType<{ className?: string }>> = {
  acknowledge: ClipboardCheck,
  download: Download,
  upload: Upload,
  upload_pay: DollarSign,
  e_sign: FileSignature,
  review_approve: ClipboardCheck,
  upload_form: Edit3,
};

function StatusIcon({ status }: { status: TransactionTask["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-fern flex-shrink-0" />;
    case "action_required":
      return (
        <div className="relative flex-shrink-0">
          <Circle className="w-5 h-5 text-spruce" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-spruce rounded-full animate-pulse" />
        </div>
      );
    case "overdue":
      return <AlertTriangle className="w-5 h-5 text-signal-red flex-shrink-0" />;
    case "in_review":
      return <Loader2 className="w-5 h-5 text-sea-glass animate-spin flex-shrink-0" />;
    case "locked":
      return <Lock className="w-5 h-5 text-[var(--text-disabled)] flex-shrink-0" />;
    default:
      return <Circle className="w-5 h-5 text-[var(--text-disabled)] flex-shrink-0" />;
  }
}

function getRowStyles(status: TransactionTask["status"]): string {
  switch (status) {
    case "overdue":
      return "bg-signal-red-50/50 border-l-[3px] border-l-signal-red";
    case "action_required":
      return "bg-paper hover:bg-elevation1 border-l-[3px] border-l-spruce";
    case "in_review":
      return "bg-paper hover:bg-elevation1 border-l-[3px] border-l-sea-glass";
    case "completed":
      return "bg-paper opacity-75 border-l-[3px] border-l-fern";
    case "locked":
      return "bg-elevation1/50 opacity-60 border-l-[3px] border-l-transparent";
    default:
      return "bg-paper border-l-[3px] border-l-transparent";
  }
}

export default function BuyerTaskRow({
  task,
  onAction,
  onDependencyClick,
  dependencyLabels = {},
}: BuyerTaskRowProps) {
  const ActionIcon = ACTION_ICONS[task.portalAction];
  const actionLabel = getActionLabel(task.portalAction);
  const buttonVariant = getActionButtonVariant(task.portalAction);
  const isActionable =
    task.status === "action_required" || task.status === "overdue";
  const isLocked = task.status === "locked";
  const isCompleted = task.status === "completed";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${getRowStyles(
        task.status
      )}`}
    >
      {/* Status icon */}
      <StatusIcon status={task.status} />

      {/* Task ID */}
      <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-disabled)] w-8 flex-shrink-0">
        {task.id}
      </span>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium leading-snug ${
              isCompleted
                ? "text-[var(--text-tertiary)] line-through"
                : isLocked
                  ? "text-[var(--text-disabled)]"
                  : "text-[var(--text-primary)]"
            }`}
          >
            {task.title}
          </span>
        </div>

        {/* Lock explanation */}
        {isLocked && task.dependsOn.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Info className="w-3 h-3 text-[var(--text-disabled)]" />
            <span className="text-xs text-[var(--text-disabled)]">
              Unlocks when{" "}
              {task.dependsOn.map((depId, i) => (
                <span key={depId}>
                  {i > 0 && " + "}
                  <button
                    className="underline hover:text-spruce transition-colors"
                    onClick={() => onDependencyClick?.(depId)}
                  >
                    {dependencyLabels[depId] || depId}
                  </button>
                </span>
              ))}{" "}
              {task.dependsOn.length === 1 ? "is" : "are"} complete
            </span>
          </div>
        )}

        {/* Completed date */}
        {isCompleted && task.completedDate && (
          <span className="text-xs text-[var(--text-disabled)]">
            Completed {new Date(task.completedDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Due expression */}
      <span
        className={`text-xs font-[family-name:var(--font-mono)] flex-shrink-0 ${
          task.status === "overdue"
            ? "text-signal-red font-semibold"
            : "text-[var(--text-tertiary)]"
        }`}
      >
        {task.dueExpression}
      </span>

      {/* Who acts badge */}
      {task.whoActs !== "Buyer" && task.whoActs !== "Seller" && (
        <Badge variant="muted" size="sm">
          {task.whoActs}
        </Badge>
      )}

      {/* Action button */}
      {isActionable && (
        <Button
          variant={buttonVariant}
          size="sm"
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          onClick={() => onAction?.(task)}
          className="flex-shrink-0 active:scale-[0.97]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
