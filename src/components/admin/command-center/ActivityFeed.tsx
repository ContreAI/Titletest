"use client";

import { useRef } from "react";
import {
  FileUp,
  ArrowRightLeft,
  PenTool,
  FolderPlus,
  MessageCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, CardHeader } from "@/components/common";

gsap.registerPlugin(useGSAP);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityType =
  | "doc_upload"
  | "stage_change"
  | "signing_scheduled"
  | "new_transaction"
  | "message"
  | "task_completed";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  transactionAddress: string;
  timestamp: string;
  actorName: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
}

// ---------------------------------------------------------------------------
// Icon / color mapping
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  ActivityType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    bgColor: string;
  }
> = {
  doc_upload: {
    icon: FileUp,
    iconColor: "text-sea-glass",
    bgColor: "bg-sea-glass/10",
  },
  stage_change: {
    icon: ArrowRightLeft,
    iconColor: "text-royal",
    bgColor: "bg-royal/10",
  },
  signing_scheduled: {
    icon: PenTool,
    iconColor: "text-fern",
    bgColor: "bg-fern/10",
  },
  new_transaction: {
    icon: FolderPlus,
    iconColor: "text-amber-400",
    bgColor: "bg-amber/10",
  },
  message: {
    icon: MessageCircle,
    iconColor: "text-river-stone",
    bgColor: "bg-river-stone/10",
  },
  task_completed: {
    icon: CheckCircle2,
    iconColor: "text-fern",
    bgColor: "bg-fern/10",
  },
};

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------

function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP stagger animation on mount
  useGSAP(
    () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll("[data-feed-item]");
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef, dependencies: [activities] }
  );

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        subtitle={`${activities.length} event${activities.length !== 1 ? "s" : ""}`}
        action={
          <Activity className="w-5 h-5 text-[var(--text-tertiary)]" />
        }
      />

      {/* Scrollable feed */}
      <div
        ref={containerRef}
        className="mt-4 max-h-[400px] overflow-y-auto space-y-1 pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {activities.length === 0 && (
          <div className="text-center py-6 text-sm text-[var(--text-tertiary)]">
            No recent activity.
          </div>
        )}

        {activities.map((act) => {
          const cfg = TYPE_CONFIG[act.type];
          const Icon = cfg.icon;

          return (
            <div
              key={act.id}
              data-feed-item
              className="
                flex items-start gap-3 py-2.5 px-2
                rounded-lg
                hover:bg-elevation1 transition-colors duration-150
              "
              style={{ opacity: 0 }}
            >
              {/* Icon bubble */}
              <div
                className={`
                  flex-shrink-0 w-8 h-8 rounded-full
                  flex items-center justify-center
                  ${cfg.bgColor}
                `}
              >
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] leading-snug">
                  {act.description}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                  {act.transactionAddress}
                </p>
              </div>

              {/* Meta column */}
              <div className="flex-shrink-0 text-right">
                <p className="text-[11px] text-[var(--text-tertiary)] whitespace-nowrap">
                  {act.actorName}
                </p>
                <p className="text-[11px] text-[var(--text-disabled)] whitespace-nowrap font-[family-name:var(--font-mono)]">
                  {relativeTime(act.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
