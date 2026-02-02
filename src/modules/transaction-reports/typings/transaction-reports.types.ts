/**
 * Transaction Reports Types
 */

export interface TransactionReportData {
  deal_details?: string | null;
  current_stage?: string | null;
  effective_contract_date?: string | null;
  earnest_money_due?: string | null;
  inspection_deadline?: string | null;
  financing_deadline?: string | null;
  financial_deadline?: string | null;
  closing_date?: string | null;
  client_name?: string | null;
  other_party?: string | null;
  purchase_price?: string | null;
  title_company?: string | null;
  title_commitment_date?: string | null;
  seller_disclosure_date?: string | null;
  high_risk_count?: number;
  medium_risk_count?: number;
  low_risk_count?: number;
}

export interface TransactionReport {
  id: string;
  transactionId: string;
  userId: string;
  status: string | null;
  data: TransactionReportData;
  documentCount?: number;
  metadata?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    model?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type ReportJobStatus = 'queued' | 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface ReportGenerationJob {
  jobId: string;
  transactionId: string;
  status: ReportJobStatus;
  progress: number;
  error?: string;
  createdAt?: string;
  finishedAt?: string;
}

export interface TransactionReportsStore {
  // State
  currentTransactionReport: TransactionReport | null;
  transactionReports: Map<string, TransactionReport>; // Map of transactionId -> report
  isLoading: boolean;
  // Job tracking state
  activeJobs: Map<string, ReportGenerationJob>; // Map of transactionId -> active job

  // Actions
  setCurrentTransactionReport: (report: TransactionReport | null) => void;
  setTransactionReport: (transactionId: string, report: TransactionReport | null) => void;
  getTransactionReport: (transactionId: string) => TransactionReport | null;
  fetchTransactionReport: (transactionId: string) => Promise<TransactionReport | null>;
  clearCurrentTransactionReport: () => void;
  // Job tracking actions
  setActiveJob: (transactionId: string, job: ReportGenerationJob | null) => void;
  getActiveJob: (transactionId: string) => ReportGenerationJob | null;
  pollJobStatus: (jobId: string, transactionId: string) => Promise<ReportGenerationJob | null>;
  // WebSocket listeners for real-time updates
  setupSocketListeners: () => void;
  removeSocketListeners: () => void;
  updateReportFromSocket: (transactionId: string, updates: Partial<TransactionReport>) => void;
}

