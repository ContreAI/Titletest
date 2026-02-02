import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

interface MobileScrollIndicatorProps {
  totalColumns: number;
  activeIndex: number;
  onIndicatorClick: (index: number) => void;
}

const MobileScrollIndicator = ({
  totalColumns,
  activeIndex,
  onIndicatorClick,
}: MobileScrollIndicatorProps) => {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      gap={1}
      sx={{
        py: 1.5,
        px: 2,
      }}
    >
      {Array.from({ length: totalColumns }).map((_, index) => (
        <Box
          key={index}
          onClick={() => onIndicatorClick(index)}
          sx={{
            width: activeIndex === index ? 24 : 8,
            height: 8,
            borderRadius: 4,
            bgcolor: (theme) =>
              activeIndex === index
                ? 'primary.main'
                : alpha(theme.palette.text.primary, 0.2),
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: (theme) =>
                activeIndex === index
                  ? 'primary.main'
                  : alpha(theme.palette.text.primary, 0.4),
            },
          }}
        />
      ))}
    </Stack>
  );
};

export default MobileScrollIndicator;
