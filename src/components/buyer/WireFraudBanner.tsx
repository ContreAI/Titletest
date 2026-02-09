"use client";

import { ShieldAlert, X, Phone } from "lucide-react";
import { useState } from "react";

interface WireFraudBannerProps {
  dismissable?: boolean;
  compact?: boolean;
}

export default function WireFraudBanner({
  dismissable = false,
  compact = false,
}: WireFraudBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-signal-red-50 border border-signal-red-200 text-signal-red-700">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-medium">
          NEVER wire money based on emailed instructions. Always verify through the portal.
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg bg-signal-red-50 border border-signal-red-200 p-4">
      {dismissable && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1 rounded hover:bg-signal-red-100 transition-colors"
          aria-label="Dismiss wire fraud warning"
        >
          <X className="w-4 h-4 text-signal-red-500" />
        </button>
      )}

      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-signal-red-100 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-signal-red" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-signal-red-800 mb-1">
            Wire Fraud Prevention Notice
          </h4>
          <ul className="text-sm text-signal-red-700 space-y-1 mb-3">
            <li>
              <strong>NEVER</strong> send money based on instructions received
              via email. Criminals impersonate title companies.
            </li>
            <li>
              Always verify wire instructions through this secure portal or by
              calling us directly.
            </li>
            <li>
              We will <strong>NEVER</strong> change wiring instructions via
              email. If you receive such an email, call us immediately.
            </li>
          </ul>

          <div className="flex items-center gap-2 text-xs text-signal-red-600">
            <Phone className="w-3.5 h-3.5" />
            <span>
              Verify by phone:{" "}
              <strong className="font-[family-name:var(--font-mono)]">
                (208) 555-1000
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
