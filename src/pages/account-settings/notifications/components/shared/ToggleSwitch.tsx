import { Box, Typography, Switch } from '@mui/material';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontFamily: (theme) => theme.typography.fontFamily,
          color: 'text.secondary',
        }}
      >
        Off
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          color="primary"
          sx={{
            width: 44,
            height: 24,
            padding: 0,
            '& .MuiSwitch-switchBase': {
              padding: '2px',
              '&.Mui-checked': {
                transform: 'translateX(20px)',
              },
            },
            '& .MuiSwitch-thumb': {
              width: 16,
              height: 16,
              boxShadow: 'none',
            },
            '& .MuiSwitch-track': {
              borderRadius: 17,
              backgroundColor: checked ? 'primary.main' : 'action.disabledBackground',
              opacity: 1,
            },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontFamily: (theme) => theme.typography.fontFamily,
          color: 'text.secondary',
        }}
      >
        On
      </Typography>
    </Box>
  );
};

export default ToggleSwitch;

