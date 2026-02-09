"use client";

import { AdminHeader } from "@/components/admin/layout";
import { Card, Button } from "@/components/common";
import {
  FileText,
  Copy,
  Pencil,
  Mail,
  Smartphone,
  Globe,
  Bell,
  Clock,
  ChevronRight,
} from "lucide-react";

// ── Timeline Templates ─────────────────────────────────────────────
interface TimelineTemplate {
  id: string;
  name: string;
  type: "purchase" | "refinance" | "commercial";
  milestones: number;
  avgDuration: string;
}

const TIMELINE_TEMPLATES: TimelineTemplate[] = [
  { id: "tt-1", name: "Residential Purchase", type: "purchase", milestones: 14, avgDuration: "32 days" },
  { id: "tt-2", name: "Cash Purchase (Expedited)", type: "purchase", milestones: 9, avgDuration: "18 days" },
  { id: "tt-3", name: "Refinance", type: "refinance", milestones: 11, avgDuration: "28 days" },
  { id: "tt-4", name: "Commercial Acquisition", type: "commercial", milestones: 18, avgDuration: "45 days" },
];

const typeColors: Record<TimelineTemplate["type"], string> = {
  purchase: "text-spruce bg-spruce/10",
  refinance: "text-sea-glass bg-sea-glass/10",
  commercial: "text-amber-600 bg-amber-50",
};

// ── Message Templates ───────────────────────────────────────────────
type Category = "welcome" | "reminder" | "closing" | "post-closing";
type Channel = "email" | "sms" | "portal";

interface MessageTemplate {
  id: string;
  name: string;
  category: Category;
  channels: Channel[];
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: "mt-1", name: "Welcome Packet", category: "welcome", channels: ["email", "portal"] },
  { id: "mt-2", name: "Wire Instructions Reminder", category: "reminder", channels: ["email", "sms"] },
  { id: "mt-3", name: "Closing Appointment Confirmation", category: "closing", channels: ["email", "sms", "portal"] },
  { id: "mt-4", name: "Document Upload Request", category: "reminder", channels: ["email", "portal"] },
  { id: "mt-5", name: "Closing Complete Notification", category: "closing", channels: ["email", "portal"] },
  { id: "mt-6", name: "Post-Closing Follow-up", category: "post-closing", channels: ["email"] },
];

const categoryColors: Record<Category, string> = {
  welcome: "text-spruce bg-spruce/10",
  reminder: "text-amber-600 bg-amber-50",
  closing: "text-sea-glass bg-sea-glass/10",
  "post-closing": "text-fern bg-fern/10",
};

const channelIcons: Record<Channel, typeof Mail> = {
  email: Mail,
  sms: Smartphone,
  portal: Globe,
};

// ── Notification Rules ──────────────────────────────────────────────
interface NotificationRule {
  id: string;
  event: string;
  channel: Channel;
  timing: string;
  recipient: string;
}

const NOTIFICATION_RULES: NotificationRule[] = [
  { id: "nr-1", event: "Document uploaded", channel: "email", timing: "Immediately", recipient: "Assigned Closer" },
  { id: "nr-2", event: "Closing date in 3 days", channel: "sms", timing: "3 days before", recipient: "All Parties" },
  { id: "nr-3", event: "Task overdue", channel: "email", timing: "1 day after due", recipient: "Transaction Admin" },
  { id: "nr-4", event: "Wire instructions viewed", channel: "portal", timing: "Immediately", recipient: "Assigned Closer" },
];

// ── Page Component ──────────────────────────────────────────────────

export default function TemplatesPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Templates"
        subtitle="Manage timeline, message, and notification templates"
      />

      <div className="p-6 space-y-6">
        {/* ── Timeline Templates ─────────────────────────────── */}
        <Card variant="default" padding="none">
          <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Timeline Templates
              </h3>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {TIMELINE_TEMPLATES.length} templates
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {TIMELINE_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="rounded-lg border border-divider bg-elevation1 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {tmpl.name}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${typeColors[tmpl.type]}`}
                    >
                      {tmpl.type}
                    </span>
                  </div>
                  <FileText className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span>
                    <span className="font-[family-name:var(--font-mono)] font-semibold text-[var(--text-primary)]">
                      {tmpl.milestones}
                    </span>{" "}
                    milestones
                  </span>
                  <span>
                    <span className="font-[family-name:var(--font-mono)] font-semibold text-[var(--text-primary)]">
                      {tmpl.avgDuration}
                    </span>{" "}
                    avg
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-divider">
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Duplicate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Message Templates ──────────────────────────────── */}
        <Card variant="default" padding="none">
          <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Message Templates
              </h3>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {MESSAGE_TEMPLATES.length} templates
            </span>
          </div>

          <div className="divide-y divide-divider">
            {MESSAGE_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-elevation1 transition-colors"
              >
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {tmpl.name}
                  </p>
                </div>

                {/* Category badge */}
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[tmpl.category]}`}
                >
                  {tmpl.category}
                </span>

                {/* Channel badges */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {tmpl.channels.map((ch) => {
                    const Icon = channelIcons[ch];
                    return (
                      <span
                        key={ch}
                        className="w-6 h-6 rounded bg-elevation2 flex items-center justify-center"
                        title={ch}
                      >
                        <Icon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      </span>
                    );
                  })}
                </div>

                {/* Edit button */}
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Notification Rules ─────────────────────────────── */}
        <Card variant="default" padding="none">
          <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Notification Rules
              </h3>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {NOTIFICATION_RULES.length} rules
            </span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-2 border-b border-divider bg-elevation1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            <span>Event Trigger</span>
            <span>Channel</span>
            <span>Timing</span>
            <span>Recipient</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-divider">
            {NOTIFICATION_RULES.map((rule) => {
              const Icon = channelIcons[rule.channel];
              return (
                <div
                  key={rule.id}
                  className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-elevation1 transition-colors items-center"
                >
                  <span className="text-sm text-[var(--text-primary)] truncate">
                    {rule.event}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                    <Icon className="w-3.5 h-3.5" />
                    {rule.channel}
                  </span>
                  <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--text-secondary)]">
                    {rule.timing}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)] truncate">
                    {rule.recipient}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
