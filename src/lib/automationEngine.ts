import type { AutomationEvent } from "@/types/automation";
import type { EditedOCRData } from "@/components/admin/transactions/OCRReviewPanel";

// ============================================
// Mock Automation Engine
// Simulates the automation workflows that fire
// when documents are uploaded or actions taken.
// Each function returns the events that would be
// created, allowing the UI to preview or commit them.
// ============================================

let eventCounter = 0;
function nextId(): string {
  eventCounter++;
  return `auto_${Date.now()}_${eventCounter}`;
}

function now(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ============================================
// Flow 1: Contract Upload → Agent Invitations
// Trigger: Title company uploads and confirms a purchase contract
// ============================================
export function contractUploadFlow(
  transactionId: string,
  extractedData: EditedOCRData
): AutomationEvent[] {
  const timestamp = now();
  const buyerAgentName = extractedData.buyerAgent?.name || "Buyer's Agent";
  const buyerAgentEmail = extractedData.buyerAgent?.email || "agent@example.com";
  const sellerAgentName = extractedData.sellerAgent?.name || "Seller's Agent";
  const sellerAgentEmail = extractedData.sellerAgent?.email || "agent@example.com";
  const propertyAddress = extractedData.property?.address || "Property";

  return [
    {
      id: nextId(),
      transactionId,
      type: "report_generated",
      trigger: "contract_uploaded",
      label: "AI report: Purchase Agreement",
      description: `Key terms extracted: $${extractedData.financials?.purchasePrice?.toLocaleString() || "N/A"} purchase price, $${extractedData.financials?.earnestMoney?.toLocaleString() || "N/A"} earnest money, closing ${extractedData.dates?.closingDate || "TBD"}.`,
      timestamp,
      status: "completed",
    },
    {
      id: nextId(),
      transactionId,
      type: "email_sent",
      trigger: "contract_uploaded",
      label: `Portal invitation sent to ${buyerAgentName}`,
      description: `Email sent with portal link to manage the buyer's side of ${propertyAddress}.`,
      timestamp,
      status: "simulated",
      recipient: buyerAgentEmail,
    },
    {
      id: nextId(),
      transactionId,
      type: "email_sent",
      trigger: "contract_uploaded",
      label: `Portal invitation sent to ${sellerAgentName}`,
      description: `Email sent with portal link to manage the seller's side of ${propertyAddress}.`,
      timestamp,
      status: "simulated",
      recipient: sellerAgentEmail,
    },
    {
      id: nextId(),
      transactionId,
      type: "notification",
      trigger: "contract_uploaded",
      label: "Transaction timeline created",
      description: `Key dates tracked: closing ${extractedData.dates?.closingDate || "TBD"}, inspection contingency, financing contingency.`,
      timestamp,
      status: "completed",
    },
  ];
}

// ============================================
// Flow 2: Agent Onboarding → Wire Instructions
// Trigger: Agent submits client contact info
// ============================================
export function agentOnboardingFlow(
  transactionId: string,
  side: "buyer" | "seller",
  clientName: string,
  clientEmail: string
): AutomationEvent[] {
  const timestamp = now();
  const sideLabel = side === "buyer" ? "Buyer" : "Seller";

  const events: AutomationEvent[] = [
    {
      id: nextId(),
      transactionId,
      type: "email_sent",
      trigger: "agent_onboarded_client",
      label: `Portal access sent to ${clientName}`,
      description: `${sideLabel} portal access email sent with secure login link.`,
      timestamp,
      status: "simulated",
      recipient: clientEmail,
    },
  ];

  if (side === "buyer") {
    events.push(
      {
        id: nextId(),
        transactionId,
        type: "wire_generated",
        trigger: "agent_onboarded_client",
        label: `Earnest money wire instructions sent to ${clientName}`,
        description: "Secure wire instructions generated and delivered for earnest money deposit.",
        timestamp,
        status: "simulated",
        recipient: clientEmail,
      },
      {
        id: nextId(),
        transactionId,
        type: "notification",
        trigger: "agent_onboarded_client",
        label: `Wire fraud advisory sent to ${clientName}`,
        description: "Automatic wire fraud prevention notice delivered to buyer's email.",
        timestamp,
        status: "simulated",
        recipient: clientEmail,
      }
    );
  }

  events.push({
    id: nextId(),
    transactionId,
    type: "task_unlocked",
    trigger: "agent_onboarded_client",
    label: `${sideLabel} portal tasks activated`,
    description: `${clientName}'s task checklist is now active on the ${sideLabel.toLowerCase()} portal.`,
    timestamp,
    status: "completed",
  });

  return events;
}

// ============================================
// Flow 3: EM Receipt Upload → Agent Notification
// Trigger: Title uploads earnest money receipt
// ============================================
export function emReceiptUploadFlow(
  transactionId: string,
  buyerAgentName: string,
  sellerAgentName: string
): AutomationEvent[] {
  const timestamp = now();

  return [
    {
      id: nextId(),
      transactionId,
      type: "document_routed",
      trigger: "em_receipt_uploaded",
      label: "EM receipt routed to buyer agent vault",
      description: `Earnest money receipt uploaded and added to ${buyerAgentName}'s document vault.`,
      timestamp,
      status: "completed",
    },
    {
      id: nextId(),
      transactionId,
      type: "document_routed",
      trigger: "em_receipt_uploaded",
      label: "EM receipt routed to seller agent vault",
      description: `Earnest money receipt uploaded and added to ${sellerAgentName}'s document vault.`,
      timestamp,
      status: "completed",
    },
    {
      id: nextId(),
      transactionId,
      type: "notification",
      trigger: "em_receipt_uploaded",
      label: "Agents notified of EM receipt",
      description: "Both agents have been notified that the earnest money receipt is available.",
      timestamp,
      status: "simulated",
    },
    {
      id: nextId(),
      transactionId,
      type: "report_generated",
      trigger: "em_receipt_uploaded",
      label: "AI report: Earnest Money Receipt",
      description: "Receipt verified: amount, date received, and deposit confirmation extracted.",
      timestamp,
      status: "completed",
    },
  ];
}

// ============================================
// Flow 4: Title Report Upload → Extract + Summarize + Payoff Request
// Trigger: Title uploads title commitment/report
// ============================================
export function titleReportUploadFlow(
  transactionId: string,
  lienHolders: { name: string; loanNumber?: string }[]
): AutomationEvent[] {
  const timestamp = now();

  const events: AutomationEvent[] = [
    {
      id: nextId(),
      transactionId,
      type: "report_generated",
      trigger: "title_report_uploaded",
      label: "AI report: Title Commitment",
      description: `Extracted: ${lienHolders.length} lien holder(s), Schedule B requirements, and exceptions summarized.`,
      timestamp,
      status: "completed",
    },
    {
      id: nextId(),
      transactionId,
      type: "document_routed",
      trigger: "title_report_uploaded",
      label: "Title commitment routed to agent vaults",
      description: "Title commitment added to both buyer and seller agent document vaults.",
      timestamp,
      status: "completed",
    },
    {
      id: nextId(),
      transactionId,
      type: "notification",
      trigger: "title_report_uploaded",
      label: "Agents notified of title commitment",
      description: "Both agents notified to review the title commitment and AI summary report.",
      timestamp,
      status: "simulated",
    },
  ];

  // Generate payoff requests for each lien holder
  lienHolders.forEach((lh) => {
    events.push({
      id: nextId(),
      transactionId,
      type: "payoff_requested",
      trigger: "title_report_uploaded",
      label: `Payoff demand sent to ${lh.name}`,
      description: `Automated payoff demand letter sent to ${lh.name}${lh.loanNumber ? ` (Loan #${lh.loanNumber})` : ""} requesting payoff statement.`,
      timestamp,
      status: "simulated",
      recipient: lh.name,
    });
  });

  return events;
}

// ============================================
// Flow 5: Settlement Statement Upload
// Trigger: Title uploads settlement statement / closing disclosure
// ============================================
export function settlementUploadFlow(
  transactionId: string,
  docType: "settlement" | "closing_disclosure"
): AutomationEvent[] {
  const timestamp = now();
  const docLabel =
    docType === "settlement" ? "Settlement Statement" : "Closing Disclosure";

  return [
    {
      id: nextId(),
      transactionId,
      type: "report_generated",
      trigger: "settlement_uploaded",
      label: `AI report: ${docLabel}`,
      description: `Line-item breakdown, cash-to-close/net proceeds calculations, and fee explanations extracted.`,
      timestamp,
      status: "completed",
    },
    {
      id: nextId(),
      transactionId,
      type: "document_routed",
      trigger: "settlement_uploaded",
      label: `${docLabel} routed to agent vaults`,
      description: `Buyer and seller versions routed to respective agent and client portals.`,
      timestamp,
      status: "completed",
    },
    {
      id: nextId(),
      transactionId,
      type: "notification",
      trigger: "settlement_uploaded",
      label: "Parties notified for review",
      description: `Agents and clients notified to review the ${docLabel} before closing.`,
      timestamp,
      status: "simulated",
    },
  ];
}

// ============================================
// Flow 6: Task Status Change → Notifications
// Trigger: Any task status change
// ============================================
export function taskStatusChangeFlow(
  transactionId: string,
  taskId: string,
  taskTitle: string,
  newStatus: string,
  responsibleParty: string
): AutomationEvent[] {
  const timestamp = now();

  // Only generate notifications for meaningful status changes
  if (newStatus === "completed") {
    return [
      {
        id: nextId(),
        transactionId,
        type: "notification",
        trigger: "task_status_changed",
        label: `Task completed: ${taskTitle}`,
        description: `${responsibleParty} completed "${taskTitle}" (${taskId}).`,
        timestamp,
        status: "completed",
      },
    ];
  }

  if (newStatus === "overdue") {
    return [
      {
        id: nextId(),
        transactionId,
        type: "reminder_sent",
        trigger: "task_status_changed",
        label: `Overdue reminder: ${taskTitle}`,
        description: `Reminder sent to ${responsibleParty} — "${taskTitle}" is past due.`,
        timestamp,
        status: "simulated",
        recipient: responsibleParty,
      },
    ];
  }

  return [];
}

// ============================================
// Flow 7: Due Date Approaching → Reminders
// Trigger: 48 hours before task due date
// ============================================
export function dueDateReminderFlow(
  transactionId: string,
  taskId: string,
  taskTitle: string,
  dueDate: string,
  responsibleParty: string,
  agentName: string
): AutomationEvent[] {
  const timestamp = now();

  return [
    {
      id: nextId(),
      transactionId,
      type: "reminder_sent",
      trigger: "due_date_approaching",
      label: `Upcoming: ${taskTitle}`,
      description: `Reminder sent to ${responsibleParty} — "${taskTitle}" is due ${dueDate}.`,
      timestamp,
      status: "simulated",
      recipient: responsibleParty,
    },
    {
      id: nextId(),
      transactionId,
      type: "notification",
      trigger: "due_date_approaching",
      label: `Agent notified: ${taskTitle} due soon`,
      description: `${agentName} notified that their client's task "${taskTitle}" is due ${dueDate}.`,
      timestamp,
      status: "simulated",
      recipient: agentName,
    },
  ];
}

// ============================================
// Seed data: Pre-populate a demo transaction
// with a realistic automation history
// ============================================
export function seedDemoAutomationEvents(
  transactionId: string
): AutomationEvent[] {
  return [
    {
      id: "demo_01",
      transactionId,
      type: "report_generated",
      trigger: "contract_uploaded",
      label: "AI report: Purchase Agreement",
      description:
        "Key terms extracted: $385,000 purchase price, $8,000 earnest money, Feb 28 closing.",
      timestamp: "Jan 25, 2025 at 2:15 PM",
      status: "completed",
    },
    {
      id: "demo_02",
      transactionId,
      type: "email_sent",
      trigger: "contract_uploaded",
      label: "Portal invitation sent to Sarah Johnson",
      description:
        "Email sent with portal link to manage the buyer's side of 1234 Elm Street.",
      timestamp: "Jan 25, 2025 at 2:16 PM",
      status: "completed",
      recipient: "sarah.johnson@premierboise.com",
    },
    {
      id: "demo_03",
      transactionId,
      type: "email_sent",
      trigger: "contract_uploaded",
      label: "Portal invitation sent to Mike Williams",
      description:
        "Email sent with portal link to manage the seller's side of 1234 Elm Street.",
      timestamp: "Jan 25, 2025 at 2:16 PM",
      status: "completed",
      recipient: "mike.williams@idahorealty.com",
    },
    {
      id: "demo_04",
      transactionId,
      type: "notification",
      trigger: "contract_uploaded",
      label: "Transaction timeline created",
      description:
        "Key dates tracked: closing Feb 28, inspection contingency Jan 31, financing contingency Feb 14.",
      timestamp: "Jan 25, 2025 at 2:16 PM",
      status: "completed",
    },
    {
      id: "demo_05",
      transactionId,
      type: "email_sent",
      trigger: "agent_onboarded_client",
      label: "Portal access sent to John & Mary Smith",
      description: "Buyer portal access email sent with secure login link.",
      timestamp: "Jan 26, 2025 at 9:30 AM",
      status: "completed",
      recipient: "john.smith@email.com",
    },
    {
      id: "demo_06",
      transactionId,
      type: "wire_generated",
      trigger: "agent_onboarded_client",
      label: "Earnest money wire instructions sent to John & Mary Smith",
      description:
        "Secure wire instructions generated and delivered for earnest money deposit.",
      timestamp: "Jan 26, 2025 at 9:30 AM",
      status: "completed",
      recipient: "john.smith@email.com",
    },
    {
      id: "demo_07",
      transactionId,
      type: "notification",
      trigger: "agent_onboarded_client",
      label: "Wire fraud advisory sent to buyer",
      description:
        "Automatic wire fraud prevention notice delivered to buyer's email.",
      timestamp: "Jan 26, 2025 at 9:30 AM",
      status: "completed",
      recipient: "john.smith@email.com",
    },
    {
      id: "demo_08",
      transactionId,
      type: "email_sent",
      trigger: "agent_onboarded_client",
      label: "Portal access sent to Jane Doe",
      description: "Seller portal access email sent with secure login link.",
      timestamp: "Jan 26, 2025 at 10:00 AM",
      status: "completed",
      recipient: "jane.doe@email.com",
    },
    {
      id: "demo_09",
      transactionId,
      type: "document_routed",
      trigger: "em_receipt_uploaded",
      label: "EM receipt routed to buyer agent vault",
      description:
        "Earnest money receipt uploaded and added to Sarah Johnson's document vault.",
      timestamp: "Jan 28, 2025 at 3:15 PM",
      status: "completed",
    },
    {
      id: "demo_10",
      transactionId,
      type: "document_routed",
      trigger: "em_receipt_uploaded",
      label: "EM receipt routed to seller agent vault",
      description:
        "Earnest money receipt uploaded and added to Mike Williams's document vault.",
      timestamp: "Jan 28, 2025 at 3:15 PM",
      status: "completed",
    },
    {
      id: "demo_11",
      transactionId,
      type: "report_generated",
      trigger: "em_receipt_uploaded",
      label: "AI report: Earnest Money Receipt",
      description:
        "Receipt verified: $8,000 received Jan 27, deposited to escrow trust account.",
      timestamp: "Jan 28, 2025 at 3:15 PM",
      status: "completed",
    },
    {
      id: "demo_12",
      transactionId,
      type: "report_generated",
      trigger: "title_report_uploaded",
      label: "Pending: Title Commitment AI report",
      description:
        "Will be generated when the title company uploads the title commitment.",
      timestamp: "Waiting for upload",
      status: "pending",
    },
    {
      id: "demo_13",
      transactionId,
      type: "payoff_requested",
      trigger: "title_report_uploaded",
      label: "Pending: Lien holder payoff requests",
      description:
        "Will auto-trigger when title commitment is uploaded and lien holders are identified.",
      timestamp: "Waiting for title report",
      status: "pending",
    },
  ];
}
