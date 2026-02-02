import { LinearProgress, Stack, Typography } from '@mui/material';
import { useDealStages } from 'modules/dealStages';

interface LeadSourceItemProps {
  name: string;
  value: number;
  total: number;
}

const LeadSourceItem = ({ name, value, total }: LeadSourceItemProps) => {
  const { getStageColor } = useDealStages();
  const barColor = getStageColor(name);
  
  // Calculate percentage (0-100)
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <Stack spacing={1} direction="column">
      <Typography variant="caption" color="text.secondary">
        {name}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          width: '100%',
          height: 8,
          borderRadius: 0,
          bgcolor: 'background.elevation2',
          '& .MuiLinearProgress-bar': {
            bgcolor: barColor,
          },
        }}
      />
    </Stack>
  );
};

export default LeadSourceItem;
