import { useOcrTemplatesStore } from '../store/ocr-templates.store';

/**
 * Custom hook to access OCR templates store
 * State only - use SWR hooks (useTemplateApi) for API calls
 */
export const useOcrTemplates = () => {
  const templates = useOcrTemplatesStore((state) => state.templates);
  const templatesByCategory = useOcrTemplatesStore((state) => state.templatesByCategory);
  const currentTrainingJob = useOcrTemplatesStore((state) => state.currentTrainingJob);
  const isLoading = useOcrTemplatesStore((state) => state.isLoading);
  const isTraining = useOcrTemplatesStore((state) => state.isTraining);

  // State setters
  const setTemplates = useOcrTemplatesStore((state) => state.setTemplates);
  const addTemplate = useOcrTemplatesStore((state) => state.addTemplate);
  const removeTemplate = useOcrTemplatesStore((state) => state.removeTemplate);
  const setCurrentTrainingJob = useOcrTemplatesStore((state) => state.setCurrentTrainingJob);
  const updateTrainingJobStatus = useOcrTemplatesStore((state) => state.updateTrainingJobStatus);
  const setLoading = useOcrTemplatesStore((state) => state.setLoading);
  const setTraining = useOcrTemplatesStore((state) => state.setTraining);
  const clearTemplates = useOcrTemplatesStore((state) => state.clearTemplates);

  // Helper to get templates for a specific category
  const getTemplatesForCategory = (categoryId: string) => {
    return templatesByCategory[categoryId] || [];
  };

  return {
    // State
    templates,
    templatesByCategory,
    currentTrainingJob,
    isLoading,
    isTraining,

    // Helpers
    getTemplatesForCategory,

    // Setters
    setTemplates,
    addTemplate,
    removeTemplate,
    setCurrentTrainingJob,
    updateTrainingJobStatus,
    setLoading,
    setTraining,
    clearTemplates,
  };
};
