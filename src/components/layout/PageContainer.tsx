"use client";

import { HTMLAttributes } from "react";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function PageContainer({
  maxWidth = "xl",
  className = "",
  children,
  ...props
}: PageContainerProps) {
  const maxWidths = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`mx-auto px-4 md:px-6 py-6 ${maxWidths[maxWidth]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
