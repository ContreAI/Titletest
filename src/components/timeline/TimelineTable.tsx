"use client";

import { Check, Clock, AlertCircle, Target, Circle } from "lucide-react";
import { TimelineEvent } from "@/types";

export interface TimelineTableProps {
  events: TimelineEvent[];
}

export default function TimelineTable({ events }: TimelineTableProps) {
  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getStatusIcon = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "complete":
        return <Check className="w-4 h-4 text-fern" />;
      case "upcoming":
        return <Clock className="w-4 h-4 text-amber animate-pulse" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-signal-red" />;
      default:
        return <Circle className="w-4 h-4 text-river-stone" />;
    }
  };

  const getStatusLabel = (event: TimelineEvent) => {
    switch (event.status) {
      case "complete":
        return (
          <span className="inline-flex items-center gap-1.5 text-fern text-sm">
            <Check className="w-3.5 h-3.5" />
            Done
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 text-amber text-sm">
            <Clock className="w-3.5 h-3.5" />
            {event.daysRemaining} days
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1.5 text-signal-red text-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-river-stone text-sm">
            <Circle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  const getRowBackground = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-amber/5";
      case "overdue":
        return "bg-signal-red/5";
      default:
        return "";
    }
  };

  return (
    <div className="bg-paper rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-mist">
            <th className="px-4 py-3 text-left text-xs font-semibold text-river-stone uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-river-stone uppercase tracking-wider">
              Event
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-river-stone uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-river-stone uppercase tracking-wider hidden md:table-cell">
              Days
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-river-stone uppercase tracking-wider hidden lg:table-cell">
              Source
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedEvents.map((event, index) => {
            const isLast = index === sortedEvents.length - 1;

            return (
              <tr
                key={event.id}
                className={`${getRowBackground(event.status)} hover:bg-mist/50 transition-colors`}
              >
                {/* Date */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        event.status === "complete"
                          ? "bg-fern"
                          : event.status === "upcoming"
                          ? "bg-amber"
                          : event.status === "overdue"
                          ? "bg-signal-red"
                          : "bg-river-stone/30"
                      }`}
                    />
                    <span className="font-mono text-sm text-storm-gray">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </td>

                {/* Event Title */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isLast && <Target className="w-4 h-4 text-spruce" />}
                    <span
                      className={`text-sm ${
                        isLast
                          ? "font-semibold text-spruce"
                          : "text-storm-gray"
                      }`}
                    >
                      {event.title}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-river-stone mt-0.5">
                      {event.description}
                    </p>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">{getStatusLabel(event)}</td>

                {/* Days Remaining */}
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  {event.status !== "complete" && event.daysRemaining !== undefined ? (
                    <span
                      className={`font-mono text-sm ${
                        event.status === "overdue"
                          ? "text-signal-red"
                          : event.status === "upcoming"
                          ? "text-amber"
                          : "text-river-stone"
                      }`}
                    >
                      {event.daysRemaining}
                    </span>
                  ) : (
                    <span className="text-sm text-river-stone">--</span>
                  )}
                </td>

                {/* Source */}
                <td className="px-4 py-3 text-right hidden lg:table-cell">
                  {event.source ? (
                    <span className="text-xs text-river-stone">
                      {event.source.document} {event.source.section}
                    </span>
                  ) : (
                    <span className="text-xs text-river-stone">--</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
