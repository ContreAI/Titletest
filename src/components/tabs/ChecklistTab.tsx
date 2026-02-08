"use client";

import { CheckSquare, Square, Clock } from "lucide-react";
import { Card, CardHeader } from "@/components/common";
import { Transaction, ChecklistCategory, WaitingOn } from "@/types";
import { mockChecklistItems } from "@/data/mockData";

export interface ChecklistTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

// Category display names
const categoryNames: Record<ChecklistCategory, string> = {
  contract_earnest_money: "Contract & Earnest Money",
  title: "Title",
  inspection_due_diligence: "Inspection & Due Diligence",
  financing: "Financing",
  closing_prep: "Closing Prep",
  closing: "Closing",
};

// Category order
const categoryOrder: ChecklistCategory[] = [
  "contract_earnest_money",
  "title",
  "inspection_due_diligence",
  "financing",
  "closing_prep",
  "closing",
];

// Waiting on badge styles
const waitingOnStyles: Record<WaitingOn, { bg: string; text: string; label: string }> = {
  title: { bg: "bg-spruce/10", text: "text-spruce", label: "Title" },
  lender: { bg: "bg-amber/10", text: "text-amber", label: "Lender" },
  agent: { bg: "bg-river-stone/10", text: "text-river-stone", label: "Agent" },
  buyer: { bg: "bg-fern/10", text: "text-fern", label: "Buyer" },
  seller: { bg: "bg-fern/10", text: "text-fern", label: "Seller" },
};

export default function ChecklistTab({ transaction, side }: ChecklistTabProps) {
  // Filter items relevant to this side
  const relevantItems = mockChecklistItems.filter(
    (item) => item.side === "both" || item.side === side
  );

  // Calculate completion stats
  const completedCount = relevantItems.filter((item) => item.complete).length;
  const totalCount = relevantItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Group items by category
  const groupedItems = categoryOrder.reduce((acc, category) => {
    const items = relevantItems
      .filter((item) => item.category === category)
      .sort((a, b) => a.order - b.order);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<ChecklistCategory, typeof relevantItems>);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader title="Progress Overview" />
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-river-stone">
              {completedCount} of {totalCount} items complete
            </span>
            <span className="text-sm font-semibold text-storm-gray font-mono">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-3 bg-mist rounded-full overflow-hidden">
            <div
              className="h-full bg-spruce rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Checklist Categories */}
      {categoryOrder.map((category) => {
        const items = groupedItems[category];
        if (!items || items.length === 0) return null;

        const categoryComplete = items.filter((i) => i.complete).length;
        const categoryTotal = items.length;

        return (
          <Card key={category}>
            <CardHeader
              title={categoryNames[category]}
              subtitle={`${categoryComplete} of ${categoryTotal} complete`}
            />
            <div className="mt-4 space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-mist/50 transition-colors"
                >
                  {/* Checkbox Icon */}
                  {item.complete ? (
                    <CheckSquare className="w-5 h-5 text-fern flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-river-stone flex-shrink-0" />
                  )}

                  {/* Title */}
                  <span
                    className={`flex-1 text-sm ${
                      item.complete
                        ? "text-river-stone line-through"
                        : "text-storm-gray"
                    }`}
                  >
                    {item.title}
                  </span>

                  {/* Waiting On Badge */}
                  {!item.complete && item.waitingOn && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        waitingOnStyles[item.waitingOn].bg
                      } ${waitingOnStyles[item.waitingOn].text}`}
                    >
                      <Clock className="w-3 h-3" />
                      Waiting on {waitingOnStyles[item.waitingOn].label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
