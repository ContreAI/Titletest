"use client";

import { DocumentActionStatus, WaitingOn } from "@/types";

interface DocumentActionBadgeProps {
  status: DocumentActionStatus;
  waitingOn?: WaitingOn;
  size?: "sm" | "md";
}

const statusConfig: Record<
  DocumentActionStatus,
  { label: string; className: string }
> = {
  sign_required: {
    label: "Sign",
    className: "bg-amber/10 text-amber-700 border-amber/20",
  },
  review_required: {
    label: "Review",
    className: "bg-spruce/10 text-spruce border-spruce/20",
  },
  upload_needed: {
    label: "Upload Needed",
    className: "bg-river-stone/10 text-river-stone border-river-stone/20",
  },
  complete: {
    label: "Complete",
    className: "bg-fern/10 text-fern border-fern/20",
  },
  pending_from_title: {
    label: "Waiting on Title",
    className: "bg-spruce/10 text-spruce border-spruce/20",
  },
  pending_from_lender: {
    label: "Waiting on Lender",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const waitingOnLabels: Record<WaitingOn, string> = {
  title: "Title",
  lender: "Lender",
  buyer: "Buyer",
  seller: "Seller",
  agent: "Agent",
};

export default function DocumentActionBadge({
  status,
  waitingOn,
  size = "sm",
}: DocumentActionBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  // If waiting on a party, show that instead
  if (waitingOn && status !== "complete") {
    return (
      <span
        className={`
          inline-flex items-center rounded-full border font-medium
          ${sizeClasses}
          bg-river-stone/10 text-river-stone border-river-stone/20
        `}
      >
        Waiting: {waitingOnLabels[waitingOn]}
      </span>
    );
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${sizeClasses}
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}
