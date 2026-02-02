import { Typography, TypographyProps } from '@mui/material';
import { fontFamilies } from 'theme/typography';

/**
 * MonospaceText component for displaying numbers, codes, and IDs
 * Uses JetBrains Mono font family
 */
const MonospaceText = ({ sx, ...props }: TypographyProps) => {
  return (
    <Typography
      {...props}
      sx={{
        fontFamily: fontFamilies.monospace,
        ...sx,
      }}
    />
  );
};

export default MonospaceText;

