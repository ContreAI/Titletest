import { Box, SxProps, Theme } from '@mui/material';
import { dashboardSpacing } from 'theme/spacing';

export interface SectionDividerProps {
  /**
   * Variant of the divider
   * - 'line': A subtle horizontal line divider
   * - 'spacer': Just vertical spacing without a line
   * @default 'line'
   */
  variant?: 'line' | 'spacer';
  /**
   * Additional styles for the container
   */
  sx?: SxProps<Theme>;
}

/**
 * Section divider component for visual separation between major content blocks.
 * Use between sections to create visual breathing room and hierarchy.
 */
const SectionDivider = ({ variant = 'line', sx }: SectionDividerProps) => {
  if (variant === 'spacer') {
    return (
      <Box
        sx={{
          height: (theme) => theme.spacing(dashboardSpacing.sectionSpacing),
          ...sx,
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        py: dashboardSpacing.sectionSpacing / 2,
        ...sx,
      }}
      aria-hidden="true"
    >
      <Box
        sx={{
          height: '1px',
          width: '100%',
          bgcolor: 'dividerLight',
        }}
      />
    </Box>
  );
};

export default SectionDivider;
