import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DealStagesStore } from '../typings/dealStages.types';

const defaultStages = [
  {
    name: 'Active' as const,
    color: '#9DBFBF', // Light muted blue-green/teal (sage/mint green)
  },
  {
    name: 'Post EM' as const,
    color: '#78909C', // Medium slate gray/blue-gray
  },
  {
    name: 'Inspection Cleared' as const,
    color: '#35B084', // Medium to dark olive green/moss green
  },
  {
    name: 'Ready for Close' as const,
    color: '#264E36', // Very dark green
  },
];

export const useDealStagesStore = create<DealStagesStore>()(
  persist(
    (set, get) => ({
      stages: defaultStages,

      getStageColor: (stageName: string) => {
        const stage = get().stages.find((s) => s.name === stageName);
        if (!stage) {
          return '#E2E8E9'; // Default gray
        }
        return stage.color;
      },

      updateStageColor: (stageName: string, color: string) => {
        set((state) => ({
          stages: state.stages.map((stage) =>
            stage.name === stageName ? { ...stage, color } : stage
          ),
        }));
      },

      resetColors: () => {
        set({ stages: defaultStages });
      },
    }),
    {
      name: 'deal-stages-storage',
    }
  )
);

