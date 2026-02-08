// Transaction Types
export interface Transaction {
  id: string;
  titleCompanyId: string;
  qualiaOrderId?: string;

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
    earnestMoneyReceivedDate?: string; // Checkpoint: EM received
    loanAmount?: number;
    downPayment?: number;
    loanType?: string;
    isFinanced: boolean; // true = loan, false = cash
  };

  dates: {
    contractDate: string;
    closingDate: string;
    signingWindowStart?: string;
    signingWindowEnd?: string;
  };

  status: TransactionStatus;
  closingAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus =
  | "pending"
  | "in_progress"
  | "closing_scheduled"
  | "closed"
  | "cancelled";

export interface TransactionSide {
  id: string;
  transactionId: string;
  side: "buyer" | "seller";

  agent: {
    name: string;
    email: string;
    phone?: string;
    brokerage?: string;
  };

  clients: Array<{
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }>;

  portal: {
    url: string;
    passwordHash: string;
  };

  clientPortal?: {
    enabled: boolean;
    passwordHash?: string;
  };

  skyslope?: {
    connected: boolean;
    transactionId?: string;
    lastSyncAt?: string;
  };

  signing: SigningInfo;

  createdAt: string;
}

export interface SigningInfo {
  method?: SigningMethod;
  location?: string;
  status: SigningStatus;
  requestedSlotId?: string;
  confirmedDateTime?: string;
  completedAt?: string;
}

export type SigningMethod = "in_person" | "mobile_notary" | "ron";

export type SigningStatus =
  | "not_configured"
  | "awaiting_selection"
  | "requested"
  | "confirmed"
  | "completed";

// Document Types
export interface Document {
  id: string;
  transactionId: string;

  name: string;
  type: DocumentType;
  filePath: string;

  source: DocumentSource;

  routing: {
    toBuyer: boolean;
    toSeller: boolean;
  };

  processing: {
    status: ProcessingStatus;
    reportPath?: string;
    extractedData?: Record<string, unknown>;
    processedAt?: string;
    error?: string;
  };

  skyslope: {
    pushedToBuyer: boolean;
    pushedToSeller: boolean;
    buyerDocId?: string;
    sellerDocId?: string;
  };

  uploadedAt: string;
  uploadedBy?: string;
}

export type DocumentType =
  | "purchase_agreement"
  | "addendum"
  | "earnest_money_receipt"
  | "title_commitment"
  | "preliminary_title_report"
  | "settlement_statement_buyer"
  | "settlement_statement_seller"
  | "wire_instructions"
  | "closing_disclosure"
  | "deed"
  | "title_policy"
  | "payoff_statement"
  | "inspection_report"
  | "appraisal"
  | "loan_approval"
  | "insurance_binder"
  | "hoa_documents"
  // Commercial-specific document types
  | "lease"
  | "rent_roll"
  | "estoppel_certificate"
  | "environmental_report"
  | "survey"
  | "zoning_letter"
  | "tenant_financials"
  | "operating_agreement"
  | "other";

export type DocumentSource =
  | "qualia"
  | "buyer_upload"
  | "seller_upload"
  | "title_created";

export type ProcessingStatus =
  | "pending"
  | "processing"
  | "processed"
  | "failed";

// Timeline Types
export interface TimelineEvent {
  id: string;
  transactionId: string;

  date: string;
  title: string;
  description?: string;

  status: TimelineStatus;
  daysRemaining?: number;

  source?: {
    document: string;
    section: string;
  };

  completedAt?: string;
  completedBy?: string;
}

export type TimelineStatus =
  | "complete"
  | "upcoming"
  | "pending"
  | "overdue";

// Checklist Types
export interface ChecklistItem {
  id: string;
  transactionId: string;
  side: "buyer" | "seller" | "both";

  category: ChecklistCategory;
  title: string;
  order: number;

  complete: boolean;
  completedAt?: string;

  waitingOn?: WaitingOn;
  linkedDocumentId?: string;
}

export type ChecklistCategory =
  | "contract_earnest_money"
  | "title"
  | "inspection_due_diligence"
  | "financing"
  | "closing_prep"
  | "closing";

export type WaitingOn =
  | "title"
  | "lender"
  | "agent"
  | "buyer"
  | "seller";

// Signing Types
export interface SigningSlot {
  id: string;
  transactionId: string;

  dateTime: string;
  method: SigningMethod;

  available: boolean;
  bookedBySide?: "buyer" | "seller";

  createdAt: string;
}

// Party Types
export interface Party {
  id: string;
  transactionId: string;

  role: PartyRole;

  name: string;
  company?: string;

  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };

  extractedFrom?: {
    documentId: string;
    field: string;
  };
}

export type PartyRole =
  | "buyer"
  | "seller"
  | "buyer_agent"
  | "seller_agent"
  | "lender"
  | "title_closer";

