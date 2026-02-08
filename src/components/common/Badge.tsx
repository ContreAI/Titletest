"use client";

import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "muted";
  size?: "sm" | "md";
}

export default function Badge({
  className = "",
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full whitespace-nowrap";

  const variants = {
    default: "bg-spruce/10 text-spruce",
    success: "bg-fern/10 text-fern",
    warning: "bg-amber/10 text-amber",
    error: "bg-signal-red/10 text-signal-red",
    info: "bg-river-stone/10 text-river-stone",
    muted: "bg-storm-gray/10 text-storm-gray",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
