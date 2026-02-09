"use client";

import { AdminHeader } from "@/components/admin/layout";
import { Card } from "@/components/common";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Calendar"
        subtitle="Full calendar view of closings and milestones"
      />
      <div className="p-6">
        <Card variant="default" padding="lg">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-spruce/10 flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-spruce" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Calendar View
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-md">
              Full month/week calendar with closing appointments, signing windows,
              TRID deadlines, and milestone events. Coming soon.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
