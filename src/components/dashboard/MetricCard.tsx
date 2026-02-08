'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  trend?: 'up' | 'down';
  percentage?: number;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  iconColor = 'text-spruce',
  iconBg = 'bg-spruce/10',
  trend,
  percentage,
  className = '',
}: MetricCardProps) {
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div
      className={`bg-paper border border-divider rounded-lg p-[var(--card-padding)] min-h-[90px] h-full card-hover ${className}`}
    >
      <div className="flex flex-col justify-between h-full gap-2">
        {/* Header: Icon + Title */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
          >
            <span className={`[&>svg]:w-4 [&>svg]:h-4 ${iconColor}`}>{icon}</span>
          </div>
          <span className="text-sm text-[var(--text-tertiary)] font-medium truncate">
            {title}
          </span>
        </div>

        {/* Value + Trend */}
        <div className="flex items-end justify-between gap-2">
          <span className="mono-lg text-[var(--text-primary)]">{formattedValue}</span>

          {trend && percentage !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium chip-hover ${
                trend === 'up'
                  ? 'bg-fern-50 text-fern'
                  : 'bg-signal-red-50 text-signal-red'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
