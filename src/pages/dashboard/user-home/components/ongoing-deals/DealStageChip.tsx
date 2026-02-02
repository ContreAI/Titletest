import { Chip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useDealStages } from 'modules/dealStages';
import type { DealStageName } from 'types/deals';

interface DealStageChipProps {
  name: DealStageName;
  completed: boolean;
}

const DealStageChip = ({ name, completed }: DealStageChipProps) => {
  const { getStageColor } = useDealStages();

  return (
    <Chip
      label={name}
      icon={
        completed ? (
          <IconifyIcon icon="material-symbols:check" sx={{ fontSize: 16 }} />
        ) : undefined
      }
      size="small"
      sx={{
        width: '100%',
        bgcolor: completed ? getStageColor(name) : 'grey.200',
        color: completed ? 'white' : 'text.secondary',
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: 'white',
        },
      }}
    />
  );
};

export default DealStageChip;

