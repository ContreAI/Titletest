"use client";

import {
  Home,
  RefreshCw,
  Banknote,
  TrendingDown,
  Building,
  Landmark,
  ArrowLeftRight,
  Check,
} from "lucide-react";
import { TransactionType, TRANSACTION_TYPES } from "@/types/admin";

interface TransactionTypeSelectProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

const TYPE_ICONS: Record<TransactionType, React.ComponentType<{ className?: string }>> = {
  purchase: Home,
  refinance: RefreshCw,
  cash_sale: Banknote,
  short_sale: TrendingDown,
  new_construction: Building,
  commercial: Landmark,
  exchange_1031: ArrowLeftRight,
};

export function TransactionTypeSelect({ value, onChange }: TransactionTypeSelectProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {(Object.entries(TRANSACTION_TYPES) as [TransactionType, { label: string; description: string }][]).map(
        ([type, info]) => {
          const Icon = TYPE_ICONS[type];
          const isSelected = value === type;

          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className={`
                relative flex items-start gap-3 p-4 rounded-lg border-2 text-left
                transition-all duration-200
                ${
                  isSelected
                    ? "border-spruce bg-spruce/5"
                    : "border-border hover:border-sea-glass hover:bg-mist/50"
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-spruce rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Icon */}
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isSelected ? "bg-spruce/20" : "bg-mist"}
                `}
              >
                <Icon
                  className={`w-5 h-5 ${isSelected ? "text-spruce" : "text-river-stone"}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold ${
                    isSelected ? "text-spruce" : "text-storm-gray"
                  }`}
                >
                  {info.label}
                </h3>
                <p className="text-sm text-river-stone line-clamp-2">
                  {info.description}
                </p>
              </div>
            </button>
          );
        }
      )}
    </div>
  );
}

// Compact version for inline use
export function TransactionTypeSelectCompact({
  value,
  onChange,
}: TransactionTypeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TransactionType)}
      className="w-full px-3 py-2 border border-border rounded-lg bg-paper text-storm-gray focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce"
    >
      {(Object.entries(TRANSACTION_TYPES) as [TransactionType, { label: string; description: string }][]).map(
        ([type, info]) => (
          <option key={type} value={type}>
            {info.label}
          </option>
        )
      )}
    </select>
  );
}
