/**
 * Calculated Value Component
 *
 * Displays values that were calculated (not directly extracted) from documents.
 * Shows a calculator icon and provides a hover popover with calculation breakdown.
 */

import { useState } from 'react';
import { Box, Popover, Typography, Divider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface CalculationStep {
  /** Label for the step (e.g., "Base date", "Inspection period") */
  label: string;
  /** Value for the step (e.g., "January 15, 2026", "10 days") */
  value: string;
  /** Operation symbol (e.g., "+", "-", "=") */
  operation?: '+' | '-' | '=' | 'x' | '÷';
}

export interface CalculatedValueProps {
  /** The calculated value to display */
  value: string;
  /** Steps showing how the value was calculated */
  calculationSteps?: CalculationStep[];
  /** Description of what was calculated */
  description?: string;
  /** Whether to show inline or as a block */
  display?: 'inline' | 'block';
}

const CalculatedValue = ({
  value,
  calculationSteps,
  description,
  display = 'inline',
}: CalculatedValueProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (calculationSteps?.length) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const hasBreakdown = calculationSteps && calculationSteps.length > 0;

  const content = (
    <Box
      component={display === 'inline' ? 'span' : 'div'}
      onClick={handleClick}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if ((e.key === 'Enter' || e.key === ' ') && hasBreakdown) {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent<HTMLElement>);
        }
      }}
      role={hasBreakdown ? 'button' : undefined}
      tabIndex={hasBreakdown ? 0 : undefined}
      aria-haspopup={hasBreakdown ? 'true' : undefined}
      aria-expanded={hasBreakdown ? open : undefined}
      sx={{
        display: display === 'inline' ? 'inline-flex' : 'flex',
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: '16px',
        px: 1.5,
        py: 0.5,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'primary.dark',
        cursor: hasBreakdown ? 'pointer' : 'default',
        transition: 'all 150ms ease-in-out',
        verticalAlign: 'middle',
        '&:hover': hasBreakdown
          ? {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              borderColor: alpha(theme.palette.primary.main, 0.3),
            }
          : undefined,
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 1,
        },
      }}
    >
      <IconifyIcon
        icon="mdi:calculator-variant"
        sx={{
          fontSize: 14,
          color: 'primary.main',
          flexShrink: 0,
        }}
      />
      {value}
      {hasBreakdown && (
        <IconifyIcon
          icon="mdi:information-outline"
          sx={{
            fontSize: 12,
            color: 'primary.light',
            ml: 0.25,
          }}
        />
      )}
    </Box>
  );

  return (
    <>
      {content}

      {/* Calculation breakdown popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              minWidth: 220,
              maxWidth: 300,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              border: `1px solid ${theme.palette.divider}`,
            },
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <IconifyIcon icon="mdi:calculator-variant" sx={{ fontSize: 16 }} />
          Calculated Value
        </Typography>

        {description && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
          >
            {description}
          </Typography>
        )}

        <Box sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {calculationSteps?.map((step, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
              }}
            >
              {step.operation && (
                <Typography
                  variant="caption"
                  sx={{
                    width: 16,
                    textAlign: 'center',
                    color: step.operation === '=' ? 'primary.main' : 'text.secondary',
                    fontWeight: step.operation === '=' ? 700 : 400,
                  }}
                >
                  {step.operation}
                </Typography>
              )}
              {!step.operation && <Box sx={{ width: 16 }} />}
              <Typography
                variant="caption"
                sx={{
                  flex: 1,
                  color: 'text.secondary',
                }}
              >
                {step.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: step.operation === '=' ? 700 : 500,
                  color: step.operation === '=' ? 'primary.main' : 'text.primary',
                }}
              >
                {step.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {calculationSteps && calculationSteps.length > 1 && (
          <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
        )}

        <Typography
          variant="caption"
          sx={{
            color: 'text.tertiary',
            display: 'block',
            fontStyle: 'italic',
          }}
        >
          Verify with your agent or attorney
        </Typography>
      </Popover>
    </>
  );
};

export default CalculatedValue;
