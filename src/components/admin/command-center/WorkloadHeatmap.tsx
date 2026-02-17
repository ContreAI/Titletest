"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/common";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkloadEmployee {
  id: string;
  name: string;
  role: string;
  activeCount: number;
  closingThisWeek: number;
}

export interface WorkloadHeatmapProps {
  employees: WorkloadEmployee[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBarColor(count: number): string {
  if (count > 60) return "bg-signal-red";
  if (count > 50) return "bg-amber-500";
  return "bg-royal";
}

function getCountColor(count: number): string {
  if (count > 60) return "text-signal-red";
  if (count > 50) return "text-amber-400";
  return "text-[var(--text-primary)]";
}

function getRoleBadgeVariant(
  role: string
): "default" | "success" | "warning" | "error" | "info" | "muted" {
  switch (role.toLowerCase()) {
    case "admin":
      return "error";
    case "closer":
      return "default";
    case "processor":
      return "info";
    default:
      return "muted";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkloadHeatmap({ employees }: WorkloadHeatmapProps) {
  // Sort by activeCount descending for visual impact
  const sorted = useMemo(
    () => [...employees].sort((a, b) => b.activeCount - a.activeCount),
    [employees]
  );

  const maxCount = useMemo(
    () => Math.max(1, ...sorted.map((e) => e.activeCount)),
    [sorted]
  );

  return (
    <Card>
      <CardHeader
        title="Team Workload"
        subtitle={`${employees.length} team member${employees.length !== 1 ? "s" : ""}`}
        action={
          <Users className="w-5 h-5 text-[var(--text-tertiary)]" />
        }
      />

      <div className="mt-4 space-y-3">
        {sorted.map((emp) => {
          const pct = Math.round((emp.activeCount / maxCount) * 100);
          const barColor = getBarColor(emp.activeCount);
          const countColor = getCountColor(emp.activeCount);

          return (
            <div key={emp.id} className="group">
              {/* Name row */}
              <div className="flex items-center gap-2 mb-1.5">
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sea-glass to-royal-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold text-storm-gray">
                    {emp.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>

                <span className="text-sm font-medium text-[var(--text-primary)] truncate flex-1 min-w-0">
                  {emp.name}
                </span>

                <Badge variant={getRoleBadgeVariant(emp.role)} size="sm">
                  {emp.role}
                </Badge>
              </div>

              {/* Bar row */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-5 bg-elevation1 rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full rounded-full ${barColor}
                      transition-all duration-500 ease-out
                    `}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>

                {/* Count */}
                <span
                  className={`
                    font-[family-name:var(--font-mono)] text-sm font-semibold
                    min-w-[36px] text-right
                    ${countColor}
                  `}
                >
                  {emp.activeCount}
                </span>
              </div>

              {/* Closing this week hint */}
              {emp.closingThisWeek > 0 && (
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 ml-8">
                  {emp.closingThisWeek} closing{emp.closingThisWeek !== 1 ? "s" : ""} this week
                </p>
              )}
            </div>
          );
        })}

        {employees.length === 0 && (
          <div className="text-center py-6 text-sm text-[var(--text-tertiary)]">
            No team members to display.
          </div>
        )}
      </div>
    </Card>
  );
}
