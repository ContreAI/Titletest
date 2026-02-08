"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Landmark,
  User,
  Users,
  Briefcase,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { WaitingOn, PartyTaskItem, DocumentCategory } from "@/types";

interface StatusBoardCardProps {
  party: WaitingOn;
  label: string;
  pendingCount: number;
  completedCount: number;
  pendingItems: PartyTaskItem[];
  completedItems: PartyTaskItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick?: (item: PartyTaskItem) => void;
  onItemComplete?: (item: PartyTaskItem) => void;
  canEdit?: boolean; // Whether the current user can mark items complete for this party
}

const partyIcons: Record<WaitingOn, React.ReactNode> = {
  title: <Building2 className="w-5 h-5" />,
  lender: <Landmark className="w-5 h-5" />,
  buyer: <User className="w-5 h-5" />,
  seller: <Users className="w-5 h-5" />,
  agent: <Briefcase className="w-5 h-5" />,
};

const partyColors: Record<WaitingOn, { bg: string; text: string; border: string }> = {
  title: { bg: "bg-spruce/10", text: "text-spruce", border: "border-spruce/20" },
  lender: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  buyer: { bg: "bg-amber/10", text: "text-amber-700", border: "border-amber/20" },
  seller: { bg: "bg-fern/10", text: "text-fern", border: "border-fern/20" },
  agent: { bg: "bg-river-stone/10", text: "text-river-stone", border: "border-river-stone/20" },
};

const categoryLabels: Record<DocumentCategory, string> = {
  contract: "Contract",
  title: "Title",
  financial: "Financial",
  closing: "Closing",
};

export default function StatusBoardCard({
  party,
  label,
  pendingCount,
  completedCount,
  pendingItems,
  completedItems,
  isExpanded,
  onToggle,
  onItemClick,
  onItemComplete,
  canEdit = false,
}: StatusBoardCardProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const colors = partyColors[party];
  const icon = partyIcons[party];
  const allComplete = pendingCount === 0;
  const totalCount = pendingCount + completedCount;

  return (
    <div
      className={`
        rounded-lg border transition-all
        ${allComplete ? "bg-mist border-border" : `${colors.bg} ${colors.border}`}
      `}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-3 text-left
          transition-colors rounded-lg
          ${!allComplete ? "hover:bg-paper/50" : "hover:bg-paper/30"}
        `}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className={`${allComplete ? "text-fern" : colors.text}`}>
            {allComplete ? <CheckCircle2 className="w-5 h-5" /> : icon}
          </div>
          <div>
            <div className={`font-medium ${allComplete ? "text-storm-gray" : "text-storm-gray"}`}>
              {label}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {allComplete ? (
                <span className="text-fern">All done</span>
              ) : (
                <>
                  <span className={colors.text}>{pendingCount} pending</span>
                  {completedCount > 0 && (
                    <span className="text-river-stone">• {completedCount} done</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {totalCount > 0 && (
          <ChevronRight
            className={`
              w-5 h-5 text-river-stone transition-transform
              ${isExpanded ? "rotate-90" : ""}
            `}
          />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && totalCount > 0 && (
        <div className="px-3 pb-3 space-y-2">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div className="space-y-1">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className={`
                    flex items-center gap-2 p-2 rounded-md border transition-colors
                    ${canEdit
                      ? "bg-paper border-border hover:border-spruce/30"
                      : "bg-elevation1 border-border/50"
                    }
                  `}
                >
                  {canEdit ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemComplete?.(item);
                      }}
                      className="shrink-0 text-river-stone hover:text-spruce transition-colors"
                      title="Mark as complete"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="shrink-0 text-river-stone/50">
                      <Circle className="w-4 h-4" />
                    </span>
                  )}
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={`
                      flex-1 text-left text-sm truncate transition-colors
                      ${canEdit
                        ? "text-storm-gray hover:text-spruce"
                        : "text-river-stone"
                      }
                    `}
                  >
                    {item.title}
                  </button>
                  <span className="text-xs text-river-stone shrink-0">
                    {categoryLabels[item.category]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Completed Items Toggle */}
          {completedItems.length > 0 && (
            <div className="pt-1">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-1 text-xs text-river-stone hover:text-storm-gray transition-colors"
              >
                {showCompleted ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>{completedItems.length} completed</span>
              </button>

              {showCompleted && (
                <div className="mt-1 space-y-1">
                  {completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-mist/50 rounded-md border border-border/50"
                    >
                      {canEdit ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemComplete?.(item);
                          }}
                          className="shrink-0 text-fern hover:text-river-stone transition-colors"
                          title="Mark as incomplete"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="shrink-0 text-fern">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                      <span className="flex-1 text-sm text-river-stone line-through truncate">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
