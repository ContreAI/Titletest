"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle2,
  FileText,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Card, Button } from "@/components/common";
import { AutomationLog, DocumentUploadZone } from "@/components/title";
import type { AutomationEvent } from "@/components/title/AutomationLog";
import { mockAdminTransactions } from "@/data/adminMockData";

// Mock automation events for the demo transaction
const MOCK_AUTOMATION_EVENTS: AutomationEvent[] = [
  {
    id: "ae_001",
    type: "email_sent",
    label: "Portal invitation sent to Sarah Johnson (buyer's agent)",
    description:
      "Personalized email with secure portal link. Agent will onboard their client.",
    timestamp: "Jan 25, 2025 at 2:15 PM",
    status: "completed",
    recipient: "sarah.johnson@premierboise.com",
  },
  {
    id: "ae_002",
    type: "email_sent",
    label: "Portal invitation sent to Mike Williams (seller's agent)",
    description:
      "Personalized email with secure portal link. Agent will onboard their client.",
    timestamp: "Jan 25, 2025 at 2:15 PM",
    status: "completed",
    recipient: "mike.williams@idahorealty.com",
  },
  {
    id: "ae_003",
    type: "report_generated",
    label: "AI report generated for Purchase Agreement",
    description:
      "Key terms extracted: $385,000 purchase price, $8,000 earnest money, Feb 28 closing, conventional financing.",
    timestamp: "Jan 25, 2025 at 2:16 PM",
    status: "completed",
  },
  {
    id: "ae_004",
    type: "notification",
    label: "Wire fraud advisory queued for buyer",
    description:
      "Will be sent when buyer's agent provides client contact information.",
    timestamp: "Jan 25, 2025 at 2:16 PM",
    status: "pending",
  },
  {
    id: "ae_005",
    type: "wire_generated",
    label: "Earnest money wire instructions queued",
    description:
      "Will be sent to buyer when agent completes client onboarding.",
    timestamp: "Jan 25, 2025 at 2:16 PM",
    status: "pending",
  },
];

