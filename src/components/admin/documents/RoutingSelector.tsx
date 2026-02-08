"use client";

import { User, Users, Building2, Lock } from "lucide-react";
import { DocumentRouting } from "@/types/admin";
import { ROUTING_OPTIONS, getRoutingDescription } from "@/lib/documentRouting";

interface RoutingSelectorProps {
  value: DocumentRouting;
  onChange: (routing: DocumentRouting) => void;
  warning?: string;
  compact?: boolean;
}

const ROUTING_ICONS: Record<DocumentRouting, React.ComponentType<{ className?: string }>> = {
  buyer_only: User,
  seller_only: User,
  both: Users,
  internal: Lock,
};

const ROUTING_COLORS: Record<DocumentRouting, { bg: string; border: string; text: string }> = {
  buyer_only: {
    bg: "bg-spruce/10",
    border: "border-spruce",
    text: "text-spruce",
  },
  seller_only: {
    bg: "bg-amber/10",
    border: "border-amber",
    text: "text-amber",
  },
  both: {
    bg: "bg-sea-glass/20",
    border: "border-sea-glass",
    text: "text-storm-gray",
  },
  internal: {
    bg: "bg-river-stone/10",
    border: "border-river-stone",
    text: "text-river-stone",
  },
};

export function RoutingSelector({
  value,
  onChange,
  warning,
  compact = false,
}: RoutingSelectorProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as DocumentRouting)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-paper text-storm-gray focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce"
        >
          {ROUTING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
        {warning && (
          <p className="text-sm text-amber flex items-start gap-2">
            <span className="text-amber mt-0.5">⚠</span>
            {warning}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {ROUTING_OPTIONS.map((option) => {
          const Icon = ROUTING_ICONS[option.value];
          const colors = ROUTING_COLORS[option.value];
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                relative flex items-center gap-3 p-3 rounded-lg border-2 text-left
                transition-all duration-200
                ${isSelected ? `${colors.bg} ${colors.border}` : "border-border hover:border-sea-glass"}
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isSelected ? colors.bg : "bg-mist"}
                `}
              >
                <Icon
                  className={`w-4 h-4 ${isSelected ? colors.text : "text-river-stone"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium text-sm ${
                    isSelected ? colors.text : "text-storm-gray"
                  }`}
                >
                  {option.label}
                </h4>
                <p className="text-xs text-river-stone truncate">
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <div
                  className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                    option.value === "buyer_only"
                      ? "bg-spruce"
                      : option.value === "seller_only"
                      ? "bg-amber"
                      : option.value === "both"
                      ? "bg-sea-glass"
                      : "bg-river-stone"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Warning */}
      {warning && (
        <div className="flex items-start gap-2 p-3 bg-amber/10 border border-amber/30 rounded-lg">
          <span className="text-amber text-lg leading-none">⚠</span>
          <p className="text-sm text-storm-gray">{warning}</p>
        </div>
      )}

      {/* Preview */}
      <div className="text-sm text-river-stone">
        {getRoutingDescription(value)}
      </div>
    </div>
  );
}

// Badge version for displaying routing on document cards
export function RoutingBadge({ routing }: { routing: DocumentRouting }) {
  const colors = ROUTING_COLORS[routing];
  const labels: Record<DocumentRouting, string> = {
    buyer_only: "Buyer",
    seller_only: "Seller",
    both: "Both",
    internal: "Internal",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${colors.bg} ${colors.text}
      `}
    >
      {labels[routing]}
    </span>
  );
}
