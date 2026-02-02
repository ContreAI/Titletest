import { create } from 'zustand';
import {
  OcrTemplatesStore,
  TemplateRecord,
  TrainingJob,
  TrainingJobStatus,
} from '../typings/ocr-templates.types';

/**
 * OCR Templates Store
 * State management only - NO API calls
 * Use SWR hooks (useTemplateApi) for API calls
 */
export const useOcrTemplatesStore = create<OcrTemplatesStore>((set, get) => ({
  templates: [],
  templatesByCategory: {},
  currentTrainingJob: null,
  isLoading: false,
  isTraining: false,

  // State setters
  setTemplates: (templates: TemplateRecord[]) => {
    // Group templates by subcategory (user-selected category like 'purchase-sale')
    // Falls back to 'other' if no subcategory is set
    const grouped: Record<string, TemplateRecord[]> = {};
    templates.forEach((template) => {
      const category = template.document_type_info?.subcategory || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });

    set({ templates, templatesByCategory: grouped });
  },

  addTemplate: (template: TemplateRecord) => {
    const currentTemplates = get().templates;
    const newTemplates = [...currentTemplates, template];

    // Re-group by subcategory
    const grouped: Record<string, TemplateRecord[]> = {};
    newTemplates.forEach((t) => {
      const category = t.document_type_info?.subcategory || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(t);
    });

    set({ templates: newTemplates, templatesByCategory: grouped });
  },

  removeTemplate: (templateId: string) => {
    const newTemplates = get().templates.filter((t) => t.id !== templateId);

    // Re-group by subcategory
    const grouped: Record<string, TemplateRecord[]> = {};
    newTemplates.forEach((t) => {
      const category = t.document_type_info?.subcategory || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(t);
    });

    set({ templates: newTemplates, templatesByCategory: grouped });
  },

  setCurrentTrainingJob: (job: TrainingJob | null) => {
    set({ currentTrainingJob: job });
  },

  updateTrainingJobStatus: (status: TrainingJobStatus, result?: Partial<TrainingJob>) => {
    const currentJob = get().currentTrainingJob;
    if (currentJob) {
      set({
        currentTrainingJob: {
          ...currentJob,
          status,
          ...result,
        },
      });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setTraining: (training: boolean) => set({ isTraining: training }),

  clearTemplates: () => {
    set({
      templates: [],
      templatesByCategory: {},
      currentTrainingJob: null,
    });
  },
}));
