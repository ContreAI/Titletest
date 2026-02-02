// Comprehensive stub for @contreai/api-client - allows app to run without the private package
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

export const configureApiClient = (config: { baseUrl?: string; getToken?: () => Promise<string | null> }) => {
  if (config.baseUrl) {
    axiosInstance.defaults.baseURL = config.baseUrl;
  }
  if (config.getToken) {
    axiosInstance.interceptors.request.use(async (reqConfig) => {
      const token = await config.getToken?.();
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    });
  }
};

export const getAxiosInstance = () => axiosInstance;

// ============================================================================
// TYPE DEFINITIONS (DTOs)
// ============================================================================

// Document types
export interface DocumentDto {
  id: string;
  name: string;
  type?: string;
  url?: string;
  size?: number;
  mimeType?: string;
  processingStep?: DocumentDtoProcessingStep;
  parsedStatus?: DocumentDtoParsedStatus;
  createdAt?: string;
  updatedAt?: string;
  transactionId?: string;
  userId?: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  documentName?: string;
  documentType?: string;
  parsedData?: unknown;
  addressMismatch?: boolean;
  originalDocumentType?: string;
  documentTypeCorrected?: boolean;
}

export type DocumentDtoProcessingStep = 'uploaded' | 'processing' | 'parsed' | 'error';
export type DocumentDtoParsedStatus = 'pending' | 'processing' | 'completed' | 'error' | 'success' | 'failed';

export interface DocumentSummaryDto {
  id: string;
  documentId: string;
  summary?: string;
  summaryContent?: string;
  keyPoints?: string[];
  documentType?: string;
  generatedAt?: string;
  createdAt?: string;
}

