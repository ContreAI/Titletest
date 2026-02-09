import { create } from "zustand";
import {
  TransactionTask,
  TaskStatus,
  TaskPhaseProgress,
  PortalActionType,
} from "@/types";

// ============================================
// Task Store: Manages task state, dependencies,
// smart batching, and phase progress
// ============================================

interface TaskStoreState {
  // All tasks for the current transaction
  buyerTasks: TransactionTask[];
  sellerTasks: TransactionTask[];

  // Actions
  setBuyerTasks: (tasks: TransactionTask[]) => void;
  setSellerTasks: (tasks: TransactionTask[]) => void;
  completeTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Selectors (computed from state)
}

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  buyerTasks: [],
  sellerTasks: [],

  setBuyerTasks: (tasks) => set({ buyerTasks: tasks }),
  setSellerTasks: (tasks) => set({ sellerTasks: tasks }),

  completeTask: (taskId) => {
    const { buyerTasks, sellerTasks } = get();

    const updateTask = (tasks: TransactionTask[]) =>
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: "completed" as TaskStatus,
            completedDate: new Date().toISOString(),
          };
        }
        return task;
      });

    const updatedBuyer = updateTask(buyerTasks);
    const updatedSeller = updateTask(sellerTasks);

    // After completing a task, resolve dependencies to unlock downstream tasks
    set({
      buyerTasks: resolveDependencies(updatedBuyer, updatedSeller),
      sellerTasks: resolveDependencies(updatedSeller, updatedBuyer),
    });
  },

  updateTaskStatus: (taskId, status) => {
    const { buyerTasks, sellerTasks } = get();

    const updateTask = (tasks: TransactionTask[]) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      );

    set({
      buyerTasks: updateTask(buyerTasks),
      sellerTasks: updateTask(sellerTasks),
    });
  },
}));

// ============================================
// Dependency Resolution
// ============================================

/**
 * Resolves dependencies for a set of tasks. Unlocks tasks whose
 * prerequisites are all completed. Cross-side dependencies are
 * checked against the otherSideTasks array.
 */
function resolveDependencies(
  tasks: TransactionTask[],
  otherSideTasks: TransactionTask[]
): TransactionTask[] {
  const allTasks = [...tasks, ...otherSideTasks];
  const completedIds = new Set(
    allTasks.filter((t) => t.status === "completed").map((t) => t.id)
  );

  return tasks.map((task) => {
    // Skip tasks that are already completed or have no dependencies
    if (task.status === "completed") return task;
    if (task.dependsOn.length === 0) {
      // No dependencies — if locked, unlock to action_required
      if (task.status === "locked") {
        return { ...task, status: "action_required" as TaskStatus };
      }
      return task;
    }

    // Check if all dependencies are met
    const allDependenciesMet = task.dependsOn.every((depId) =>
      completedIds.has(depId)
    );

    if (allDependenciesMet && task.status === "locked") {
      return { ...task, status: "action_required" as TaskStatus };
    }

    if (!allDependenciesMet && task.status !== "locked") {
      // Task should be locked if dependencies aren't met
      // (only lock "not_started" tasks, not ones already in progress)
      if (task.status === "not_started") {
        return { ...task, status: "locked" as TaskStatus };
      }
    }

    return task;
  });
}

// ============================================
// Selector Utilities (pure functions)
// ============================================

/**
 * Get tasks filtered by side, with conditional tasks filtered
 * based on property flags
 */
export function getVisibleTasks(
  tasks: TransactionTask[],
  propertyFlags: Record<string, boolean>,
  isCommercial: boolean
): TransactionTask[] {
  return tasks.filter((task) => {
    // Filter commercial-only tasks
    if (task.isCommercialOnly && !isCommercial) return false;

    // Filter conditional tasks based on property flags
    if (task.isConditional && task.conditionKey) {
      return propertyFlags[task.conditionKey] === true;
    }

    return true;
  });
}

/**
 * Get phase progress for journey tracker visualization
 */
export function getPhaseProgress(
  tasks: TransactionTask[]
): TaskPhaseProgress[] {
  const phaseMap = new Map<number, TransactionTask[]>();

  tasks.forEach((task) => {
    const existing = phaseMap.get(task.phase) || [];
    existing.push(task);
    phaseMap.set(task.phase, existing);
  });

  const phases: TaskPhaseProgress[] = [];

  phaseMap.forEach((phaseTasks, phaseNum) => {
    const total = phaseTasks.length;
    const completed = phaseTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const overdue = phaseTasks.filter(
      (t) => t.status === "overdue"
    ).length;
    const inReview = phaseTasks.filter(
      (t) => t.status === "in_review"
    ).length;

    let status: TaskPhaseProgress["status"] = "upcoming";
    if (completed === total) {
      status = "complete";
    } else if (
      phaseTasks.some(
        (t) =>
          t.status === "action_required" ||
          t.status === "in_review" ||
          t.status === "overdue"
      )
    ) {
      status = "in_progress";
    } else if (phaseTasks.every((t) => t.status === "locked")) {
      status = "locked";
    }

    phases.push({
      phase: phaseNum,
      phaseName: phaseTasks[0]?.phaseName || `Phase ${phaseNum}`,
      total,
      completed,
      overdue,
      inReview,
      status,
    });
  });

  return phases.sort((a, b) => a.phase - b.phase);
}

