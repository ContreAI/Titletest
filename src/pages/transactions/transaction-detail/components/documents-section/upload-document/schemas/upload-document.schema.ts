import * as yup from 'yup';

/**
 * Upload Document Form Data
 * Note: documentType is now optional - AI will auto-classify the document type
 */
export interface UploadDocumentFormData {
  documentName: string;
  file?: File;
}

/**
 * Upload Document Validation Schema
 * Using Yup for validation (consistent with other forms)
 * Note: documentType removed - AI auto-classification handles document type detection
 */
export const uploadDocumentSchema: yup.ObjectSchema<UploadDocumentFormData> = yup.object({
  documentName: yup
    .string()
    .required('Document name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must be less than 255 characters'),

  file: yup
    .mixed<File>()
    .optional(),
});

// Re-export for convenience
export type { UploadDocumentFormData as UploadFormData };
