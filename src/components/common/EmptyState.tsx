"use client";

import { HTMLAttributes } from "react";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

// Matching ui-main EmptyState: dashed border, bg-elevation1, centered layout
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-lg border-2 border-dashed border-divider bg-elevation1 ${className}`}
      {...props}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-sea-glass-50 flex items-center justify-center mb-4 text-river-stone">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-tertiary)] max-w-sm mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
      {children}
    </div>
  );
}