// Chat Types
export interface ChatMessage {
  id: string;
  transactionId: string;
  side: "buyer" | "seller";

  role: "user" | "assistant";
  content: string;

  source?: {
    documentName: string;
    section: string;
  };

  createdAt: string;
}

// Title Company Types
export interface TitleCompany {
  id: string;
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
}

// Tab Types - Transaction Phase Based
export type TabId =
  | "dashboard"
  | "contract"
  | "title"
  | "financial"
  | "closing"
  | "due_diligence"; // Commercial transactions only

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
  badge?: number;
  alert?: boolean;
}

// Document Category Types
export type DocumentCategory = "contract" | "title" | "financial" | "closing" | "due_diligence";

// Document Action Status - for task-based grouping
export type DocumentActionStatus =
  | "sign_required"
  | "review_required"
  | "upload_needed"
  | "complete"
  | "pending_from_title"
  | "pending_from_lender";

// Extended Document interface with action tracking
export interface DocumentWithAction extends Document {
  actionStatus: DocumentActionStatus;
  category: DocumentCategory;
  waitingOn?: WaitingOn;
  dueDate?: string;
}

// Status Board Types
export interface PartyStatus {
  party: WaitingOn;
  label: string;
  pendingCount: number;
  completedCount: number;
  pendingItems: PartyTaskItem[];
  completedItems: PartyTaskItem[];
}

export interface PartyTaskItem {
  id: string;
  type: "document" | "checklist" | "signing";
  title: string;
  category: DocumentCategory;
  action: DocumentActionStatus;
  completed: boolean;
  dueDate?: string;
}

// Keep PendingItem for backward compatibility
export interface PendingItem {
  id: string;
  type: "document" | "checklist" | "signing";
  title: string;
  category: DocumentCategory;
  action: DocumentActionStatus;
  dueDate?: string;
}

// ============================================
// Pizza Tracker / Journey Types
// ============================================

// Transaction phases for the journey tracker
export type TransactionPhase =
  | "contract"
  | "title"
  | "financing"
  | "clear_to_close"
  | "closed";

export type PhaseStatusType = "complete" | "in_progress" | "upcoming" | "not_applicable";

// Alert levels for phases
export type PhaseAlertLevel = "none" | "warning" | "error";

export interface PhaseAlert {
  level: PhaseAlertLevel;
  message: string;
  daysOverdue?: number;
}

// Checkpoints within a phase (e.g., Earnest Money within Contract)
export interface PhaseCheckpoint {
  id: string;
  label: string;
  complete: boolean;
  completedDate?: string;
  required: boolean;
}

export interface PhaseStatus {
  phase: TransactionPhase;
  status: PhaseStatusType;
  label: string;
  description: string;
  startDate?: string;
  completedDate?: string;
  estimatedDays?: number;
  alert?: PhaseAlert;
  checkpoints?: PhaseCheckpoint[];
}

// Party types for status cards
export type ResponsibleParty =
  | "lender"
  | "title"
  | "agent"
  | "buyer"
  | "seller"
  | "appraiser";

export interface PartyTask {
  id: string;
  party: ResponsibleParty;
  task: string;
  status: "complete" | "in_progress" | "waiting";
  completedDate?: string;
  estimatedDate?: string;
  details?: string;
}

// Action items requiring user attention
export type ActionType = "review" | "sign" | "upload" | "schedule" | "confirm";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  actionType: ActionType;
  urgency: "high" | "medium" | "low";
  documentId?: string;
  actionUrl?: string;
}

// Waiting on items (blocking progress)
export interface WaitingOnItem {
  id: string;
  party: ResponsibleParty;
  item: string;
  expectedDuration?: string;
  blockedSince?: string;
}

// Upcoming milestones for timeline
export interface Milestone {
  id: string;
  date: string;
  title: string;
  description?: string;
  isClosingDay?: boolean;
  type: "deadline" | "appointment" | "milestone";
  location?: string;
  time?: string;
}

// Full transaction journey data
export interface TransactionJourney {
  phases: PhaseStatus[];
  currentPhase: TransactionPhase;
  percentComplete: number;
  closingDate: string;
  daysUntilClosing: number;
  isFinanced: boolean; // false = cash transaction (financing phase shows N/A)
  partyTasks: PartyTask[];
  actionItems: ActionItem[];
  waitingOn: WaitingOnItem[];
  upcomingMilestones: Milestone[];
  phaseAlerts: Record<TransactionPhase, PhaseAlert | undefined>;
}

// Phase configuration (for rendering)
export interface PhaseConfig {
  id: TransactionPhase;
  label: string;
  shortLabel: string;
  description: string;
  typicalDuration: string;
  keyMilestones: string[];
}
