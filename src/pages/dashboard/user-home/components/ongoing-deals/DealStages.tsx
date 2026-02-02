import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import { useDealStages } from 'modules/dealStages';
import type { DealStage } from 'types/deals';

interface DealStagesProps {
  stages: DealStage[];
}

const DealStages = ({ stages }: DealStagesProps) => {
  const { getStageColor } = useDealStages();
  const isFirst = (index: number) => index === 0;
  const isLast = (index: number) => index === stages.length - 1;

  return (
    <Grid container spacing={0.25} sx={{ pointerEvents: 'none' }}>
      {stages.map((stage, index) => (
        <Grid key={index} size={{ xs: 6, sm: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              px: 1.5,
              py: .75,
              height: '100%',
              borderTopLeftRadius: isFirst(index) ? 6 : 0,
              borderBottomLeftRadius: isFirst(index) ? 6 : 0,
              borderTopRightRadius: isLast(index) ? 6 : 0,
              borderBottomRightRadius: isLast(index) ? 6 : 0,
              bgcolor: stage.completed
                ? getStageColor(stage.name)
                : 'background.elevation2',
              color: stage.completed ? 'white' : 'text.primary',
            }}
          >
            {stage.completed && (
              <IconifyIcon icon="material-symbols:check-circle" sx={{ fontSize: 16 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                textWrap: 'auto',
              }}
            >
              {stage.name}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default DealStages;

