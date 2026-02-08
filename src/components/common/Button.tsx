"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      glow = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-hover-lift";

    const variants = {
      primary:
        "bg-spruce text-white hover:bg-spruce-600 focus-visible:ring-spruce shadow-[var(--shadow-0)]",
      secondary:
        "bg-river-stone text-white hover:bg-river-stone-600 focus-visible:ring-river-stone shadow-[var(--shadow-0)]",
      ghost:
        "bg-transparent text-[var(--text-primary)] hover:bg-elevation1 focus-visible:ring-sea-glass",
      outline:
        "bg-transparent text-[var(--text-primary)] border border-divider hover:bg-elevation1 focus-visible:ring-spruce",
      danger:
        "bg-signal-red text-white hover:bg-signal-red-600 focus-visible:ring-signal-red shadow-[var(--shadow-0)]",
      success:
        "bg-fern text-white hover:bg-fern-600 focus-visible:ring-fern shadow-[var(--shadow-0)]",
    };

    // Sizes matching ui-main button: fontSize 13px, fontWeight 600
    const sizes = {
      sm: "px-3 py-1.5 text-[13px] gap-1.5",
      md: "px-4 py-2 text-[13px] gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    const glowStyles = glow ? "ring-4 ring-spruce-400/20" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyles} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
