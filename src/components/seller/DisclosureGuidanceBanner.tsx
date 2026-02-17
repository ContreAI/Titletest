"use client";

import { useState } from "react";
import { AlertTriangle, X, HelpCircle } from "lucide-react";

interface DisclosureGuidanceBannerProps {
  onDismiss?: () => void;
}

export default function DisclosureGuidanceBanner({
  onDismiss,
}: DisclosureGuidanceBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="relative rounded-lg bg-amber/10 border-l-4 border-l-amber-500 p-4">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded hover:bg-amber/15 transition-colors"
        aria-label="Dismiss guidance banner"
      >
        <X className="w-4 h-4 text-amber-400" />
      </button>

      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber/15 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-amber-400" />
        </div>

        <div className="flex-1 pr-6">
          <h4 className="text-sm font-semibold text-amber-400 mb-1.5">
            Disclosure Guidance
          </h4>
          <ul className="text-sm text-amber-400 space-y-1">
            <li>
              <strong>Disclose everything you know.</strong> It is better to
              over-disclose than under-disclose.
            </li>
            <li>
              If you are unsure about something, mark it as{" "}
              <strong>&quot;Unknown&quot;</strong> — never mark &quot;No&quot; when
              you&apos;re uncertain.
            </li>
            <li>
              Your real estate agent can help you fill out these forms. Don&apos;t
              hesitate to ask questions.
            </li>
          </ul>

          <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              Failure to disclose known issues can result in legal liability after
              closing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
