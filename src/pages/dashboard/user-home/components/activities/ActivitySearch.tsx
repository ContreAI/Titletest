import { Box, InputAdornment, TextField } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface ActivitySearchProps {
  value: string;
  onChange: (value: string) => void;
}

const ActivitySearch = ({ value, onChange }: ActivitySearchProps) => {
  return (
    <Box sx={{ mt: 1.5 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search an activity"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconifyIcon icon="material-symbols:search" sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiInputBase-input': {
            py: '8px !important',
          },
          '& .MuiInputAdornment-root': {
            marginTop: '0 !important',
          },
        }}
      />
    </Box>
  );
};

export default ActivitySearch;

