"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/components/providers/ThemeProvider";

interface ThemeToggleProps {
  size?: "sm" | "md";
  className?: string;
}

export default function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useThemeContext();

  const sizes = {
    sm: "p-1.5 [&>svg]:w-4 [&>svg]:h-4",
    md: "p-2 [&>svg]:w-5 [&>svg]:h-5",
  };

  if (!mounted) {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-lg transition-all ${sizes[size]} text-[var(--text-tertiary)] ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <Sun />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-lg transition-all hover:bg-elevation1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sea-glass ${sizes[size]} text-[var(--text-tertiary)] hover:text-[var(--text-primary)] ${className}`}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </button>
  );
}
