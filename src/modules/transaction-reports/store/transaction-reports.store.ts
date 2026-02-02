import { create } from 'zustand';
import { TransactionReportsStore, TransactionReport, ReportGenerationJob, TransactionReportData } from '../typings/transaction-reports.types';
import { transactionReportControllerGetTransactionReport } from '@contreai/api-client';
import axiosInstance from 'services/axios/axiosInstance';
import { socketService } from 'services/socket/socket.service';

// Track in-flight requests to prevent duplicate concurrent fetches
const pendingRequests = new Map<string, Promise<TransactionReport | null>>();

/**
 * Transaction Reports Store
 * State management for transaction reports
 * Uses SWR hooks for API calls but manages state in Zustand
 */
export const useTransactionReportsStore = create<TransactionReportsStore>((set, get) => ({
  currentTransactionReport: null,
  transactionReports: new Map<string, TransactionReport>(),
  isLoading: false,
  activeJobs: new Map<string, ReportGenerationJob>(),

  setCurrentTransactionReport: (report: TransactionReport | null) => {
    set({ currentTransactionReport: report });
  },

  setTransactionReport: (transactionId: string, report: TransactionReport | null) => {
    const reports = new Map(get().transactionReports);
    if (report) {
      reports.set(transactionId, report);
    } else {
      reports.delete(transactionId);
    }
    set({ transactionReports: reports });
  },

  getTransactionReport: (transactionId: string) => {
    return get().transactionReports.get(transactionId) || null;
  },

  fetchTransactionReport: async (transactionId: string): Promise<TransactionReport | null> => {
    // Check if we already have this report cached
    const existingReport = get().transactionReports.get(transactionId);
    if (existingReport) {
      return existingReport;
    }

    // Check if there's already a pending request for this transaction
    const pendingRequest = pendingRequests.get(transactionId);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Create the fetch promise
    const fetchPromise = (async (): Promise<TransactionReport | null> => {
      set({ isLoading: true });

      try {
        // Use generated client - response is TransactionReportDto directly (no wrapper)
        const reportData = await transactionReportControllerGetTransactionReport(transactionId);

        if (!reportData) {
          // Report doesn't exist
          set({ currentTransactionReport: null, isLoading: false });
          return null;
        }

        // Map the generated DTO to local type
        // The generated DTO uses dealData array, but local type expects data object
        const transactionReport: TransactionReport = {
          id: reportData.id,
          transactionId: reportData.transactionId,
          userId: reportData.userId,
          status: reportData.status,
          // Convert dealData array to data object if needed
          data: Array.isArray(reportData.dealData)
            ? reportData.dealData.reduce(
                (acc: Record<string, string>, point: { field: string; value: string }) => {
                  acc[point.field] = point.value;
                  return acc;
                },
                {}
              )
            : (reportData as any).data || {},
          documentCount: (reportData as any).documentCount,
          metadata: {
            model: reportData.model,
            totalTokens: reportData.tokensUsed,
          },
          createdAt: reportData.createdAt,
          updatedAt: reportData.updatedAt,
        };

        // Store in both currentTransactionReport and the map
        const reports = new Map(get().transactionReports);
        reports.set(transactionId, transactionReport);
        set({
          currentTransactionReport: transactionReport,
          transactionReports: reports,
          isLoading: false,
        });
        return transactionReport;
      } catch (error: any) {
        // 404 or other error - report doesn't exist yet
        if (error.status === 404 || error.response?.status === 404) {
          set({ currentTransactionReport: null, isLoading: false });
          return null;
        }

        console.error('[TransactionReports] Failed to fetch transaction report:', error);
        set({ isLoading: false });
        return null;
      } finally {
        // Remove from pending requests when done
        pendingRequests.delete(transactionId);
      }
    })();

    // Store the pending request
    pendingRequests.set(transactionId, fetchPromise);

    return fetchPromise;
  },

  clearCurrentTransactionReport: () => {
    set({ currentTransactionReport: null });
  },

  setActiveJob: (transactionId: string, job: ReportGenerationJob | null) => {
    const jobs = new Map(get().activeJobs);
    if (job) {
      jobs.set(transactionId, job);
    } else {
      jobs.delete(transactionId);
    }
    set({ activeJobs: jobs });
  },

  getActiveJob: (transactionId: string) => {
    return get().activeJobs.get(transactionId) || null;
  },

  pollJobStatus: async (jobId: string, transactionId: string): Promise<ReportGenerationJob | null> => {
    try {
      // The axios interceptor returns response.data directly
      const data = await axiosInstance.get(`/api/v1/transaction-reports/job/${jobId}`) as {
        jobId: string;
        transactionId: string;
        status: ReportGenerationJob['status'];
        progress: number;
        error?: string;
        createdAt?: string;
        finishedAt?: string;
      };

      const jobStatus: ReportGenerationJob = {
        jobId: data.jobId,
        transactionId: data.transactionId,
        status: data.status,
        progress: data.progress || 0,
        error: data.error,
        createdAt: data.createdAt,
        finishedAt: data.finishedAt,
      };

      // Update the active job in store
      const jobs = new Map(get().activeJobs);

      // If job is completed or failed, remove from active jobs
      if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
        jobs.delete(transactionId);
      } else {
        jobs.set(transactionId, jobStatus);
      }

      set({ activeJobs: jobs });
      return jobStatus;
    } catch (error: any) {
      console.error('[TransactionReports] Failed to poll job status:', error);
      // On error, remove the job from tracking
      const jobs = new Map(get().activeJobs);
      jobs.delete(transactionId);
      set({ activeJobs: jobs });
      return null;
    }
  },

  // Update a report from socket events (without API call)
  updateReportFromSocket: (transactionId: string, updates: Partial<TransactionReport>) => {
    set((state) => {
      const existingReport = state.transactionReports.get(transactionId);
      if (!existingReport) {
        // If no existing report, create a new one from the update
        if (updates.id && updates.data) {
          const newReport: TransactionReport = {
            id: updates.id,
            transactionId,
            userId: updates.userId || '',
            status: updates.status || 'completed',
            data: updates.data,
            documentCount: updates.documentCount,
            metadata: updates.metadata,
            createdAt: updates.createdAt || new Date().toISOString(),
            updatedAt: updates.updatedAt || new Date().toISOString(),
          };
          const reports = new Map(state.transactionReports);
          reports.set(transactionId, newReport);
          return {
            transactionReports: reports,
            currentTransactionReport: state.currentTransactionReport?.transactionId === transactionId
              ? newReport
              : state.currentTransactionReport,
          };
        }
        return state;
      }

      const updatedReport: TransactionReport = {
        ...existingReport,
        ...updates,
        updatedAt: updates.updatedAt || new Date().toISOString(),
      };

      const reports = new Map(state.transactionReports);
      reports.set(transactionId, updatedReport);

      return {
        transactionReports: reports,
        currentTransactionReport: state.currentTransactionReport?.transactionId === transactionId
          ? updatedReport
          : state.currentTransactionReport,
      };
    });
  },

  // Setup Socket.IO listeners for real-time report updates
  setupSocketListeners: () => {
    console.log('[TransactionReports] Setting up Socket.IO listeners for report updates');

    // Remove existing listeners first to avoid duplicates
    socketService.off('report:updated');
    socketService.off('report:created');
    socketService.off('report:deleted');

    // Listen for report updates (e.g., timeline data changes)
    const handleReportUpdated = (data: {
      transactionId: string;
      report: {
        id: string;
        transactionId: string;
        userId?: string;
        status?: string;
        data?: TransactionReportData;
        documentCount?: number;
        metadata?: Record<string, unknown>;
        createdAt?: string;
        updatedAt?: string;
      };
      userId: string;
      timestamp: string;
    }) => {
      console.log('[TransactionReports] 📝 Report updated received:', data);

      const { transactionId, report } = data;

      get().updateReportFromSocket(transactionId, {
        id: report.id,
        transactionId: report.transactionId,
        userId: report.userId,
        status: report.status,
        data: report.data,
        documentCount: report.documentCount,
        metadata: report.metadata as TransactionReport['metadata'],
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      });

      console.log('[TransactionReports] ✅ Report updated in store:', transactionId);
    };

    // Listen for new reports
    const handleReportCreated = (data: {
      transactionId: string;
      report: {
        id: string;
        transactionId: string;
        userId?: string;
        status?: string;
        data?: TransactionReportData;
        documentCount?: number;
        metadata?: Record<string, unknown>;
        createdAt?: string;
        updatedAt?: string;
      };
      userId: string;
      timestamp: string;
    }) => {
      console.log('[TransactionReports] 🆕 New report received:', data);

      const { transactionId, report } = data;

      const newReport: TransactionReport = {
        id: report.id,
        transactionId: report.transactionId,
        userId: report.userId || '',
        status: report.status || 'completed',
        data: report.data || {},
        documentCount: report.documentCount,
        metadata: report.metadata as TransactionReport['metadata'],
        createdAt: report.createdAt || new Date().toISOString(),
        updatedAt: report.updatedAt || new Date().toISOString(),
      };

      const reports = new Map(get().transactionReports);
      reports.set(transactionId, newReport);
      set({ transactionReports: reports });

      console.log('[TransactionReports] ✅ New report added to store:', transactionId);
    };

    // Listen for report deletions
    const handleReportDeleted = (data: {
      transactionId: string;
      userId: string;
      timestamp: string;
    }) => {
      console.log('[TransactionReports] 🗑️ Report deleted received:', data);

      const { transactionId } = data;
      const reports = new Map(get().transactionReports);
      reports.delete(transactionId);

      set((state) => ({
        transactionReports: reports,
        currentTransactionReport: state.currentTransactionReport?.transactionId === transactionId
          ? null
          : state.currentTransactionReport,
      }));

      console.log('[TransactionReports] ✅ Report removed from store:', transactionId);
    };

    socketService.on('report:updated', handleReportUpdated);
    socketService.on('report:created', handleReportCreated);
    socketService.on('report:deleted', handleReportDeleted);

    console.log('[TransactionReports] ✅ Socket.IO listeners set up for report updates');
  },

  // Remove Socket.IO listeners - called on disconnect
  removeSocketListeners: () => {
    console.log('[TransactionReports] Removing Socket.IO listeners');
    socketService.off('report:updated');
    socketService.off('report:created');
    socketService.off('report:deleted');
    console.log('[TransactionReports] ✅ Socket.IO listeners removed');
  },
}));
