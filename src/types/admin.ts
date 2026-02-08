// Admin/Title Company Backend Types

import { PartyRole, DocumentType, ChecklistCategory } from "./index";

// Transaction types for different workflows
export type TransactionType =
  | "purchase"
  | "refinance"
  | "cash_sale"
  | "short_sale"
  | "new_construction"
  | "commercial"
  | "exchange_1031";

// More granular pipeline stages for admin view
export type PipelineStage =
  | "new_pending"
  | "title_work"
  | "clear_to_close"
  | "scheduled"
  | "closed"
  | "cancelled"
  | "on_hold";

// Title company employee
export interface TitleEmployee {
  id: string;
  titleCompanyId: string;
  name: string;
  email: string;
  phone?: string;
  role: TitleEmployeeRole;
  avatar?: string;
  createdAt: string;
}

export type TitleEmployeeRole = "admin" | "closer" | "processor" | "receptionist";

// OCR extracted data from contracts
export interface OCRExtractedData {
  extractedAt: string;
  confidence: number;
  sourceDocumentId: string;
  fields: {
    propertyAddress?: ExtractedField<string>;
    propertyCity?: ExtractedField<string>;
    propertyState?: ExtractedField<string>;
    propertyZip?: ExtractedField<string>;
    purchasePrice?: ExtractedField<number>;
    earnestMoney?: ExtractedField<number>;
    loanType?: ExtractedField<string>;
    contractDate?: ExtractedField<string>;
    closingDate?: ExtractedField<string>;
    inspectionDeadline?: ExtractedField<string>;
    financingDeadline?: ExtractedField<string>;
    appraisalDeadline?: ExtractedField<string>;
    buyerNames?: ExtractedField<string[]>;
    buyerEmails?: ExtractedField<string[]>;
    buyerPhones?: ExtractedField<string[]>;
    sellerNames?: ExtractedField<string[]>;
    sellerEmails?: ExtractedField<string[]>;
    sellerPhones?: ExtractedField<string[]>;
    buyerAgentName?: ExtractedField<string>;
    buyerAgentEmail?: ExtractedField<string>;
    buyerAgentPhone?: ExtractedField<string>;
    buyerAgentBrokerage?: ExtractedField<string>;
    sellerAgentName?: ExtractedField<string>;
    sellerAgentEmail?: ExtractedField<string>;
    sellerAgentPhone?: ExtractedField<string>;
    sellerAgentBrokerage?: ExtractedField<string>;
    lenderName?: ExtractedField<string>;
    lenderContact?: ExtractedField<string>;
  };
  rawText?: string;
}

export interface ExtractedField<T> {
  value: T;
  confidence: number;
}

