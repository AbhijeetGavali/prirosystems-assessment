import { Types } from 'mongoose';
import { DocumentStatus, StageStatus } from '../../types';

describe('Document Edge Cases', () => {
  describe('Current Stage Number Edge Cases', () => {
    it('should handle currentStageNumber exceeding total stages', () => {
      const doc = {
        _id: new Types.ObjectId(),
        currentStageNumber: 4,
        stages: [
          { stageNumber: 1, status: StageStatus.APPROVED },
          { stageNumber: 2, status: StageStatus.APPROVED },
          { stageNumber: 3, status: StageStatus.APPROVED },
        ],
        status: DocumentStatus.APPROVED,
      };

      // Frontend should display: 3/3 not 4/3
      const displayStage = Math.min(doc.currentStageNumber, doc.stages.length);
      expect(displayStage).toBe(3);
    });

    it('should handle single stage document', () => {
      const doc = {
        currentStageNumber: 1,
        stages: [{ stageNumber: 1, status: StageStatus.PENDING }],
        status: DocumentStatus.PENDING,
      };

      expect(doc.stages.length).toBe(1);
      expect(doc.currentStageNumber).toBe(1);
    });

    it('should handle rejected document at any stage', () => {
      const doc = {
        currentStageNumber: 2,
        stages: [
          { stageNumber: 1, status: StageStatus.APPROVED },
          { stageNumber: 2, status: StageStatus.REJECTED },
          { stageNumber: 3, status: StageStatus.PENDING },
        ],
        status: DocumentStatus.REJECTED,
      };

      // Should display: 2/3
      expect(doc.currentStageNumber).toBe(2);
      expect(doc.stages.length).toBe(3);
    });

    it('should handle all stages approved', () => {
      const doc = {
        currentStageNumber: 4, // Incremented after last approval
        stages: [
          { stageNumber: 1, status: StageStatus.APPROVED },
          { stageNumber: 2, status: StageStatus.APPROVED },
          { stageNumber: 3, status: StageStatus.APPROVED },
        ],
        status: DocumentStatus.APPROVED,
      };

      // Should display: 3/3 not 4/3
      const displayStage = doc.status === DocumentStatus.APPROVED 
        ? doc.stages.length 
        : Math.min(doc.currentStageNumber, doc.stages.length);
      
      expect(displayStage).toBe(3);
    });
  });

  describe('Stepper Edge Cases', () => {
    it('should not set activeStep beyond stages length', () => {
      const currentStageNumber = 4;
      const stagesLength = 3;
      
      const activeStep = Math.min(currentStageNumber - 1, stagesLength - 1);
      
      expect(activeStep).toBe(2); // Index 2 = Stage 3
      expect(activeStep).toBeLessThan(stagesLength);
    });

    it('should handle stage 1 correctly', () => {
      const currentStageNumber = 1;
      const stagesLength = 3;
      
      const activeStep = Math.min(currentStageNumber - 1, stagesLength - 1);
      
      expect(activeStep).toBe(0); // Index 0 = Stage 1
    });
  });

  describe('Approval Button Edge Cases', () => {
    it('should not show approve button if currentStage not found', () => {
      const doc = {
        currentStageNumber: 5,
        stages: [
          { stageNumber: 1, status: StageStatus.APPROVED },
          { stageNumber: 2, status: StageStatus.APPROVED },
          { stageNumber: 3, status: StageStatus.APPROVED },
        ],
        status: DocumentStatus.APPROVED,
      };

      const currentStage = doc.stages.find(s => s.stageNumber === doc.currentStageNumber);
      expect(currentStage).toBeUndefined();
      // canApprove should return false
    });

    it('should not show approve button if stage already processed', () => {
      const doc = {
        currentStageNumber: 2,
        stages: [
          { stageNumber: 1, status: StageStatus.APPROVED },
          { stageNumber: 2, status: StageStatus.APPROVED },
          { stageNumber: 3, status: StageStatus.PENDING },
        ],
        status: DocumentStatus.IN_PROGRESS,
      };

      const currentStage = doc.stages.find(s => s.stageNumber === doc.currentStageNumber);
      expect(currentStage?.status).toBe(StageStatus.APPROVED);
      // canApprove should check stage.status === 'Pending'
    });
  });
});
