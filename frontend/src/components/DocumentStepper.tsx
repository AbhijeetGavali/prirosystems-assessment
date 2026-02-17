import { Stepper, Step, StepLabel, Box, Chip } from '@mui/material';
import { Stage, StageStatus } from '../types';

interface DocumentStepperProps {
  stages: Stage[];
  currentStageNumber: number;
}

export const DocumentStepper = ({ stages, currentStageNumber }: DocumentStepperProps) => {
  const getStepStatus = (stage: Stage) => {
    if (stage.status === StageStatus.APPROVED) return 'completed';
    if (stage.status === StageStatus.REJECTED) return 'error';
    if (stage.stageNumber === currentStageNumber) return 'active';
    return 'pending';
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Stepper activeStep={currentStageNumber - 1} alternativeLabel>
        {stages.map((stage) => {
          const status = getStepStatus(stage);
          return (
            <Step key={stage.stageNumber} completed={stage.status === StageStatus.APPROVED}>
              <StepLabel
                error={stage.status === StageStatus.REJECTED}
                optional={
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Chip
                      label={status}
                      size="small"
                      color={
                        stage.status === StageStatus.APPROVED
                          ? 'success'
                          : stage.status === StageStatus.REJECTED
                          ? 'error'
                          : 'default'
                      }
                    />
                    <Box sx={{ fontSize: '0.75rem', mt: 0.5 }}>{stage.approverId.name}</Box>
                  </Box>
                }
              >
                Stage {stage.stageNumber}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};
