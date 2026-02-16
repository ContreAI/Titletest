import { DocumentType } from "@/types";

// ============================================
// Automation Engine Types
// ============================================

export type AutomationEventType =
  | "email_sent"
  | "document_routed"
  | "wire_generated"
  | "payoff_requested"
  | "report_generated"
  | "notification"
  | "task_unlocked"
  | "reminder_sent";

export type AutomationTrigger =
  | "contract_uploaded"
  | "agent_onboarded_client"
  | "em_receipt_uploaded"
  | "title_report_uploaded"
  | "settlement_uploaded"
  | "closing_disclosure_uploaded"
  | "task_status_changed"
  | "due_date_approaching"
  | "manual";

export type AutomationEventStatus = "completed" | "pending" | "simulated";

export interface AutomationEvent {
  id: string;
  transactionId: string;
  type: AutomationEventType;
  trigger: AutomationTrigger;
  label: string;
  description: string;
  timestamp: string;
  status: AutomationEventStatus;
  recipient?: string;
  documentType?: DocumentType;
  metadata?: Record<string, string>;
}

export interface AutomationFlow {
  id: string;
  trigger: AutomationTrigger;
  label: string;
  description: string;
  steps: AutomationFlowStep[];
}

export interface AutomationFlowStep {
  order: number;
  type: AutomationEventType;
  label: string;
  description: string;
  delayMs?: number; // Simulated delay before this step fires
  recipientRole?: "buyer_agent" | "seller_agent" | "buyer" | "seller" | "lien_holder" | "title";
  documentType?: DocumentType;
}

export interface EmailPreview {
  to: string;
  toName: string;
  subject: string;
  body: string;
  type: "invitation" | "wire_instructions" | "notification" | "reminder" | "payoff_request";
}

export interface AutomationSummary {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  lastEventTimestamp: string | null;
  activeFlows: string[];
}

// ============================================
// AI Document Report Types
// ============================================

export type FindingCategory =
  | "financial"
  | "legal"
  | "timeline"
  | "party"
  | "property"
  | "risk";

export type FindingSeverity = "info" | "warning" | "critical";

export interface ReportFinding {
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  detail: string;
  sourceSection?: string;
}

export interface ActionItem {
  id: string;
  label: string;
  description: string;
  dueDate?: string;
  urgent: boolean;
}

export interface DocumentReport {
  documentId: string;
  documentType: DocumentType;
  generatedAt: string;
  summary: string;
  keyFindings: ReportFinding[];
  extractedData: Record<string, string | number>;
  actionItems: ActionItem[];
  metadata: {
    confidenceScore: number;
    processingTimeMs: number;
    modelVersion: string;
  };
}
