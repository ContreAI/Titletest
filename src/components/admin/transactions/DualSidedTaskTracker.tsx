"use client";

import { useState, useMemo, useRef } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Circle,
  Eye,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Users,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardHeader } from "@/components/common";
import type { TransactionTask, TaskStatus } from "@/types";

gsap.registerPlugin(useGSAP);

interface DualSidedTaskTrackerProps {
  buyerTasks: TransactionTask[];
  sellerTasks: TransactionTask[];
  onTaskClick?: (task: TransactionTask) => void;
}

// --- Status config ---

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    icon: typeof CheckCircle2;
    iconClass: string;
    rowClass: string;
    label: string;
  }
> = {
  completed: {
    icon: CheckCircle2,
    iconClass: "text-fern",
    rowClass: "bg-fern-50/60 dark:bg-fern-950/20",
    label: "Completed",
  },
  overdue: {
    icon: AlertTriangle,
    iconClass: "text-signal-red",
    rowClass:
      "bg-signal-red-50 dark:bg-signal-red-950/20 border-l-[3px] border-l-signal-red",
    label: "Overdue",
  },
  action_required: {
    icon: Clock,
    iconClass: "text-amber-600",
    rowClass: "bg-amber-50/60 dark:bg-amber-950/20",
    label: "Action Required",
  },
  in_review: {
    icon: Eye,
    iconClass: "text-sea-glass-600",
    rowClass: "bg-sea-glass-50/60 dark:bg-sea-glass-950/20",
    label: "In Review",
  },
  not_started: {
    icon: Circle,
    iconClass: "text-[var(--text-disabled)]",
    rowClass: "",
    label: "Not Started",
  },
  locked: {
    icon: Lock,
    iconClass: "text-[var(--text-disabled)]",
    rowClass: "opacity-50",
    label: "Locked",
  },
};

// --- Helpers ---

function groupByPhase(tasks: TransactionTask[]) {
  const grouped: Record<
    number,
    { phaseName: string; tasks: TransactionTask[] }
  > = {};
  for (const task of tasks) {
    if (!grouped[task.phase]) {
      grouped[task.phase] = { phaseName: task.phaseName, tasks: [] };
    }
    grouped[task.phase].tasks.push(task);
  }
  // Sort tasks within each phase by order
  for (const key of Object.keys(grouped)) {
    grouped[Number(key)].tasks.sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
  }
  return grouped;
}

function countCompleted(tasks: TransactionTask[]) {
  return tasks.filter((t) => t.status === "completed").length;
}

// --- Sub-components ---