/**
 * Get the single most urgent action item (for "Next Action" hero)
 */
export function getNextAction(
  tasks: TransactionTask[]
): TransactionTask | null {
  const actionable = tasks.filter(
    (t) => t.status === "action_required" || t.status === "overdue"
  );

  if (actionable.length === 0) return null;

  // Overdue first, then by phase order
  actionable.sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    if (a.phase !== b.phase) return a.phase - b.phase;
    return a.order - b.order;
  });

  return actionable[0];
}

/**
 * Get all action-required tasks sorted by urgency
 */
export function getActionRequired(
  tasks: TransactionTask[]
): TransactionTask[] {
  return tasks
    .filter(
      (t) => t.status === "action_required" || t.status === "overdue"
    )
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      if (a.phase !== b.phase) return a.phase - b.phase;
      return a.order - b.order;
    });
}

/**
 * Smart batching for seller Phase 1 (prevents Day 1 overwhelm)
 * Returns only the current tier of tasks to show
 */
export function getSmartBatchedTasks(
  tasks: TransactionTask[],
  side: "buyer" | "seller"
): TransactionTask[] {
  if (side !== "seller") return getActionRequired(tasks);

  const phase1Tasks = tasks.filter(
    (t) =>
      t.phase === 1 &&
      (t.status === "action_required" || t.status === "overdue")
  );
  const otherPhaseTasks = tasks.filter(
    (t) =>
      t.phase !== 1 &&
      (t.status === "action_required" || t.status === "overdue")
  );

  // Seller Phase 1 tiers:
  // Tier 1 (critical): S-01, S-02, S-05
  // Tier 2 (disclosures): S-03, S-04, S-06, S-07
  // Tier 3 (compliance): S-08, S-09, S-10
  const tier1Ids = new Set(["S-01", "S-02", "S-05"]);
  const tier2Ids = new Set(["S-03", "S-04", "S-06", "S-07"]);
  const tier3Ids = new Set(["S-08", "S-09", "S-10"]);

  const tier1 = phase1Tasks.filter((t) => tier1Ids.has(t.id));
  const tier2 = phase1Tasks.filter((t) => tier2Ids.has(t.id));
  const tier3 = phase1Tasks.filter((t) => tier3Ids.has(t.id));

  // Show current tier based on completion
  const tier1Complete = tasks
    .filter((t) => tier1Ids.has(t.id))
    .every((t) => t.status === "completed");
  const tier2Complete = tasks
    .filter((t) => tier2Ids.has(t.id))
    .every((t) => t.status === "completed");

  let currentBatch: TransactionTask[] = [];

  if (!tier1Complete) {
    currentBatch = tier1;
  } else if (!tier2Complete) {
    currentBatch = tier2;
  } else {
    currentBatch = tier3;
  }

  // Always include non-phase-1 action items
  return [...currentBatch, ...otherPhaseTasks].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    if (a.phase !== b.phase) return a.phase - b.phase;
    return a.order - b.order;
  });
}

/**
 * Get tasks grouped by phase for the Tasks tab
 */
export function getTasksByPhase(
  tasks: TransactionTask[]
): Map<number, TransactionTask[]> {
  const grouped = new Map<number, TransactionTask[]>();

  tasks.forEach((task) => {
    const existing = grouped.get(task.phase) || [];
    existing.push(task);
    grouped.set(task.phase, existing);
  });

  // Sort tasks within each phase by order
  grouped.forEach((phaseTasks, phase) => {
    grouped.set(
      phase,
      phaseTasks.sort((a, b) => a.order - b.order)
    );
  });

  return grouped;
}

/**
 * Get dependency chain for a locked task (for tooltip display)
 */
export function getDependencyChain(
  taskId: string,
  allTasks: TransactionTask[]
): TransactionTask[] {
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return [];

  return task.dependsOn
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter((t): t is TransactionTask => t !== undefined);
}

/**
 * Calculate overall completion percentage
 */
export function getCompletionPercentage(
  tasks: TransactionTask[]
): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Get task counts by status for metrics
 */
export function getTaskCounts(tasks: TransactionTask[]): {
  total: number;
  completed: number;
  actionRequired: number;
  overdue: number;
  inReview: number;
  locked: number;
  notStarted: number;
} {
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    actionRequired: tasks.filter((t) => t.status === "action_required").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    inReview: tasks.filter((t) => t.status === "in_review").length,
    locked: tasks.filter((t) => t.status === "locked").length,
    notStarted: tasks.filter((t) => t.status === "not_started").length,
  };
}

/**
 * Map PortalActionType to a human-readable action label
 */
export function getActionLabel(action: PortalActionType): string {
  const labels: Record<PortalActionType, string> = {
    acknowledge: "Acknowledge",
    download: "Download",
    upload: "Upload",
    upload_pay: "Upload & Pay",
    e_sign: "e-Sign",
    review_approve: "Review & Approve",
    upload_form: "Complete Form",
  };
  return labels[action];
}

/**
 * Map PortalActionType to a button variant
 */
export function getActionButtonVariant(
  action: PortalActionType
): "primary" | "secondary" | "outline" {
  switch (action) {
    case "e_sign":
    case "upload_pay":
      return "primary";
    case "review_approve":
    case "upload":
    case "upload_form":
      return "secondary";
    default:
      return "outline";
  }
}
