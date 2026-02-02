import { ReactNode } from 'react';
import { Box, Typography, Stack, SxProps, Theme } from '@mui/material';

type HeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface SectionHeaderProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Heading level for accessibility (h2-h6)
   * @default 'h3'
   */
  level?: HeadingLevel;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Optional action button/link on the right side
   */
  action?: ReactNode;
  /**
   * Additional styles for the container
   */
  sx?: SxProps<Theme>;
}

const levelToVariant: Record<HeadingLevel, 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

/**
 * Unified section header component for content sections:
 * - Section title (h2-h4)
 * - Optional description
 * - Optional action link/button
 */
const SectionHeader = ({
  title,
  level = 'h3',
  description,
  action,
  sx,
}: SectionHeaderProps) => {
  return (
    <Box sx={sx}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems={description ? 'flex-start' : 'center'}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant={levelToVariant[level]}
            component={level}
            sx={{
              fontWeight: 600,
              fontSize: level === 'h2' ? '1.25rem' : '1.125rem',
              mb: description ? 0.5 : 0,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0, ml: 2 }}>{action}</Box>}
      </Stack>
    </Box>
  );
};

export default SectionHeader;