function TaskRow({
  task,
  onTaskClick,
}: {
  task: TransactionTask;
  onTaskClick?: (task: TransactionTask) => void;
}) {
  const config = STATUS_CONFIG[task.status];
  const StatusIcon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onTaskClick?.(task)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
        hover:bg-elevation1 active:scale-[0.99] cursor-pointer ${config.rowClass}`}
    >
      <StatusIcon className={`w-4 h-4 flex-shrink-0 ${config.iconClass}`} />
      <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-tertiary)] w-10 flex-shrink-0">
        {task.id}
      </span>
      <span
        className={`text-sm flex-1 min-w-0 truncate ${
          task.status === "locked"
            ? "text-[var(--text-disabled)]"
            : "text-[var(--text-primary)]"
        }`}
      >
        {task.title}
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-elevation2 text-[var(--text-tertiary)] flex-shrink-0 font-medium">
        {task.whoActs}
      </span>
      <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0 w-24 text-right font-[family-name:var(--font-mono)]">
        {task.dueExpression}
      </span>
    </button>
  );
}

function PhaseGroup({
  phase,
  phaseName,
  tasks,
  onTaskClick,
  defaultOpen,
}: {
  phase: number;
  phaseName: string;
  tasks: TransactionTask[];
  onTaskClick?: (task: TransactionTask) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const completed = countCompleted(tasks);
  const hasOverdue = tasks.some((t) => t.status === "overdue");
  const hasAction = tasks.some((t) => t.status === "action_required");

  return (
    <div className="border border-divider rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-elevation1 hover:bg-elevation2 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
        )}
        <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-disabled)]">
          P{phase}
        </span>
        <span className="text-sm font-semibold text-[var(--text-primary)] flex-1 text-left">
          {phaseName}
        </span>
        {hasOverdue && (
          <span className="w-2 h-2 rounded-full bg-signal-red flex-shrink-0" />
        )}
        {hasAction && !hasOverdue && (
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
        )}
        <span className="text-xs text-[var(--text-tertiary)] font-[family-name:var(--font-mono)]">
          {completed}/{tasks.length}
        </span>
      </button>
      {open && (
        <div className="p-1.5 space-y-0.5">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </div>
      )}
    </div>
  );
}

function SideColumn({
  side,
  tasks,
  onTaskClick,
}: {
  side: "buyer" | "seller";
  tasks: TransactionTask[];
  onTaskClick?: (task: TransactionTask) => void;
}) {
  const completed = countCompleted(tasks);
  const total = tasks.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  const grouped = groupByPhase(tasks);
  const phases = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  // Determine which phases should be open by default (in-progress ones)
  const firstIncomplete = phases.find((p) => {
    const phaseTasks = grouped[p].tasks;
    return (
      phaseTasks.some((t) => t.status !== "completed") &&
      phaseTasks.some((t) => t.status !== "locked" && t.status !== "not_started")
    );
  });

  return (
    <div className="flex-1 min-w-0">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
            {side === "buyer" ? "Buyer" : "Seller"} Tasks
          </h3>
          <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-secondary)]">
            {completed}/{total}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-elevation2 rounded-full overflow-hidden">
          <div
            className="h-full bg-spruce rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Phase groups */}
      <div className="space-y-2">
        {phases.map((phase) => (
          <PhaseGroup
            key={phase}
            phase={phase}
            phaseName={grouped[phase].phaseName}
            tasks={grouped[phase].tasks}
            onTaskClick={onTaskClick}
            defaultOpen={phase === firstIncomplete}
          />
        ))}
      </div>
    </div>
  );
}

// --- Cross-side dependency item ---

function DependencyRow({
  source,
  target,
  onTaskClick,
}: {
  source: TransactionTask;
  target: TransactionTask;
  onTaskClick?: (task: TransactionTask) => void;
}) {
  const sourceConfig = STATUS_CONFIG[source.status];
  const targetConfig = STATUS_CONFIG[target.status];
  const SourceIcon = sourceConfig.icon;
  const TargetIcon = targetConfig.icon;

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-elevation1 transition-colors text-sm">
      <button
        type="button"
        onClick={() => onTaskClick?.(source)}
        className="flex items-center gap-1.5 hover:underline cursor-pointer"
      >
        <SourceIcon className={`w-3.5 h-3.5 ${sourceConfig.iconClass}`} />
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-tertiary)]">
          {source.id}
        </span>
        <span className="text-[var(--text-primary)] truncate max-w-[160px]">
          {source.title}
        </span>
      </button>
      <span className="text-[var(--text-disabled)] flex items-center gap-1 flex-shrink-0 text-xs">
        blocks <ArrowRight className="w-3 h-3" />
      </span>
      <button
        type="button"
        onClick={() => onTaskClick?.(target)}
        className="flex items-center gap-1.5 hover:underline cursor-pointer"
      >
        <TargetIcon className={`w-3.5 h-3.5 ${targetConfig.iconClass}`} />
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-tertiary)]">
          {target.id}
        </span>
        <span className="text-[var(--text-primary)] truncate max-w-[160px]">
          {target.title}
        </span>
      </button>
    </div>
  );
}

// --- Main Component ---

export default function DualSidedTaskTracker({
  buyerTasks,
  sellerTasks,
  onTaskClick,
}: DualSidedTaskTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Build a lookup of all tasks by ID
  const taskMap = useMemo(() => {
    const map = new Map<string, TransactionTask>();
    for (const t of [...buyerTasks, ...sellerTasks]) {
      map.set(t.id, t);
    }
    return map;
  }, [buyerTasks, sellerTasks]);

  // Find cross-side dependencies: buyer tasks that block seller tasks and vice versa
  const crossDeps = useMemo(() => {
    const deps: { source: TransactionTask; target: TransactionTask }[] = [];
    const allTasks = [...buyerTasks, ...sellerTasks];
    for (const task of allTasks) {
      for (const blockedId of task.blocks) {
        const blocked = taskMap.get(blockedId);
        if (blocked && blocked.side !== task.side) {
          deps.push({ source: task, target: blocked });
        }
      }
    }
    return deps;
  }, [buyerTasks, sellerTasks, taskMap]);

  // GSAP stagger entrance
  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.from(containerRef.current.querySelectorAll(".side-col"), {
        y: 16,
        opacity: 0,
        duration: 0.45,
        stagger: 0.12,
        ease: "power2.out",
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <Card variant="default" padding="lg" ref={containerRef}>
      <CardHeader
        title="Task Tracker"
        subtitle={`${countCompleted(buyerTasks) + countCompleted(sellerTasks)} of ${buyerTasks.length + sellerTasks.length} tasks completed`}
      />

      {/* Two-column layout */}
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <div className="side-col flex-1 min-w-0">
          <SideColumn
            side="buyer"
            tasks={buyerTasks}
            onTaskClick={onTaskClick}
          />
        </div>
        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-divider flex-shrink-0" />
        <div className="block lg:hidden h-px bg-divider" />
        <div className="side-col flex-1 min-w-0">
          <SideColumn
            side="seller"
            tasks={sellerTasks}
            onTaskClick={onTaskClick}
          />
        </div>
      </div>

      {/* Cross-Side Dependencies */}
      {crossDeps.length > 0 && (
        <div className="mt-6 pt-6 border-t border-divider">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)]" />
            Cross-Side Dependencies
            <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
              ({crossDeps.length})
            </span>
          </h4>
          <div className="space-y-0.5">
            {crossDeps.map((dep, i) => (
              <DependencyRow
                key={`${dep.source.id}-${dep.target.id}-${i}`}
                source={dep.source}
                target={dep.target}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
