/**
 * OCR Templates Module Types
 * Matches backend template structure
 */

// Job status from Supabase training jobs table
export type TrainingJobStatus = 'pending' | 'processing' | 'completed' | 'error';

// Template record from backend (snake_case from Supabase)
export interface TemplateRecord {
  id: string;
  name: string;
  document_type_info: {
    id: string;
    name: string;
    category: string;
    subcategory?: string; // User-selected category (e.g., 'purchase-sale', 'disclosures')
    region?: string;
    code?: string;
  };
  field_count: number;
  is_canonical: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Training job record
export interface TrainingJob {
  jobId: string;
  status: TrainingJobStatus;
  fileName: string;
  // Result fields (available when completed)
  templateId?: string;
  templateName?: string;
  isExisting?: boolean;
  fieldCount?: number;
  // Error info
  errorMessage?: string;
  // Timestamps
  createdAt: string;
  completedAt?: string;
}

// Store interface
export interface OcrTemplatesStore {
  // State
  templates: TemplateRecord[];
  templatesByCategory: Record<string, TemplateRecord[]>;
  currentTrainingJob: TrainingJob | null;
  isLoading: boolean;
  isTraining: boolean;

  // State setters (NO API calls - use SWR hooks instead)
  setTemplates: (templates: TemplateRecord[]) => void;
  addTemplate: (template: TemplateRecord) => void;
  removeTemplate: (templateId: string) => void;
  setCurrentTrainingJob: (job: TrainingJob | null) => void;
  updateTrainingJobStatus: (status: TrainingJobStatus, result?: Partial<TrainingJob>) => void;
  setLoading: (loading: boolean) => void;
  setTraining: (training: boolean) => void;
  clearTemplates: () => void;
}

// API Response types
export interface GetTemplatesResponse {
  success: boolean;
  data: TemplateRecord[];
  count: number;
}

// Response after axios interceptor unwraps response.data.data
export interface QueueTrainingResponse {
  jobId: string;
  status: TrainingJobStatus;
  fileName: string;
  message: string;
}

// Response after axios interceptor unwraps response.data.data
export type TrainingJobStatusResponse = TrainingJob;
