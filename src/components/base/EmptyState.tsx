import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

/**
 * EmptyState - Standardized empty state component for lists and grids
 * Uses Pacific NW theme styling with dashed border pattern
 */
const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.elevation1',
        p: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {icon && (
        <Box
          sx={{
            color: 'text.disabled',
            opacity: 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        variant="subtitle1"
        sx={{
          color: 'text.primary',
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: 320,
          }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={action.onClick}
          sx={{ mt: 2 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
