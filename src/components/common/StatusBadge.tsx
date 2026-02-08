"use client";

import { HTMLAttributes } from "react";
import { TransactionStatus, ProcessingStatus, TimelineStatus, SigningStatus } from "@/types";

type StatusType = TransactionStatus | ProcessingStatus | TimelineStatus | SigningStatus | "not_uploaded";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  showDot?: boolean;
  size?: "sm" | "md";
}

const statusConfig: Record<
  StatusType,
  { label: string; variant: string; dotColor: string }
> = {
  // Transaction Status
  pending: {
    label: "Pending",
    variant: "bg-amber/10 text-amber",
    dotColor: "bg-amber",
  },
  in_progress: {
    label: "In Progress",
    variant: "bg-river-stone/10 text-river-stone",
    dotColor: "bg-river-stone",
  },
  closing_scheduled: {
    label: "Closing Scheduled",
    variant: "bg-spruce/10 text-spruce",
    dotColor: "bg-spruce",
  },
  closed: {
    label: "Closed",
    variant: "bg-fern/10 text-fern",
    dotColor: "bg-fern",
  },
  cancelled: {
    label: "Cancelled",
    variant: "bg-signal-red/10 text-signal-red",
    dotColor: "bg-signal-red",
  },

  // Processing Status
  processing: {
    label: "Processing",
    variant: "bg-amber/10 text-amber",
    dotColor: "bg-amber",
  },
  processed: {
    label: "Processed",
    variant: "bg-fern/10 text-fern",
    dotColor: "bg-fern",
  },
  failed: {
    label: "Failed",
    variant: "bg-signal-red/10 text-signal-red",
    dotColor: "bg-signal-red",
  },

  // Timeline Status
  complete: {
    label: "Done",
    variant: "bg-fern/10 text-fern",
    dotColor: "bg-fern",
  },
  upcoming: {
    label: "Upcoming",
    variant: "bg-amber/10 text-amber",
    dotColor: "bg-amber",
  },
  overdue: {
    label: "Overdue",
    variant: "bg-signal-red/10 text-signal-red",
    dotColor: "bg-signal-red",
  },

  // Signing Status
  not_configured: {
    label: "Not Configured",
    variant: "bg-storm-gray/10 text-storm-gray",
    dotColor: "bg-storm-gray",
  },
  awaiting_selection: {
    label: "Select Time",
    variant: "bg-amber/10 text-amber",
    dotColor: "bg-amber",
  },
  requested: {
    label: "Requested",
    variant: "bg-river-stone/10 text-river-stone",
    dotColor: "bg-river-stone",
  },
  confirmed: {
    label: "Confirmed",
    variant: "bg-fern/10 text-fern",
    dotColor: "bg-fern",
  },
  completed: {
    label: "Completed",
    variant: "bg-fern/10 text-fern",
    dotColor: "bg-fern",
  },

  // Document Status
  not_uploaded: {
    label: "Not Uploaded",
    variant: "bg-storm-gray/10 text-storm-gray",
    dotColor: "bg-storm-gray",
  },
};

export default function StatusBadge({
  status,
  showDot = true,
  size = "sm",
  className = "",
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.variant} ${sizes[size]} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${
            status === "upcoming" || status === "processing"
              ? "animate-pulse"
              : ""
          }`}
        />
      )}
      {config.label}
    </span>
  );
}
