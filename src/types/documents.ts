/**
 * Global types for document management
 */

export type DocumentType =
  | 'purchase_sale_agreement'
  | 'hoa_documents'
  | 'title_report'
  | 'inspection_report'
  | 'appraisal'
  | 'disclosure'
  | 'addendum'
  | 'counter_offer'
  | 'amendment'
  | 'other';

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
}

export const documentTypes: DocumentTypeOption[] = [
  { value: 'purchase_sale_agreement', label: 'Purchase & Sale Agreement' },
  { value: 'hoa_documents', label: 'HOA Documents' },
  { value: 'title_report', label: 'Title Report' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'appraisal', label: 'Appraisal' },
  { value: 'disclosure', label: 'Disclosure' },
  { value: 'addendum', label: 'Addendum' },
  { value: 'counter_offer', label: 'Counter Offer' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'other', label: 'Other' },
];

export interface TransactionDocument {
  id: string;
  transactionId: string;
  documentType: DocumentType;
  documentName: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'error';
  aiAnalysis?: {
    summary: string;
    keyTerms: Record<string, any>;
    riskFlags: string[];
    confidence: number;
  };
}

