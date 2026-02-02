import { LinearProgress } from '@mui/material';

interface DealProgressBarProps {
  completedStages: number;
  totalStages: number;
}

const DealProgressBar = ({ completedStages, totalStages }: DealProgressBarProps) => {
  const progress = (completedStages / totalStages) * 100;

  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 6,
        borderRadius: 1,
        bgcolor: 'background.elevation2',
        '& .MuiLinearProgress-bar': {
          bgcolor: 'success.main',
        },
      }}
    />
  );
};

export default DealProgressBar;