export interface DocumentTypeDto {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

// Transaction types
export interface TransactionPropertyTypeDto {
  id: string;
  name: string;
  description?: string;
}

// User settings types
export interface UserSettingsDto {
  id: string;
  userId: string;
  notificationPreferences?: NotificationPreferencesDto;
  accessibilitySettings?: AccessibilitySettingsDto;
  userPreferences?: UserPreferencesDto;
}

export interface NotificationPreferencesDto {
  emailMarketing?: boolean;
  emailUpdates?: boolean;
  emailAlerts?: boolean;
  pushEnabled?: boolean;
  pushTransactions?: boolean;
  pushDocuments?: boolean;
  pushTeam?: boolean;
  digestFrequency?: NotificationPreferencesDtoDigestFrequency;
}

export type NotificationPreferencesDtoDigestFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

export interface AccessibilitySettingsDto {
  reduceMotion?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
  fontSize?: number;
  screenReaderOptimized?: boolean;
  keyboardNavigation?: boolean;
}

export interface UserPreferencesDto {
  theme?: UserPreferencesDtoTheme;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
}

export type UserPreferencesDtoTheme = 'light' | 'dark' | 'system';

// Billing types
export interface InvoiceDto {
  id: string;
  invoiceNumber?: string;
  amount?: number;
  status?: InvoiceDtoStatus;
  createdAt?: string;
  dueDate?: string;
  paidAt?: string;
  downloadUrl?: string;
}

export type InvoiceDtoStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface PaymentMethodDto {
  id: string;
  type?: PaymentMethodDtoType;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export type PaymentMethodDtoType = 'card' | 'bankAccount' | 'usBankAccount';

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BillingControllerGetInvoicesParams {
  page?: number;
  limit?: number;
  status?: InvoiceDtoStatus;
  startDate?: string;
  endDate?: string;
}

export interface GetInvoicesResponseDto {
  data: InvoiceDto[];
  pagination: PaginationMetaDto;
}

// Team types
export interface TeamMemberDto {
  id: string;
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: TeamMemberDtoRole;
  isMaster?: boolean;
  joinedAt?: string;
}

export type TeamMemberDtoRole = 'broker' | 'agent' | 'transactionCoordinator' | 'admin';

export interface InviteDto {
  id: string;
  email: string;
  role?: InviteDtoRole;
  status?: InviteDtoStatus;
  isMaster?: boolean;
  createdAt?: string;
  expiresAt?: string;
}

export type InviteDtoRole = 'broker' | 'agent' | 'transactionCoordinator' | 'admin';
export type InviteDtoStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

export interface CreateInviteDto {
  email: string;
  role: 'broker' | 'agent' | 'transactionCoordinator' | 'admin';
  isMaster?: boolean;
}

export interface BulkInviteDto {
  defaultRole: 'broker' | 'agent' | 'transactionCoordinator' | 'admin';
  invites?: Array<{ email: string; role?: string }>;
}

export interface UpdateMemberDto {
  role?: 'broker' | 'agent' | 'transactionCoordinator' | 'admin';
  isMaster?: boolean;
}

// Subscription types
export interface SubscriptionWithUsageDto {
  id: string;
  status?: SubscriptionWithUsageDtoStatus;
  planId?: string;
  planName?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  usage?: UsageMetricDto[];
}

export type SubscriptionWithUsageDtoStatus = 'active' | 'canceled' | 'pastDue' | 'incomplete' | 'incompleteExpired' | 'trialing' | 'unpaid';

export interface UsageMetricDto {
  name: string;
  used: number;
  limit: number;
}

export interface PlanDto {
  id: string;
  name: string;
  description?: string;
  prices?: PriceDto[];
}

export interface PriceDto {
  id: string;
  amount: number;
  currency: string;
  interval?: 'day' | 'week' | 'month' | 'year';
}

// Note types
export interface NoteDto {
  id: string;
  content: string;
  transactionId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Training types
export type TrainingStatusDtoStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ============================================================================
// STUB API FUNCTIONS - Return empty/mock data
// ============================================================================

// User/Auth controllers
export const userControllerGetProfile = async () => ({ data: null });

// Notification controllers
export const notificationControllerGetNotifications = async () => ({ data: [] });
export const notificationControllerMarkAsRead = async () => ({});
export const notificationControllerDeleteNotification = async () => ({});
export const notificationControllerDeleteAll = async () => ({});

// Document controllers
export const documentControllerGetSummary = async () => ({ data: null });
export const documentSummaryControllerGetSummaryByDocument = async () => null;

// Transaction controllers
export const transactionReportControllerGetTransactionReport = async () => null;
export const transactionPropertyTypeControllerGetAllTypes = async () => [];
export const transactionControllerGetAllTransactions = async () => ({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

// Document type controllers
export const documentTypeControllerGetAllTypes = async () => [];

// Billing controllers
export const billingControllerGetInvoices = async () => ({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
export const billingControllerGetPaymentMethods = async () => [];

// Subscription controllers
export const subscriptionControllerGetSubscription = async () => null;
export const subscriptionControllerGetAvailablePlans = async () => [];

// Team controllers
export const teamControllerGetTeamOverview = async () => ({ members: [], pendingInvites: [] });
export const teamControllerSendInvite = async (_data: CreateInviteDto): Promise<InviteDto> => ({ id: '', email: '' });
export const teamControllerSendBulkInvites = async (_data: BulkInviteDto) => [];
export const teamControllerResendInvite = async (_inviteId: string) => {};
export const teamControllerCancelInvite = async (_inviteId: string) => {};
export const teamControllerUpdateMember = async (_memberId: string, _data: UpdateMemberDto) => {};
export const teamControllerRemoveMember = async (_memberId: string) => {};
export const teamControllerLeaveTeam = async () => {};
export const teamControllerClaimInvite = async (_token: string) => ({ success: true });
export const teamControllerValidateInvite = async (_token: string) => ({ valid: false });
export const teamControllerDeclineInvite = async (_token: string) => {};

// Note controllers
export const noteControllerGetTransactionNotes = async (_transactionId: string) => [];
export const noteControllerDeleteNote = async (_noteId: string) => {};

// User settings controllers
export const userSettingsControllerGetSettings = async () => null;
export const userSettingsControllerUpdateNotificationPreferences = async () => ({});
export const userSettingsControllerUpdateAccessibilitySettings = async () => ({});
export const userSettingsControllerUpdateUserPreferences = async () => ({});

// ============================================================================
// STUB HOOKS - Return mutation/query objects with mock implementations
// ============================================================================

// Transaction hooks
export const useTransactionControllerDeleteTransaction = (_transactionId?: string) => ({
  mutate: async () => {},
  mutateAsync: async () => {},
  trigger: async () => {},
  isPending: false,
  isLoading: false,
  isMutating: false,
  isError: false,
  error: null,
});

// Document hooks
export const useDocumentControllerUploadDocument = () => ({
  mutate: async () => {},
  mutateAsync: async () => {},
  trigger: async () => {},
  isPending: false,
  isLoading: false,
  isMutating: false,
  isError: false,
  error: null,
});

export const useDocumentControllerGetTransactionDocuments = (_transactionId: string, _options?: unknown) => ({
  data: [] as DocumentDto[],
  isLoading: false,
  isError: false,
  error: null,
  refetch: async () => ({ data: [] }),
});

export const useDocumentControllerDeleteDocument = () => ({
  mutate: async () => {},
  mutateAsync: async () => {},
  isPending: false,
  isLoading: false,
  isError: false,
  error: null,
});

// OCR Template hooks
export const useOcrTemplatesControllerGetCompletedTrainingJobs = () => ({
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  refetch: async () => ({ data: [] }),
});

export const useOcrTemplatesControllerTrainTemplate = () => ({
  mutate: async () => {},
  mutateAsync: async () => ({ jobId: '' }),
  isPending: false,
  isLoading: false,
  isError: false,
  error: null,
});

export const useOcrTemplatesControllerGetTrainingStatus = (_jobId: string, _options?: unknown) => ({
  data: null,
  isLoading: false,
  isError: false,
  error: null,
  refetch: async () => ({ data: null }),
});
