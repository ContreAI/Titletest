import { Chip, Stack, Typography } from '@mui/material';

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  variant?: 'chip' | 'link' | 'text';
  chipColor?: string;
  fontColor?: string;
}

const InfoRow = ({ label, value, variant = 'text', chipColor, fontColor = 'text.primary' }: InfoRowProps) => {
  // Use theme colors if chipColor not provided
  const defaultChipColor = chipColor || 'grey.100';
  // Ensure value is always a string and has content to maintain container visibility
  const displayValue = value || '';
  
  return (
    <Stack direction="column" spacing={0} alignItems="flex-start"  pt={1} px={1} sx={{ minHeight: variant === 'chip' ? 40 : 24 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 800 }}>
        {label}
      </Typography>
      {variant === 'chip' ? (
        <Chip
          label={displayValue}
          size="small"
          sx={{
            bgcolor: defaultChipColor,
            color: fontColor,
            px: 2,
            ml: -0.5,
            py: 0.5,
            borderRadius: 4,
            minHeight: 32,
            visibility: displayValue ? 'visible' : 'visible',
            '& .MuiChip-label': {
              fontWeight: 800,
              px: 0,
            },
          }}
        />
      ) : variant === 'link' ? (
        <Typography
          variant="body2"
          sx={{
            textDecoration: 'underline',
            color: 'text.secondary',
            fontWeight: 400,
            minHeight: 20,
          }}
        >
          {displayValue}
        </Typography>
      ) : (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary', 
            fontWeight: 400,
            minHeight: 20,
          }}
        >
          {displayValue}
        </Typography>
      )}
    </Stack>
  );
};

export default InfoRow;

