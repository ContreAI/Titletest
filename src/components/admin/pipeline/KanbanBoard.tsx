"use client";

import { useState } from "react";
import { AdminTransaction, PipelineStage, PIPELINE_STAGES } from "@/types/admin";
import { TransactionCard } from "./TransactionCard";
import { usePipelineStore } from "@/stores/admin/pipelineStore";

interface KanbanBoardProps {
  transactionsByStage: Record<PipelineStage, AdminTransaction[]>;
}

// Define which stages to show in the kanban (exclude closed and cancelled by default)
const VISIBLE_STAGES: PipelineStage[] = [
  "new_pending",
  "title_work",
  "clear_to_close",
  "scheduled",
  "closed",
];

export function KanbanBoard({ transactionsByStage }: KanbanBoardProps) {
  const { moveTransaction, setDragState, draggedTransactionId, dropTargetStage } =
    usePipelineStore();
  const [localDraggedId, setLocalDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, transaction: AdminTransaction) => {
    e.dataTransfer.setData("transactionId", transaction.id);
    e.dataTransfer.effectAllowed = "move";
    setLocalDraggedId(transaction.id);
    setDragState(transaction.id, null);
  };

  const handleDragEnd = () => {
    setLocalDraggedId(null);
    setDragState(null, null);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropTargetStage !== stage) {
      setDragState(draggedTransactionId, stage);
    }
  };

  const handleDragLeave = () => {
    // Don't clear immediately to prevent flicker
  };

  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    const transactionId = e.dataTransfer.getData("transactionId");
    if (transactionId) {
      moveTransaction(transactionId, stage);
    }
    setDragState(null, null);
    setLocalDraggedId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-6 h-full">
      {VISIBLE_STAGES.map((stage) => {
        const stageInfo = PIPELINE_STAGES[stage];
        const transactions = transactionsByStage[stage] || [];
        const isDropTarget = dropTargetStage === stage;

        return (
          <div
            key={stage}
            className="flex-shrink-0 w-80 flex flex-col"
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-${stageInfo.color}`}
                  style={{ backgroundColor: getStageColor(stage) }}
                />
                <h3 className="font-semibold text-storm-gray">
                  {stageInfo.label}
                </h3>
                <span className="text-sm text-river-stone bg-mist px-2 py-0.5 rounded-full">
                  {transactions.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div
              className={`
                flex-1 rounded-xl p-2 overflow-y-auto
                transition-colors duration-200
                ${isDropTarget ? "bg-sea-glass/20 border-2 border-dashed border-sea-glass" : "bg-mist/50"}
              `}
            >
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`
                      transition-opacity duration-200
                      ${localDraggedId === transaction.id ? "opacity-50" : "opacity-100"}
                    `}
                  >
                    <TransactionCard
                      transaction={transaction}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="text-center py-8 text-river-stone text-sm">
                    No transactions
                  </div>
                )}

                {/* Drop indicator */}
                {isDropTarget && (
                  <div className="h-20 border-2 border-dashed border-sea-glass rounded-xl flex items-center justify-center text-sea-glass text-sm">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStageColor(stage: PipelineStage): string {
  const colors: Record<PipelineStage, string> = {
    new_pending: "#F59E0B", // amber
    title_work: "#78909C", // river-stone
    clear_to_close: "#9DBFBF", // sea-glass
    scheduled: "#264E36", // spruce
    closed: "#607D3B", // fern
    cancelled: "#CC0000", // signal-red
    on_hold: "#37474F", // storm-gray
  };
  return colors[stage];
}
