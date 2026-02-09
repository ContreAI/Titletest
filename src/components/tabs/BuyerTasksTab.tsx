"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button } from "@/components/common";
import BuyerTaskRow from "@/components/buyer/BuyerTaskRow";
import { TransactionTask, TaskStatus } from "@/types";
import { getTasksByPhase, getTaskCounts, getCompletionPercentage } from "@/stores/taskStore";

gsap.registerPlugin(useGSAP);

export interface BuyerTasksTabProps {
  tasks: TransactionTask[];
  onTaskAction?: (task: TransactionTask) => void;
}

type FilterOption = "all" | "action_required" | "overdue" | "in_review" | "completed" | "locked";

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "action_required", label: "Action Required" },
  { value: "overdue", label: "Overdue" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
  { value: "locked", label: "Locked" },
];

function PhaseSection({
  phaseNum,
  phaseName,
  tasks,
  allTasks,
  onTaskAction,
  onDependencyClick,
  defaultOpen,
}: {
  phaseNum: number;
  phaseName: string;
  tasks: TransactionTask[];
  allTasks: TransactionTask[];
  onTaskAction?: (task: TransactionTask) => void;
  onDependencyClick?: (taskId: string) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasOverdue = tasks.some((t) => t.status === "overdue");
  const hasActionRequired = tasks.some(
    (t) => t.status === "action_required" || t.status === "overdue"
  );

  // Build dependency label lookup
  const dependencyLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    allTasks.forEach((t) => {
      labels[t.id] = t.title;
    });
    return labels;
  }, [allTasks]);

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      {/* Phase header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-elevation1 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-disabled)]">
            Phase {phaseNum}
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {phaseName}
          </span>
          {hasOverdue && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-signal-red-50 text-signal-red">
              Overdue
            </span>
          )}
          {!hasOverdue && hasActionRequired && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-spruce/10 text-spruce">
              Action Needed
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
            {completed}/{total}
          </span>
          <div className="w-20 h-1.5 rounded-full bg-elevation2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct === 100 ? "bg-fern" : hasOverdue ? "bg-signal-red" : "bg-spruce"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </button>

      {/* Task rows */}
      {open && (
        <div ref={contentRef} className="border-t border-divider divide-y divide-divider/50">
          {tasks.map((task) => (
            <BuyerTaskRow
              key={task.id}
              task={task}
              onAction={onTaskAction}
              onDependencyClick={onDependencyClick}
              dependencyLabels={dependencyLabels}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default function BuyerTasksTab({ tasks, onTaskAction }: BuyerTasksTabProps) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 8,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.out",
    });
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filter !== "all") {
      result = result.filter((t) => t.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, filter, searchQuery]);

  // Group by phase
  const phaseGroups = useMemo(() => getTasksByPhase(filteredTasks), [filteredTasks]);

  // Overall stats
  const counts = useMemo(() => getTaskCounts(tasks), [tasks]);
  const completionPct = useMemo(() => getCompletionPercentage(tasks), [tasks]);

  // Scroll to a specific task (for dependency click)
  const handleDependencyClick = useCallback((taskId: string) => {
    const el = document.getElementById(`task-${taskId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Flash highlight
      el.classList.add("ring-2", "ring-spruce", "ring-offset-2");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-spruce", "ring-offset-2");
      }, 2000);
    }
  }, []);

  // Determine which phases have action items (auto-expand those)
  const phasesWithActions = useMemo(() => {
    const set = new Set<number>();
    tasks.forEach((t) => {
      if (t.status === "action_required" || t.status === "overdue") {
        set.add(t.phase);
      }
    });
    return set;
  }, [tasks]);

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Header with overall progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Your Tasks
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {counts.completed} of {counts.total} tasks complete ({completionPct}%)
            {counts.overdue > 0 && (
              <span className="text-signal-red font-medium">
                {" "}&middot; {counts.overdue} overdue
              </span>
            )}
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 rounded-full bg-elevation2 overflow-hidden">
            <div
              className="h-full rounded-full bg-fern transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-sm font-[family-name:var(--font-mono)] font-semibold text-fern">
            {completionPct}%
          </span>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-spruce/30 focus:border-spruce text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <Filter className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                filter === opt.value
                  ? "bg-spruce text-white"
                  : "bg-elevation1 text-[var(--text-tertiary)] hover:bg-elevation2 hover:text-[var(--text-primary)]"
              }`}
            >
              {opt.label}
              {opt.value !== "all" && (
                <span className="ml-1 opacity-75">
                  {opt.value === "action_required"
                    ? counts.actionRequired
                    : opt.value === "overdue"
                      ? counts.overdue
                      : opt.value === "in_review"
                        ? counts.inReview
                        : opt.value === "completed"
                          ? counts.completed
                          : counts.locked}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Phase sections */}
      {filteredTasks.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-fern/30" />
            <p className="text-sm text-[var(--text-tertiary)]">
              {searchQuery
                ? "No tasks match your search."
                : "No tasks in this category."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {Array.from(phaseGroups.entries())
            .sort(([a], [b]) => a - b)
            .map(([phaseNum, phaseTasks]) => (
              <PhaseSection
                key={phaseNum}
                phaseNum={phaseNum}
                phaseName={phaseTasks[0]?.phaseName || `Phase ${phaseNum}`}
                tasks={phaseTasks}
                allTasks={tasks}
                onTaskAction={onTaskAction}
                onDependencyClick={handleDependencyClick}
                defaultOpen={phasesWithActions.has(phaseNum)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
