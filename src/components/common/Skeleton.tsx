"use client";

import { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  animation = "pulse",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = "bg-sea-glass/30";

  const variants = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animations = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const defaultDimensions = {
    text: { width: "100%", height: "1em" },
    circular: { width: "40px", height: "40px" },
    rectangular: { width: "100%", height: "100px" },
  };

  const finalWidth = width ?? defaultDimensions[variant].width;
  const finalHeight = height ?? defaultDimensions[variant].height;

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${animations[animation]} ${className}`}
      style={{
        width: typeof finalWidth === "number" ? `${finalWidth}px` : finalWidth,
        height:
          typeof finalHeight === "number" ? `${finalHeight}px` : finalHeight,
        ...style,
      }}
      {...props}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-paper rounded-lg border border-border p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="30%" height={16} />
        </div>
        <Skeleton variant="rectangular" width={100} height={32} />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} />
      </div>
    </div>
  );
}

// Timeline Skeleton
export function TimelineSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width={12} height={12} />
          <Skeleton width={80} height={16} />
          <Skeleton width="40%" height={16} />
          <Skeleton width={60} height={20} />
        </div>
      ))}
    </div>
  );
}

// Document Card Skeleton
export function DocumentCardSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`bg-paper rounded-lg border border-border p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height={18} />
          <div className="flex items-center gap-2">
            <Skeleton width={80} height={20} />
            <Skeleton width={60} height={20} />
          </div>
        </div>
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  );
}
