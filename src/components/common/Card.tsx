"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      variant = "default",
      padding = "md",
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    // Aligned with ui-main: borderRadius: 2 = 8px = rounded-lg
    const baseStyles = "rounded-lg";

    const variants = {
      default: "bg-paper border border-divider",
      elevated: "bg-paper shadow-[var(--shadow-1)]",
      outlined: "bg-transparent border border-border-medium",
      glass: "glass rounded-lg",
      interactive: "bg-paper border border-divider card-hover cursor-pointer",
    };

    // Padding matching ui-main: cardPaddingSm=16px (p-4), cardPadding=24px (p-6)
    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    const hoverStyles = hover
      ? "card-hover cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;

// Card Header Component
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  className = "",
  title,
  subtitle,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 ${className}`}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Card Content Component
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className = "",
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Card Footer Component
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({
  className = "",
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`mt-4 pt-4 border-t border-divider flex items-center gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
