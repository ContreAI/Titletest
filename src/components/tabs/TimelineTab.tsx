"use client";

import { useState } from "react";
import { Calendar, Download, ExternalLink, ChevronDown } from "lucide-react";
import { Card, Button } from "@/components/common";
import { TimelineBar, TimelineTable } from "@/components/timeline";
import { Transaction } from "@/types";
import { mockTimelineEvents } from "@/data/mockData";
import {
  downloadICalFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateOffice365CalendarUrl,
} from "@/lib/calendar";

export interface TimelineTabProps {
  transaction: Transaction;
}

export default function TimelineTab({ transaction }: TimelineTabProps) {
  const [showOutlookOptions, setShowOutlookOptions] = useState(false);

  const handleExportGoogle = () => {
    // For Google Calendar, we open individual events since batch isn't supported via URL
    // Open the next upcoming event
    const upcomingEvents = mockTimelineEvents.filter(e => e.status !== "complete");
    const nextEvent = upcomingEvents[0] || mockTimelineEvents[0];
    const url = generateGoogleCalendarUrl(nextEvent, transaction);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleExportOutlookPersonal = () => {
    const upcomingEvents = mockTimelineEvents.filter(e => e.status !== "complete");
    const nextEvent = upcomingEvents[0] || mockTimelineEvents[0];
    const url = generateOutlookCalendarUrl(nextEvent, transaction);
    window.open(url, "_blank", "noopener,noreferrer");
    setShowOutlookOptions(false);
  };

  const handleExportOutlookWork = () => {
    const upcomingEvents = mockTimelineEvents.filter(e => e.status !== "complete");
    const nextEvent = upcomingEvents[0] || mockTimelineEvents[0];
    const url = generateOffice365CalendarUrl(nextEvent, transaction);
    window.open(url, "_blank", "noopener,noreferrer");
    setShowOutlookOptions(false);
  };

  const handleExportIcal = () => {
    downloadICalFile(mockTimelineEvents, transaction);
  };

  return (
    <div className="space-y-6">
      {/* Visual Timeline Bar */}
      <section>
        <h2 className="text-xl font-semibold text-storm-gray mb-4">
          Transaction Timeline
        </h2>
        <TimelineBar events={mockTimelineEvents} />
      </section>

      {/* Timeline Table */}
      <section>
        <h2 className="text-xl font-semibold text-storm-gray mb-4">
          All Dates & Deadlines
        </h2>
        <TimelineTable events={mockTimelineEvents} />
      </section>

      {/* Calendar Export */}
      <section>
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-spruce/10 text-spruce">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-storm-gray">
                  Export to Calendar
                </h3>
                <p className="text-sm text-river-stone">
                  Add all deadlines to your calendar
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportGoogle}
                rightIcon={<ExternalLink className="w-3 h-3" />}
              >
                Google Calendar
              </Button>

              {/* Outlook dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOutlookOptions(!showOutlookOptions)}
                  rightIcon={<ChevronDown className={`w-3 h-3 transition-transform ${showOutlookOptions ? "rotate-180" : ""}`} />}
                >
                  Outlook
                </Button>
                {showOutlookOptions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowOutlookOptions(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-paper border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                      <button
                        onClick={handleExportOutlookPersonal}
                        className="w-full px-4 py-2 text-sm text-left text-storm-gray hover:bg-mist transition-colors"
                      >
                        Outlook.com (Personal)
                      </button>
                      <button
                        onClick={handleExportOutlookWork}
                        className="w-full px-4 py-2 text-sm text-left text-storm-gray hover:bg-mist transition-colors"
                      >
                        Office 365 (Work)
                      </button>
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportIcal}
                leftIcon={<Download className="w-3 h-3" />}
              >
                Download .ics
              </Button>
            </div>
          </div>

          {/* Helper text */}
          <p className="mt-3 text-xs text-river-stone">
            Tip: Download the .ics file to import all dates at once into any calendar app
          </p>
        </Card>
      </section>
    </div>
  );
}