// Timeline template for auto-generating events
export interface TimelineTemplate {
  id: string;
  titleCompanyId: string;
  name: string;
  description?: string;
  transactionType: TransactionType;
  events: TimelineTemplateEvent[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineTemplateEvent {
  id: string;
  title: string;
  description?: string;
  offsetDays: number; // Days from anchor (negative = before, positive = after)
  offsetFrom: "closing_date" | "contract_date" | "created_date";
  assignedTo?: PartyRole | "title";
  category: ChecklistCategory;
  isRequired: boolean;
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  channel: NotificationChannel;
  daysBeforeEvent: number;
  templateId?: string;
}

export type NotificationChannel = "email" | "sms" | "portal";

// Message template with variables
export interface MessageTemplate {
  id: string;
  titleCompanyId: string;
  name: string;
  subject: string;
  body: string; // Contains {{variable}} placeholders
  channels: NotificationChannel[];
  variables: TemplateVariable[];
  triggerType: MessageTriggerType;
  triggerConfig?: TriggerConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MessageTriggerType =
  | "manual"
  | "days_before_closing"
  | "days_after_event"
  | "document_uploaded"
  | "stage_change"
  | "checklist_complete";

export interface TriggerConfig {
  daysOffset?: number;
  eventType?: string;
  documentType?: DocumentType;
  stage?: PipelineStage;
  checklistCategory?: ChecklistCategory;
}

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

// Scheduled notification
export interface ScheduledNotification {
  id: string;
  transactionId: string;
  templateId: string;
  recipientPartyId: string;
  recipientEmail: string;
  channel: NotificationChannel;
  scheduledFor: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  sentAt?: string;
  error?: string;
  resolvedContent: {
    subject: string;
    body: string;
  };
}

// Document routing selection for upload UI
export type DocumentRouting = "buyer_only" | "seller_only" | "both" | "internal";

// Document routing rule configuration
export interface DocumentRoutingRule {
  documentType: DocumentType;
  defaultRouting: DocumentRouting;
  description: string;
  requiresApproval?: boolean;
}

// Transaction note (internal)
export interface TransactionNote {
  id: string;
  transactionId: string;
  authorId: string;
  authorName: string;
  content: string;
  isInternal: boolean; // true = staff only, false = visible to parties
  createdAt: string;
  updatedAt?: string;
}

// Activity log entry
export interface ActivityLogEntry {
  id: string;
  transactionId: string;
  actorId: string;
  actorName: string;
  actorType: "employee" | "buyer" | "seller" | "agent" | "system";
  action: ActivityAction;
  details: Record<string, unknown>;
  timestamp: string;
}

export type ActivityAction =
  | "transaction_created"
  | "transaction_updated"
  | "stage_changed"
  | "document_uploaded"
  | "document_routed"
  | "document_processed"
  | "party_added"
  | "party_updated"
  | "note_added"
  | "message_sent"
  | "checklist_updated"
  | "signing_scheduled"
  | "signing_completed";

// Extended transaction for admin backend
export interface AdminTransaction {
  id: string;
  titleCompanyId: string;
  qualiaOrderId?: string;
  transactionType: TransactionType;
  pipelineStage: PipelineStage;

  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    legalDescription?: string;
  };

  financials: {
    purchasePrice: number;
    earnestMoney: number;
    loanAmount?: number;
    downPayment?: number;
    loanType?: string;
  };

  dates: {
    contractDate: string;
    closingDate: string;
    signingWindowStart?: string;
    signingWindowEnd?: string;
  };

  assignedCloserId?: string;
  assignedCloserName?: string;
  assignedProcessorId?: string;
  priority: "low" | "normal" | "high" | "urgent";
  tags: string[];

  // Counts for display
  documentCount: number;
  pendingDocumentCount: number;
  unreadMessageCount: number;

  // Party summary for cards
  buyerNames: string[];
  sellerNames: string[];
  buyerAgentName?: string;
  sellerAgentName?: string;

  ocrData?: OCRExtractedData;

  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  lastActivityDescription?: string;
}

// Pipeline filter state
export interface PipelineFilters {
  search: string;
  stages: PipelineStage[];
  transactionTypes: TransactionType[];
  closerIds: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  priority: ("low" | "normal" | "high" | "urgent")[];
  tags: string[];
}

// Filter preset
export interface FilterPreset {
  id: string;
  name: string;
  filters: PipelineFilters;
  isDefault?: boolean;
  createdAt: string;
}

// Pipeline view mode
export type PipelineViewMode = "kanban" | "list" | "calendar";

// Kanban column configuration
export interface KanbanColumn {
  id: string;
  stage: PipelineStage;
  title: string;
  color: string;
}

// Pipeline stage metadata
export const PIPELINE_STAGES: Record<PipelineStage, { label: string; color: string; order: number }> = {
  new_pending: { label: "New Orders", color: "amber", order: 1 },
  title_work: { label: "Title Work", color: "river-stone", order: 2 },
  clear_to_close: { label: "Clear to Close", color: "sea-glass", order: 3 },
  scheduled: { label: "Scheduled", color: "spruce", order: 4 },
  closed: { label: "Closed", color: "fern", order: 5 },
  cancelled: { label: "Cancelled", color: "signal-red", order: 6 },
  on_hold: { label: "On Hold", color: "storm-gray", order: 7 },
};

// Transaction type metadata
export const TRANSACTION_TYPES: Record<TransactionType, { label: string; description: string }> = {
  purchase: { label: "Purchase", description: "Standard residential purchase" },
  refinance: { label: "Refinance", description: "Refinance existing loan" },
  cash_sale: { label: "Cash Sale", description: "No financing involved" },
  short_sale: { label: "Short Sale", description: "Bank-approved short sale" },
  new_construction: { label: "New Construction", description: "Builder/developer sale" },
  commercial: { label: "Commercial", description: "Commercial real estate" },
  exchange_1031: { label: "1031 Exchange", description: "Tax-deferred exchange" },
};

// Standard template variables
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: "buyer_name", description: "Primary buyer name", example: "John Smith" },
  { name: "buyer_names", description: "All buyer names", example: "John and Jane Smith" },
  { name: "seller_name", description: "Primary seller name", example: "Robert Johnson" },
  { name: "seller_names", description: "All seller names", example: "Robert Johnson" },
  { name: "property_address", description: "Full property address", example: "123 Main St, Boise, ID 83702" },
  { name: "property_street", description: "Street address only", example: "123 Main St" },
  { name: "closing_date", description: "Formatted closing date", example: "February 15, 2025" },
  { name: "closing_date_short", description: "Short closing date", example: "Feb 15" },
  { name: "days_until_closing", description: "Days remaining to closing", example: "14" },
  { name: "purchase_price", description: "Formatted purchase price", example: "$425,000" },
  { name: "earnest_money", description: "Formatted earnest money", example: "$10,000" },
  { name: "buyer_agent_name", description: "Buyer's agent name", example: "Sarah Johnson" },
  { name: "seller_agent_name", description: "Seller's agent name", example: "Mike Williams" },
  { name: "title_company_name", description: "Title company name", example: "Contre Title" },
  { name: "closer_name", description: "Assigned closer name", example: "Emily Davis" },
  { name: "closer_phone", description: "Closer phone number", example: "(208) 555-1000" },
  { name: "closer_email", description: "Closer email", example: "emily@contretitle.com" },
  { name: "portal_link", description: "Party's portal URL", example: "https://portal.contretitle.com/tx/123/buyer" },
];
