/**
 * Document Type Correction Badge Component
 *
 * Displays an info badge when AI detects and corrects the document type.
 * Shows a hover popover with correction details.
 */

import { useState } from 'react';
import { Box, Popover, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface DocumentTypeCorrectionBadgeProps {
  /** Original document type selected by user */
  originalDocumentType: string;
  /** AI-corrected document type */
  correctedDocumentType: string;
}

const DocumentTypeCorrectionBadge = ({
  originalDocumentType,
  correctedDocumentType,
}: DocumentTypeCorrectionBadgeProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        component="span"
        onClick={handleClick}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Document type corrected by AI"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          backgroundColor: alpha(theme.palette.info.main, 0.08),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          borderRadius: '50%',
          width: 18,
          height: 18,
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease-in-out',
          '&:hover': {
            backgroundColor: alpha(theme.palette.info.main, 0.12),
            borderColor: alpha(theme.palette.info.main, 0.3),
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.info.main}`,
            outlineOffset: 1,
          },
        }}
      >
        <IconifyIcon
          icon="mdi:information"
          sx={{
            fontSize: 12,
            color: 'info.main',
          }}
        />
      </Box>

      {/* Correction info popover */}
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
              minWidth: 240,
              maxWidth: 320,
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
          <IconifyIcon icon="mdi:robot" sx={{ fontSize: 16, color: 'info.main' }} />
          AI Corrected Document Type
        </Typography>

        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
        >
          Based on document analysis, AI detected a different document type than originally selected.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 1.5,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                fontSize: '0.6875rem',
              }}
            >
              Original Selection
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 0.25,
                fontSize: '0.8125rem',
              }}
            >
              {originalDocumentType}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconifyIcon
              icon="mdi:arrow-down"
              sx={{ fontSize: 16, color: 'info.main' }}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                fontSize: '0.6875rem',
              }}
            >
              AI-Detected Type
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'info.main',
                fontWeight: 600,
                mt: 0.25,
                fontSize: '0.8125rem',
              }}
            >
              {correctedDocumentType}
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default DocumentTypeCorrectionBadge;
