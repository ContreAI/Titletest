import { describe, it, expect, beforeEach } from 'vitest';
import { useDealStagesStore } from '../store/dealStages.store';

describe('Deal Stages Store', () => {
  const defaultStages = [
    { name: 'Active', color: '#9DBFBF' },
    { name: 'Post EM', color: '#78909C' },
    { name: 'Inspection Cleared', color: '#35B084' },
    { name: 'Ready for Close', color: '#264E36' },
  ];

  beforeEach(() => {
    // Reset to default stages
    useDealStagesStore.getState().resetColors();
  });

  describe('initial state', () => {
    it('should have default stages', () => {
      const state = useDealStagesStore.getState();
      expect(state.stages).toHaveLength(4);
      expect(state.stages.map((s) => s.name)).toEqual([
        'Active',
        'Post EM',
        'Inspection Cleared',
        'Ready for Close',
      ]);
    });

    it('should have correct default colors', () => {
      const state = useDealStagesStore.getState();
      expect(state.stages[0].color).toBe('#9DBFBF');
      expect(state.stages[1].color).toBe('#78909C');
      expect(state.stages[2].color).toBe('#35B084');
      expect(state.stages[3].color).toBe('#264E36');
    });
  });

  describe('getStageColor', () => {
    it('should return correct color for existing stage', () => {
      const color = useDealStagesStore.getState().getStageColor('Active');
      expect(color).toBe('#9DBFBF');
    });

    it('should return correct color for Post EM stage', () => {
      const color = useDealStagesStore.getState().getStageColor('Post EM');
      expect(color).toBe('#78909C');
    });

    it('should return correct color for Inspection Cleared stage', () => {
      const color = useDealStagesStore.getState().getStageColor('Inspection Cleared');
      expect(color).toBe('#35B084');
    });

    it('should return correct color for Ready for Close stage', () => {
      const color = useDealStagesStore.getState().getStageColor('Ready for Close');
      expect(color).toBe('#264E36');
    });

    it('should return default gray for non-existent stage', () => {
      const color = useDealStagesStore.getState().getStageColor('Unknown Stage');
      expect(color).toBe('#E2E8E9');
    });
  });

  describe('updateStageColor', () => {
    it('should update color for existing stage', () => {
      useDealStagesStore.getState().updateStageColor('Active', '#FF0000');
      expect(useDealStagesStore.getState().getStageColor('Active')).toBe('#FF0000');
    });

    it('should not affect other stages when updating one', () => {
      useDealStagesStore.getState().updateStageColor('Active', '#FF0000');
      expect(useDealStagesStore.getState().getStageColor('Post EM')).toBe('#78909C');
      expect(useDealStagesStore.getState().getStageColor('Inspection Cleared')).toBe('#35B084');
    });

    it('should handle updating multiple stages', () => {
      useDealStagesStore.getState().updateStageColor('Active', '#111111');
      useDealStagesStore.getState().updateStageColor('Post EM', '#222222');
      useDealStagesStore.getState().updateStageColor('Inspection Cleared', '#333333');

      expect(useDealStagesStore.getState().getStageColor('Active')).toBe('#111111');
      expect(useDealStagesStore.getState().getStageColor('Post EM')).toBe('#222222');
      expect(useDealStagesStore.getState().getStageColor('Inspection Cleared')).toBe('#333333');
    });

    it('should not modify state for non-existent stage', () => {
      const beforeStages = [...useDealStagesStore.getState().stages];
      useDealStagesStore.getState().updateStageColor('NonExistent', '#FF0000');
      const afterStages = useDealStagesStore.getState().stages;

      expect(afterStages.length).toBe(beforeStages.length);
      // All stages should remain unchanged
      afterStages.forEach((stage, index) => {
        expect(stage.color).toBe(beforeStages[index].color);
      });
    });
  });

  describe('resetColors', () => {
    it('should reset all colors to defaults', () => {
      // Change all colors
      useDealStagesStore.getState().updateStageColor('Active', '#000000');
      useDealStagesStore.getState().updateStageColor('Post EM', '#000000');
      useDealStagesStore.getState().updateStageColor('Inspection Cleared', '#000000');
      useDealStagesStore.getState().updateStageColor('Ready for Close', '#000000');

      // Reset
      useDealStagesStore.getState().resetColors();

      // Verify all colors are back to default
      const state = useDealStagesStore.getState();
      expect(state.stages[0].color).toBe('#9DBFBF');
      expect(state.stages[1].color).toBe('#78909C');
      expect(state.stages[2].color).toBe('#35B084');
      expect(state.stages[3].color).toBe('#264E36');
    });

    it('should restore default stages array', () => {
      useDealStagesStore.getState().updateStageColor('Active', '#FFFFFF');
      useDealStagesStore.getState().resetColors();

      const state = useDealStagesStore.getState();
      expect(state.stages).toEqual(defaultStages);
    });
  });
});
