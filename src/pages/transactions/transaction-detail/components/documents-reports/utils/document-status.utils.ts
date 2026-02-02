import { DocumentDtoParsedStatus, DocumentDtoProcessingStep } from '@contreai/api-client';

// Status types matching API client
export type DocumentStatus = DocumentDtoParsedStatus;
export type ProcessingStep = DocumentDtoProcessingStep;

export interface StatusConfig {
  label: string;
  color: 'success' | 'warning' | 'error' | 'default';
  bgColor: string;
  textColor: string;
  dotColor: string;
  message?: string; // Detailed processing message
}

/**
 * Get step label for processing step
 */
export const getProcessingStepLabel = (step: ProcessingStep): string => {
  const stepLabels: Record<ProcessingStep, string> = {
    reviewing: 'Reviewing the Document',
    standardizing: 'Standardizing the Contract Language',
    distilling: 'Distilling the Key Insights',
    enablingAssistance: 'Enabling Intelligent Assistance',
    indexing: 'Indexing for Instant Retrieval',
    identifyingComponents: 'Identifying Critical Deal Components',
    finalizing: 'Finalizing the Comprehensive Report',
  };
  return stepLabels[step] || step;
};

/**
 * Get notification message for processing step
 */
export const getProcessingStepMessage = (step: ProcessingStep): string => {
  const messages: Record<ProcessingStep, string> = {
    reviewing: "We analyze the file's structure and capture all relevant content.",
    standardizing: "We refine and align the document's terminology for accuracy and consistency.",
    distilling: 'We generate a precise, plain-language summary highlighting what truly matters.',
    enablingAssistance: 'We prepare your AI assistant with document-specific knowledge for instant answers.',
    indexing: 'We securely store and index the document so every detail is immediately accessible.',
    identifyingComponents: 'We extract deadlines, obligations, risk indicators, and other essential terms.',
    finalizing: 'We assemble and polish your full analysis, preparing it for review or sharing.',
  };
  return messages[step] || 'Processing document...';
};

/**
 * Get status configuration for a document status
 */
export const getStatusConfig = (
  status: DocumentStatus,
  processingStep?: ProcessingStep,
  _progressPercentage?: number
): StatusConfig => {
  switch (status) {
    case 'completed':
      return {
        label: 'Processed',
        color: 'success' as const,
        bgColor: 'success.lighter',
        textColor: 'success.dark',
        dotColor: 'success.main',
      };
    case 'processing': {
      // Show detailed step when processing
      const stepLabel = processingStep ? getProcessingStepLabel(processingStep) : 'Processing';
      // progressPercentage available for future use (currently displayed in component)
      return {
        label: stepLabel,
        color: 'warning' as const,
        bgColor: 'warning.lighter',
        textColor: 'warning.dark',
        dotColor: 'warning.main',
        message: processingStep ? getProcessingStepMessage(processingStep) : undefined,
      };
    }
    case 'error':
      return {
        label: 'Error',
        color: 'error' as const,
        bgColor: 'error.lighter',
        textColor: 'error.dark',
        dotColor: 'error.main',
      };
    default: // 'pending' or 'not_processed'
      return {
        label: 'Pending',
        color: 'default' as const,
        bgColor: 'grey.100',
        textColor: 'text.secondary',
        dotColor: 'grey.400',
      };
  }
};

