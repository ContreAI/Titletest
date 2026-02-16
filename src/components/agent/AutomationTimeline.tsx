"use client";

import { AutomationLog } from "@/components/title";
import type { AutomationEvent } from "@/components/title/AutomationLog";
import { Card } from "@/components/common";

export interface AutomationTimelineProps {
  side: "buyer" | "seller";
}

// Mock automation events visible to the agent
const BUYER_AGENT_EVENTS: AutomationEvent[] = [
  {
    id: "ae_a01",
    type: "email_sent",
    label: "Portal invitation received",
    description: "You were invited to manage the buyer's side of this transaction.",
    timestamp: "Jan 25, 2025 at 2:15 PM",
    status: "completed",
    recipient: "sarah.johnson@premierboise.com",
  },
  {
    id: "ae_a02",
    type: "report_generated",
    label: "AI report: Purchase Agreement",
    description: "Key terms extracted: $385,000 purchase price, $8,000 earnest money, Feb 28 closing.",
    timestamp: "Jan 25, 2025 at 2:16 PM",
    status: "completed",
  },
  {
    id: "ae_a03",
    type: "wire_generated",
    label: "Earnest money wire instructions sent to buyer",
    description: "Secure wire instructions delivered to John & Mary Smith after you provided their contact info.",
    timestamp: "Jan 26, 2025 at 9:30 AM",
    status: "completed",
    recipient: "john.smith@email.com",
  },
  {
    id: "ae_a04",
    type: "notification",
    label: "Wire fraud advisory sent to buyer",
    description: "Automatic wire fraud prevention notice delivered to buyer's email.",
    timestamp: "Jan 26, 2025 at 9:30 AM",
    status: "completed",
    recipient: "john.smith@email.com",
  },
  {
    id: "ae_a05",
    type: "document_routed",
    label: "Earnest money receipt available",
    description: "EM receipt uploaded by title company and added to your document vault.",
    timestamp: "Jan 28, 2025 at 3:15 PM",
    status: "completed",
  },
  {
    id: "ae_a06",
    type: "report_generated",
    label: "Pending: Title Commitment AI report",
    description: "Will be generated when the title company uploads the title commitment.",
    timestamp: "Waiting for upload",
    status: "pending",
  },
];

const SELLER_AGENT_EVENTS: AutomationEvent[] = [
  {
    id: "ae_s01",
    type: "email_sent",
    label: "Portal invitation received",
    description: "You were invited to manage the seller's side of this transaction.",
    timestamp: "Jan 25, 2025 at 2:15 PM",
    status: "completed",
    recipient: "mike.williams@idahorealty.com",
  },
  {
    id: "ae_s02",
    type: "report_generated",
    label: "AI report: Purchase Agreement",
    description: "Key terms extracted: $385,000 purchase price, seller obligations, closing Feb 28.",
    timestamp: "Jan 25, 2025 at 2:16 PM",
    status: "completed",
  },
  {
    id: "ae_s03",
    type: "notification",
    label: "Seller portal access created",
    description: "Portal access sent to Jane Doe after you provided their contact info.",
    timestamp: "Jan 26, 2025 at 10:00 AM",
    status: "completed",
    recipient: "jane.doe@email.com",
  },
  {
    id: "ae_s04",
    type: "document_routed",
    label: "Earnest money receipt available",
    description: "EM receipt uploaded by title company, available in document vault.",
    timestamp: "Jan 28, 2025 at 3:15 PM",
    status: "completed",
  },
  {
    id: "ae_s05",
    type: "payoff_requested",
    label: "Pending: Lien holder payoff requests",
    description: "Will auto-trigger when title commitment is uploaded and lien holders are identified.",
    timestamp: "Waiting for title report",
    status: "pending",
  },
];

export default function AutomationTimeline({ side }: AutomationTimelineProps) {
  const events = side === "buyer" ? BUYER_AGENT_EVENTS : SELLER_AGENT_EVENTS;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
          Automation History
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Everything that's happened automatically on this transaction.
        </p>
        <AutomationLog events={events} />
      </Card>
    </div>
  );
}
