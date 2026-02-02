export enum NotificationType {
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_PROCESSED = 'document_processed',
  DOCUMENT_FAILED = 'document_failed',
  TRANSACTION_SUMMARY_READY = 'transaction_summary_ready',
  TRANSACTION_REPORT_READY = 'transaction_report_ready',
  AGENT_UPLOADED_DOCUMENT = 'agent_uploaded_document',
  AGENT_COMMENTED = 'agent_commented',
  TRANSACTION_STATUS_CHANGED = 'transaction_status_changed',
  SYSTEM_ALERT = 'system_alert',
  JOB_COMPLETED = 'job_completed',
  JOB_FAILED = 'job_failed',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  transactionId?: string;
  documentId?: string;
  agentId?: string;
  jobId?: string;
  metadata?: Record<string, any>;
  read: boolean;
  readAt?: string;
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
  
  // Socket
  setupSocketListeners: () => void;
  removeSocketListeners: () => void;
}

