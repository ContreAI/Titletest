import { useDealStagesStore } from '../store/dealStages.store';

export const useDealStages = () => {
  const stages = useDealStagesStore((state) => state.stages);
  const getStageColor = useDealStagesStore((state) => state.getStageColor);
  const updateStageColor = useDealStagesStore((state) => state.updateStageColor);
  const resetColors = useDealStagesStore((state) => state.resetColors);

  return {
    stages,
    getStageColor,
    updateStageColor,
    resetColors,
  };
};

