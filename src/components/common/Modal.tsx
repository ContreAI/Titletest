"use client";

import { Fragment, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-storm-gray/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal Panel */}
          <div
            className={`relative w-full ${sizes[size]} bg-paper rounded-lg shadow-xl transform transition-all`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-storm-gray"
                >
                  {title}
                </h2>
                <IconButton
                  label="Close modal"
                  variant="ghost"
                  onClick={onClose}
                >
                  <X />
                </IconButton>
              </div>
            )}

            {/* Close button when no title */}
            {!title && (
              <div className="absolute top-4 right-4">
                <IconButton
                  label="Close modal"
                  variant="ghost"
                  onClick={onClose}
                >
                  <X />
                </IconButton>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-border bg-mist/50 rounded-b-lg">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
