import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useDealStages } from 'modules/dealStages';
import type { DealStageName } from 'types/deals';

interface DealStageColorDialogProps {
  open: boolean;
  onClose: () => void;
}

const DealStageColorDialog = ({ open, onClose }: DealStageColorDialogProps) => {
  const { stages, updateStageColor, resetColors } = useDealStages();
  const [localColors, setLocalColors] = useState<Record<DealStageName, string>>(
    stages.reduce((acc, stage) => ({ ...acc, [stage.name]: stage.color }), {} as Record<DealStageName, string>)
  );

  const handleColorChange = (stageName: DealStageName, color: string) => {
    setLocalColors((prev) => ({ ...prev, [stageName]: color }));
  };

  const handleSave = () => {
    Object.entries(localColors).forEach(([stageName, color]) => {
      updateStageColor(stageName, color);
    });
    onClose();
  };

  const handleReset = () => {
    resetColors();
    // Update local colors to match reset values
    const resetStages = stages.reduce(
      (acc, stage) => ({ ...acc, [stage.name]: stage.color }),
      {} as Record<DealStageName, string>
    );
    setLocalColors(resetStages);
  };

  const handleCancel = () => {
    // Reset local state to current store values
    setLocalColors(
      stages.reduce((acc, stage) => ({ ...acc, [stage.name]: stage.color }), {} as Record<DealStageName, string>)
    );
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Edit Deal Stage Colors
          </Typography>
          <IconButton
            onClick={handleCancel}
            size="small"
            aria-label="Close dialog"
            sx={{
              bgcolor: 'background.elevation1',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <IconifyIcon icon="material-symbols:close" />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3} direction="column">
          {stages.map((stage) => (
            <Stack 
              key={stage.name} 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
              spacing={3}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {stage.name}
              </Typography>
              
              <Box
                sx={{
                  flex: 1,
                  maxWidth: 200,
                  height: 44,
                  borderRadius: 1,
                  bgcolor: localColors[stage.name],
                  border: '2px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="color"
                  value={localColors[stage.name]}
                  onChange={(e) => handleColorChange(stage.name, e.target.value)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </Box>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleReset} 
          color="warning" 
          variant="outlined"
          sx={{ mr: 'auto' }}
        >
          Reset to Default
        </Button>
        <Button 
          onClick={handleCancel} 
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DealStageColorDialog;

