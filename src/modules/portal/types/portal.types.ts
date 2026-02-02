// Portal Types - Title Portal specific interfaces

export type PortalSide = 'buyer' | 'seller';

// Portal session stored in localStorage
export interface PortalSession {
  transactionId: string;
  side: PortalSide;
  authenticatedAt: string;
  expiresAt: string;
}

// Transaction types
export interface PortalTransaction {
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

  status: TransactionStatus;
  closingAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus =
  | 'pending'
  | 'in_progress'
  | 'closing_scheduled'
  | 'closed'
  | 'cancelled';

// Transaction side info (buyer or seller specific)
export interface PortalTransactionSide {
  id: string;
  transactionId: string;
  side: PortalSide;

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

export type SigningMethod = 'in_person' | 'mobile_notary' | 'ron';

export type SigningStatus =
  | 'not_configured'
  | 'awaiting_selection'
  | 'requested'
  | 'confirmed'
  | 'completed';

// Document Types
export interface PortalDocument {
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

  uploadedAt: string;
  uploadedBy?: string;
}

export type DocumentType =
  | 'purchase_agreement'
  | 'addendum'
  | 'earnest_money_receipt'
  | 'title_commitment'
  | 'preliminary_title_report'
  | 'settlement_statement_buyer'
  | 'settlement_statement_seller'
  | 'wire_instructions'
  | 'closing_disclosure'
  | 'deed'
  | 'title_policy'
  | 'payoff_statement'
  | 'inspection_report'
  | 'appraisal'
  | 'loan_approval'
  | 'insurance_binder'
  | 'hoa_documents'
  | 'lease'
  | 'rent_roll'
  | 'estoppel_certificate'
  | 'environmental_report'
  | 'survey'
  | 'zoning_letter'
  | 'tenant_financials'
  | 'operating_agreement'
  | 'other';

export type DocumentSource =
  | 'qualia'
  | 'buyer_upload'
  | 'seller_upload'
  | 'title_created';

export type ProcessingStatus = 'pending' | 'processing' | 'processed' | 'failed';

// Document category for tab organization
export type DocumentCategory = 'contract' | 'title' | 'financial' | 'closing' | 'due_diligence';

// Document action status for task-based display
export type DocumentActionStatus =
  | 'sign_required'
  | 'review_required'
  | 'upload_needed'
  | 'complete'
  | 'pending_from_title'
  | 'pending_from_lender';

// Extended document with action info
export interface PortalDocumentWithAction extends PortalDocument {
  actionStatus: DocumentActionStatus;
  category: DocumentCategory;
  waitingOn?: WaitingOn;
  dueDate?: string;
}

// Party/waiting on types
export type WaitingOn = 'title' | 'lender' | 'agent' | 'buyer' | 'seller';

// Status board types
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
  type: 'document' | 'checklist' | 'signing';
  title: string;
  category: DocumentCategory;
  action: DocumentActionStatus;
  completed: boolean;
  dueDate?: string;
}

// Tab types
export type PortalTabId = 'dashboard' | 'contract' | 'title' | 'financial' | 'closing';

export interface PortalTab {
  id: PortalTabId;
  label: string;
  path: string;
  badge?: number;
  alert?: boolean;
}

// Timeline types
export interface TimelineEvent {
  id: string;
  transactionId: string;
  date: string;
  title: string;
  description?: string;
  status: TimelineStatus;
  daysRemaining?: number;
  completedAt?: string;
}

export type TimelineStatus = 'complete' | 'upcoming' | 'pending' | 'overdue';

// Title company types
export interface TitleCompany {
  id: string;
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
}

// API response types
export interface PortalLoginResponse {
  success: boolean;
  session?: PortalSession;
  error?: string;
}

export interface PortalDataResponse {
  transaction: PortalTransaction;
  side: PortalTransactionSide;
  documents: PortalDocumentWithAction[];
  timeline: TimelineEvent[];
  titleCompany: TitleCompany;
}
