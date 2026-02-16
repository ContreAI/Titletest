"use client";

import {
  Mail,
  FileText,
  Zap,
  Shield,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export interface AutomationEvent {
  id: string;
  type:
    | "email_sent"
    | "document_routed"
    | "wire_generated"
    | "payoff_requested"
    | "report_generated"
    | "notification";
  label: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "simulated";
  recipient?: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  {
    email_sent: Mail,
    document_routed: FileText,
    wire_generated: DollarSign,
    payoff_requested: Search,
    report_generated: Zap,
    notification: Shield,
  };

const STATUS_STYLES: Record<string, string> = {
  completed: "text-fern",
  pending: "text-amber-500",
  simulated: "text-sea-glass-700",
};

export interface AutomationLogProps {
  events: AutomationEvent[];
}

export default function AutomationLog({ events }: AutomationLogProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 mx-auto mb-2 text-[var(--text-disabled)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          No automation events yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const Icon = TYPE_ICONS[event.type] || Zap;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex items-start gap-3 relative">
            {/* Timeline connector */}
            {!isLast && (
              <div className="absolute left-[15px] top-[32px] bottom-[-12px] w-px bg-divider" />
            )}

            <div
              className={`p-1.5 rounded-full flex-shrink-0 ${
                event.status === "completed"
                  ? "bg-fern/10"
                  : event.status === "pending"
                    ? "bg-amber-50"
                    : "bg-sea-glass/10"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${STATUS_STYLES[event.status] || "text-[var(--text-secondary)]"}`}
              />
            </div>

            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {event.label}
                </p>
                {event.status === "completed" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-fern flex-shrink-0" />
                )}
                {event.status === "pending" && (
                  <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {event.description}
              </p>
              {event.recipient && (
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  {event.recipient}
                </p>
              )}
              <p className="text-xs text-[var(--text-disabled)] mt-1">
                {event.timestamp}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
