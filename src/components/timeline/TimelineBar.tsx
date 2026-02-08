"use client";

import { TimelineEvent } from "@/types";
import { Check, AlertCircle, Target } from "lucide-react";

export interface TimelineBarProps {
  events: TimelineEvent[];
}

export default function TimelineBar({ events }: TimelineBarProps) {
  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getStatusIcon = (status: TimelineEvent["status"], isLast: boolean) => {
    if (isLast) {
      return (
        <div className="w-4 h-4 rounded-full bg-spruce flex items-center justify-center">
          <Target className="w-2.5 h-2.5 text-white" />
        </div>
      );
    }

    switch (status) {
      case "complete":
        return (
          <div className="w-4 h-4 rounded-full bg-fern flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        );
      case "upcoming":
        return (
          <div className="w-4 h-4 rounded-full border-2 border-spruce bg-paper animate-pulse" />
        );
      case "overdue":
        return (
          <div className="w-4 h-4 rounded-full bg-signal-red flex items-center justify-center">
            <AlertCircle className="w-2.5 h-2.5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-river-stone bg-paper" />
        );
    }
  };

  const getLineColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "complete":
        return "bg-fern";
      case "upcoming":
        return "bg-spruce";
      default:
        return "bg-river-stone/30";
    }
  };

  return (
    <div className="bg-paper rounded-lg border border-border p-6 overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Timeline Track */}
        <div className="relative flex items-center justify-between">
          {/* Background Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-river-stone/20" />

          {/* Progress Line */}
          {sortedEvents.map((event, index) => {
            if (index === sortedEvents.length - 1) return null;

            const progress =
              event.status === "complete"
                ? 100
                : event.status === "upcoming"
                ? 50
                : 0;

            return (
              <div
                key={`line-${event.id}`}
                className="absolute h-0.5"
                style={{
                  left: `${(index / (sortedEvents.length - 1)) * 100}%`,
                  width: `${(1 / (sortedEvents.length - 1)) * 100}%`,
                }}
              >
                <div
                  className={`h-full ${getLineColor(event.status)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            );
          })}

          {/* Event Points */}
          {sortedEvents.map((event, index) => {
            const isLast = index === sortedEvents.length - 1;

            return (
              <div
                key={event.id}
                className="relative flex flex-col items-center z-10"
              >
                {/* Status Icon */}
                {getStatusIcon(event.status, isLast)}

                {/* Event Label */}
                <div className="absolute top-6 text-center whitespace-nowrap">
                  <p className="text-xs font-medium text-storm-gray">
                    {event.title.length > 12
                      ? event.title.substring(0, 12) + "..."
                      : event.title}
                  </p>
                  <p className="text-xs text-river-stone">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Spacer for labels */}
        <div className="h-16" />
      </div>
    </div>
  );
}
