"use client";

import { useState, useRef } from "react";
import {
  Wrench,
  Check,
  X,
  MessageSquare,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button } from "@/components/common";
import { RepairRequest, RepairItem } from "@/types";

gsap.registerPlugin(useGSAP);

interface RepairNegotiationPanelProps {
  repairRequest: RepairRequest;
  onRespond?: (
    itemId: string,
    response: "accept" | "counter" | "decline",
    counterProposal?: string
  ) => void;
  onSubmitAll?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function RepairItemRow({
  item,
  onRespond,
}: {
  item: RepairItem;
  onRespond?: (
    itemId: string,
    response: "accept" | "counter" | "decline",
    counterProposal?: string
  ) => void;
}) {
  const [counterText, setCounterText] = useState(item.counterProposal || "");
  const [showCounter, setShowCounter] = useState(item.sellerResponse === "counter");

  const handleResponse = (response: "accept" | "counter" | "decline") => {
    if (response === "counter") {
      setShowCounter(true);
      return;
    }
    onRespond?.(item.id, response);
  };

  const handleSubmitCounter = () => {
    if (counterText.trim()) {
      onRespond?.(item.id, "counter", counterText.trim());
    }
  };

  const responseColor =
    item.sellerResponse === "accept"
      ? "border-l-fern"
      : item.sellerResponse === "counter"
        ? "border-l-amber-500"
        : item.sellerResponse === "decline"
          ? "border-l-signal-red"
          : "border-l-transparent";

  return (
    <div
      className={`p-3 rounded-lg bg-elevation1 border-l-[3px] ${responseColor} transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        <Wrench className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-primary)] leading-snug">
            {item.description}
          </p>

          {/* Cost estimate */}
          {(item.estimatedCostMin || item.estimatedCostMax) && (
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="w-3 h-3 text-[var(--text-disabled)]" />
              <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-tertiary)]">
                Est.{" "}
                {item.estimatedCostMin && item.estimatedCostMax
                  ? `${formatCurrency(item.estimatedCostMin)} - ${formatCurrency(item.estimatedCostMax)}`
                  : formatCurrency(item.estimatedCostMin || item.estimatedCostMax || 0)}
              </span>
            </div>
          )}

          {/* Response buttons (only if pending) */}
          {item.sellerResponse === "pending" && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => handleResponse("accept")}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-fern/10 text-fern hover:bg-fern/20 transition-colors"
              >
                <Check className="w-3 h-3" />
                Accept
              </button>
              <button
                onClick={() => handleResponse("counter")}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                Counter
              </button>
              <button
                onClick={() => handleResponse("decline")}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-signal-red-50 text-signal-red hover:bg-signal-red-100 transition-colors"
              >
                <X className="w-3 h-3" />
                Decline
              </button>
            </div>
          )}

          {/* Counter proposal input */}
          {showCounter && item.sellerResponse === "pending" && (
            <div className="mt-2 space-y-2">
              <textarea
                value={counterText}
                onChange={(e) => setCounterText(e.target.value)}
                placeholder="Describe your counter-proposal..."
                className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitCounter}
                  disabled={!counterText.trim()}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Counter
                </button>
                <button
                  onClick={() => setShowCounter(false)}
                  className="px-3 py-1 text-xs font-medium rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Response status badge */}
          {item.sellerResponse !== "pending" && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                  item.sellerResponse === "accept"
                    ? "bg-fern/10 text-fern"
                    : item.sellerResponse === "counter"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-signal-red-50 text-signal-red"
                }`}
              >
                {item.sellerResponse === "accept" && <Check className="w-3 h-3" />}
                {item.sellerResponse === "counter" && <MessageSquare className="w-3 h-3" />}
                {item.sellerResponse === "decline" && <X className="w-3 h-3" />}
                {item.sellerResponse === "accept"
                  ? "Accepted"
                  : item.sellerResponse === "counter"
                    ? "Countered"
                    : "Declined"}
              </span>
              {item.sellerResponse === "counter" && item.counterProposal && (
                <p className="text-xs text-amber-700 mt-1 italic">
                  &quot;{item.counterProposal}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RepairNegotiationPanel({
  repairRequest,
  onRespond,
  onSubmitAll,
}: RepairNegotiationPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 12,
      duration: 0.5,
      ease: "power2.out",
    });
  }, []);

  const totalItems = repairRequest.items.length;
  const respondedItems = repairRequest.items.filter(
    (i) => i.sellerResponse !== "pending"
  ).length;
  const allResponded = respondedItems === totalItems;

  // Total estimated cost range
  const totalMin = repairRequest.items.reduce(
    (sum, i) => sum + (i.estimatedCostMin || 0),
    0
  );
  const totalMax = repairRequest.items.reduce(
    (sum, i) => sum + (i.estimatedCostMax || 0),
    0
  );

  return (
    <div ref={containerRef}>
      <Card variant="default" padding="none" className="overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-elevation1 transition-colors"
        >
          <Wrench className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1 text-left">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Buyer Repair Request
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {totalItems} items &middot; Responded to {respondedItems}/{totalItems}
              {(totalMin > 0 || totalMax > 0) && (
                <span className="font-[family-name:var(--font-mono)]">
                  {" "}&middot; Est. {formatCurrency(totalMin)} - {formatCurrency(totalMax)}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Response deadline */}
            <span className="text-xs text-[var(--text-tertiary)]">
              Due {new Date(repairRequest.responseDueDate).toLocaleDateString()}
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
            )}
          </div>
        </button>

        {expanded && (
          <div className="border-t border-divider">
            {/* Neutral framing */}
            <div className="px-4 py-2 bg-elevation1/50">
              <p className="text-xs text-[var(--text-secondary)]">
                The buyer has requested the following repairs based on their
                inspection. You may accept, counter with an alternative, or decline
                each item individually.
              </p>
            </div>

            {/* Repair items */}
            <div className="p-4 space-y-2">
              {repairRequest.items.map((item) => (
                <RepairItemRow key={item.id} item={item} onRespond={onRespond} />
              ))}

              {/* Credit request (if any) */}
              {repairRequest.creditRequest && (
                <div className="p-3 rounded-lg bg-spruce/5 border border-spruce/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-spruce" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Credit Request:{" "}
                        <span className="font-[family-name:var(--font-mono)]">
                          {formatCurrency(repairRequest.creditRequest.amount)}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {repairRequest.creditRequest.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit all responses */}
            {allResponded && repairRequest.status === "pending" && (
              <div className="px-4 py-3 border-t border-divider bg-elevation1/30">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onSubmitAll}
                  className="w-full active:scale-[0.97]"
                >
                  Submit All Responses
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
