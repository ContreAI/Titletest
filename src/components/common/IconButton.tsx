"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  label: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "md",
      label,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      default:
        "text-river-stone hover:text-storm-gray hover:bg-sea-glass/20 focus-visible:ring-sea-glass",
      ghost:
        "text-storm-gray/60 hover:text-storm-gray hover:bg-mist focus-visible:ring-sea-glass",
      danger:
        "text-river-stone hover:text-signal-red hover:bg-signal-red/10 focus-visible:ring-signal-red",
    };

    const sizes = {
      sm: "p-1.5",
      md: "p-2",
      lg: "p-2.5",
    };

    const iconSizes = {
      sm: "[&>svg]:w-4 [&>svg]:h-4",
      md: "[&>svg]:w-5 [&>svg]:h-5",
      lg: "[&>svg]:w-6 [&>svg]:h-6",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${iconSizes[size]} ${className}`}
        aria-label={label}
        title={label}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
