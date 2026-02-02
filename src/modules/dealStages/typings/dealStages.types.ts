import { DealStageName } from 'types/deals';

export interface DealStageConfig {
  name: DealStageName;
  color: string;
}

export interface DealStagesStore {
  stages: DealStageConfig[];
  getStageColor: (stageName: string) => string;
  updateStageColor: (stageName: string, color: string) => void;
  resetColors: () => void;
}

