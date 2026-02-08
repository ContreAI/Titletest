"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { WaitingOn, PartyStatus, PartyTaskItem, TabId } from "@/types";
import StatusBoardCard from "./StatusBoardCard";
import { Button } from "@/components/common";

interface StatusBoardProps {
  partyStatuses: PartyStatus[];
  userParty: "buyer" | "seller"; // Which side the current user is on
  onItemClick?: (item: PartyTaskItem, targetTab: TabId) => void;
  onItemComplete?: (item: PartyTaskItem) => void;
  onExportClick?: () => void;
}

const partyOrder: WaitingOn[] = ["title", "lender", "buyer", "seller", "agent"];

export default function StatusBoard({
  partyStatuses,
  userParty,
  onItemClick,
  onItemComplete,
  onExportClick,
}: StatusBoardProps) {
  const [expandedParty, setExpandedParty] = useState<WaitingOn | null>(null);

  // Sort statuses by the defined order
  const sortedStatuses = [...partyStatuses].sort(
    (a, b) => partyOrder.indexOf(a.party) - partyOrder.indexOf(b.party)
  );

  const totalPending = partyStatuses.reduce((sum, ps) => sum + ps.pendingCount, 0);
  const totalCompleted = partyStatuses.reduce((sum, ps) => sum + ps.completedCount, 0);

  const handleItemClick = (item: PartyTaskItem) => {
    onItemClick?.(item, item.category as TabId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-storm-gray">Status Board</h2>
          <p className="text-sm text-river-stone">
            {totalPending === 0
              ? `All ${totalCompleted} items complete`
              : `${totalPending} pending • ${totalCompleted} complete`}
          </p>
        </div>
        {onExportClick && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Package className="w-4 h-4" />}
            onClick={onExportClick}
          >
            Export
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sortedStatuses.map((status) => {
          // Users can only mark items complete for their own party
          const canEdit = status.party === userParty;

          return (
            <StatusBoardCard
              key={status.party}
              party={status.party}
              label={status.label}
              pendingCount={status.pendingCount}
              completedCount={status.completedCount}
              pendingItems={status.pendingItems}
              completedItems={status.completedItems}
              isExpanded={expandedParty === status.party}
              onToggle={() =>
                setExpandedParty(
                  expandedParty === status.party ? null : status.party
                )
              }
              onItemClick={handleItemClick}
              onItemComplete={onItemComplete}
              canEdit={canEdit}
            />
          );
        })}
      </div>
    </div>
  );
}