export default function TitleTransactionDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;

  const transaction = mockAdminTransactions.find(
    (t) => t.id === transactionId
  );

  const [automationEvents, setAutomationEvents] = useState<AutomationEvent[]>(
    MOCK_AUTOMATION_EVENTS
  );
  const [emReceiptUploaded, setEmReceiptUploaded] = useState(false);
  const [titleReportUploaded, setTitleReportUploaded] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!transaction) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">
            Transaction not found: {transactionId}
          </p>
          <Link
            href="/title/transactions"
            className="text-royal hover:underline mt-2 inline-block"
          >
            Back to transactions
          </Link>
        </div>
      </div>
    );
  }

  const handleEmReceiptUpload = (file: File) => {
    // Simulate upload + automation trigger
    setTimeout(() => {
      setEmReceiptUploaded(true);
      setAutomationEvents((prev) => [
        ...prev,
        {
          id: `ae_${Date.now()}`,
          type: "document_routed",
          label: "EM Receipt routed to buyer and seller agents",
          description: `File: ${file.name} — Delivered to both agent portals.`,
          timestamp: new Date().toLocaleString(),
          status: "completed",
        },
      ]);
    }, 1500);
  };

  const handleTitleReportUpload = (file: File) => {
    setTimeout(() => {
      setTitleReportUploaded(true);
      setAutomationEvents((prev) => [
        ...prev,
        {
          id: `ae_${Date.now()}_1`,
          type: "report_generated",
          label: "AI report generated for Title Commitment",
          description:
            "Lien holders identified: Wells Fargo (1st mortgage), Ada County Tax (property tax lien). Summary generated.",
          timestamp: new Date().toLocaleString(),
          status: "completed",
        },
        {
          id: `ae_${Date.now()}_2`,
          type: "payoff_requested",
          label: "Payoff demand sent to Wells Fargo",
          description:
            "Automated payoff request letter sent to Wells Fargo for 1st mortgage payoff statement.",
          timestamp: new Date().toLocaleString(),
          status: "simulated",
          recipient: "payoffs@wellsfargo.com",
        },
        {
          id: `ae_${Date.now()}_3`,
          type: "document_routed",
          label: "Title Commitment summary routed to both agents",
          description:
            "AI-summarized title report delivered to buyer and seller agent portals.",
          timestamp: new Date().toLocaleString(),
          status: "completed",
        },
      ]);
    }, 2000);
  };

  const handleCopyLink = (side: string) => {
    const url = `${window.location.origin}/tx/${transactionId}/agent/${side}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(side);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back */}
        <Link
          href="/title/transactions"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-royal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              {transaction.property.address}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {transaction.property.city}, {transaction.property.state}{" "}
              {transaction.property.zip} &middot;{" "}
              <span className="font-[family-name:var(--font-mono)]">
                {transaction.id}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              ${transaction.financials.purchasePrice.toLocaleString()}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Close:{" "}
              {transaction.dates.closingDate
                ? new Date(transaction.dates.closingDate).toLocaleDateString()
                : "TBD"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload + Agent Links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Portal Links */}
            <Card>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-royal" />
                Agent Portal Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AgentLinkCard
                  side="buyer"
                  agentName="Sarah Johnson"
                  brokerage="Premier Boise Realty"
                  status="invitation_sent"
                  transactionId={transactionId}
                  onCopy={() => handleCopyLink("buyer")}
                  copied={copiedLink === "buyer"}
                />
                <AgentLinkCard
                  side="seller"
                  agentName="Mike Williams"
                  brokerage="Idaho Realty Group"
                  status="invitation_sent"
                  transactionId={transactionId}
                  onCopy={() => handleCopyLink("seller")}
                  copied={copiedLink === "seller"}
                />
              </div>
            </Card>

            {/* Document Upload Zones */}
            <Card>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-royal" />
                Upload Documents
              </h2>
              <div className="space-y-4">
                <DocumentUploadZone
                  documentType="earnest_money_receipt"
                  label="Earnest Money Receipt"
                  description="Upload the EM receipt to route to both agents."
                  automationHint="Auto-routes to buyer and seller agent portals"
                  onUpload={handleEmReceiptUpload}
                  isComplete={emReceiptUploaded}
                />
                <DocumentUploadZone
                  documentType="title_commitment"
                  label="Title Commitment / Preliminary Report"
                  description="Upload the title report for AI extraction and summary."
                  automationHint="AI extracts lien holders and triggers payoff demand requests"
                  onUpload={handleTitleReportUpload}
                  isComplete={titleReportUploaded}
                />
                <DocumentUploadZone
                  documentType="settlement_statement"
                  label="Settlement Statement"
                  description="Upload buyer/seller settlement statements for review."
                  automationHint="AI generates line-item breakdown and routes to respective agents"
                  onUpload={() => {}}
                />
                <DocumentUploadZone
                  documentType="closing_disclosure"
                  label="Closing Disclosure"
                  description="Upload the CD for TRID compliance tracking."
                  automationHint="TRID 3-business-day timer starts on delivery"
                  onUpload={() => {}}
                />
              </div>
            </Card>
          </div>

          {/* Right Column: Automation Log */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-sea-glass-400" />
                Automation Log
              </h2>
              <AutomationLog events={automationEvents} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import
import { Zap } from "lucide-react";

function AgentLinkCard({
  side,
  agentName,
  brokerage,
  status,
  transactionId,
  onCopy,
  copied,
}: {
  side: "buyer" | "seller";
  agentName: string;
  brokerage: string;
  status: string;
  transactionId: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="border border-divider rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            side === "buyer" ? "text-royal" : "text-signal-red"
          }`}
        >
          {side}'s Agent
        </span>
        <span className="text-xs text-fern flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Invited
        </span>
      </div>
      <p className="font-medium text-[var(--text-primary)]">{agentName}</p>
      <p className="text-xs text-[var(--text-secondary)]">{brokerage}</p>
      <div className="flex items-center gap-2 mt-3">
        <Link
          href={`/tx/${transactionId}/agent/${side}`}
          className="text-xs text-royal hover:underline flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Open Portal
        </Link>
        <button
          onClick={onCopy}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-fern" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
