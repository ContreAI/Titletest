"use client";

import { AlertTriangle, Calendar, FileText, Upload, PenTool, Link2, MessageCircle, ChevronRight } from "lucide-react";
import { Card, CardHeader, Button, StatusBadge } from "@/components/common";
import { Transaction } from "@/types";
import {
  mockDocuments,
  mockTimelineEvents,
  mockBuyerSide,
  formatDate,
  formatShortDate,
  calculateDaysRemaining,
} from "@/data/mockData";

export interface MainTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

export default function MainTab({ transaction, side }: MainTabProps) {
  // Get upcoming deadlines (next 4)
  const upcomingDeadlines = mockTimelineEvents
    .filter((evt) => evt.status !== "complete")
    .slice(0, 4);

  // Get recent documents (last 3)
  const recentDocuments = mockDocuments
    .filter((doc) => doc.processing.status === "processed")
    .slice(0, 3);

  // Calculate what needs attention
  const needsAttention: Array<{ id: string; message: string; icon: React.ReactNode; action?: string }> = [];

  // Check for signing not scheduled
  if (mockBuyerSide.signing.status === "awaiting_selection") {
    needsAttention.push({
      id: "signing",
      message: "Signing appointment not scheduled",
      icon: <PenTool className="w-4 h-4" />,
      action: "Schedule Now",
    });
  }

  // Check for deadlines within 7 days
  const urgentDeadlines = mockTimelineEvents.filter(
    (evt) => evt.status === "upcoming" && (evt.daysRemaining || 0) <= 7
  );
  if (urgentDeadlines.length > 0) {
    needsAttention.push({
      id: "deadlines",
      message: `${urgentDeadlines.length} deadline${urgentDeadlines.length > 1 ? "s" : ""} within 7 days`,
      icon: <Calendar className="w-4 h-4" />,
      action: "View Timeline",
    });
  }

  // Check for SkySlope not connected
  if (!mockBuyerSide.skyslope?.connected) {
    needsAttention.push({
      id: "skyslope",
      message: "Connect SkySlope to sync documents automatically",
      icon: <Link2 className="w-4 h-4" />,
      action: "Connect",
    });
  }

  return (
    <div className="space-y-6">
      {/* Needs Attention Section */}
      {needsAttention.length > 0 && (
        <Card className="border-l-4 border-l-amber bg-amber/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber/10 text-amber">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-storm-gray mb-3">
                Needs Attention
              </h3>
              <ul className="space-y-2">
                {needsAttention.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-storm-gray">
                      {item.icon}
                      <span>{item.message}</span>
                    </div>
                    {item.action && (
                      <Button variant="ghost" size="sm">
                        {item.action}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Coming Up */}
        <Card>
          <CardHeader
            title="Coming Up"
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View All
              </Button>
            }
          />
          <div className="mt-4 space-y-3">
            {upcomingDeadlines.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[50px]">
                    <div className="text-xs text-river-stone uppercase">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </div>
                    <div className="text-lg font-semibold text-storm-gray font-mono">
                      {new Date(event.date).getDate()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-storm-gray">
                      {event.title}
                    </div>
                    {event.source && (
                      <div className="text-xs text-river-stone">
                        {event.source.document} {event.source.section}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-storm-gray">
                    {event.daysRemaining} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader
            title="Recent Documents"
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                View All
              </Button>
            }
          />
          <div className="mt-4 space-y-3">
            {recentDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-spruce/10 text-spruce">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-storm-gray">
                      {doc.name}
                    </div>
                    <div className="text-xs text-river-stone">
                      {formatDate(doc.uploadedAt)}
                    </div>
                  </div>
                </div>
                <StatusBadge status={doc.processing.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-semibold text-storm-gray mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>
            Upload Document
          </Button>
          <Button variant="secondary" leftIcon={<PenTool className="w-4 h-4" />}>
            Schedule Signing
          </Button>
          <Button variant="secondary" leftIcon={<Link2 className="w-4 h-4" />}>
            Connect SkySlope
          </Button>
        </div>
      </Card>

      {/* Quick Question */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-sea-glass/20 text-river-stone">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ask a question about this transaction..."
              className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce"
            />
          </div>
          <Button variant="primary" size="sm">
            Ask
          </Button>
        </div>
      </Card>
    </div>
  );
}
