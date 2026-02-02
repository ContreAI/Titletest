/**
 * Citation Chip Component
 *
 * Inline citation display for document sources referenced in AI responses.
 * Styled as a small chip with monospace font, clickable to open document preview.
 */

import { Box, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface CitationChipProps {
  /** Document name (e.g., "Purchase Agreement") */
  documentName: string;
  /** Section reference (e.g., "Section 2" or "Page 3") */
  section?: string;
  /** Document ID for navigation */
  documentId?: string;
  /** Relevance score (0-1) for tooltip display */
  score?: number;
  /** Callback when citation is clicked */
  onClick?: (documentId: string, section?: string) => void;
}

const CitationChip = ({
  documentName,
  section,
  documentId,
  score,
  onClick,
}: CitationChipProps) => {
  const theme = useTheme();

  const handleClick = () => {
    if (onClick && documentId) {
      onClick(documentId, section);
    }
  };

  const tooltipContent = (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {documentName}
      </Typography>
      {section && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {section}
        </Typography>
      )}
      {score !== undefined && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <IconifyIcon icon="mdi:check-circle" sx={{ fontSize: 12, color: 'success.main' }} />
          {Math.round(score * 100)}% relevance
        </Typography>
      )}
      {onClick && documentId && (
        <Typography
          variant="caption"
          sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}
        >
          Click to view source
        </Typography>
      )}
    </Box>
  );

  // Format display text
  const displayText = section ? `${documentName}, ${section}` : documentName;
  // Truncate long names
  const truncatedText =
    displayText.length > 35 ? `${displayText.substring(0, 32)}...` : displayText;

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      <Box
        component="span"
        onClick={handleClick}
        role={onClick && documentId ? 'button' : undefined}
        tabIndex={onClick && documentId ? 0 : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick && documentId) {
            e.preventDefault();
            handleClick();
          }
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          backgroundColor: alpha(theme.palette.secondary.main, 0.12),
          borderRadius: '4px',
          px: 0.75,
          py: 0.25,
          mx: 0.5,
          fontSize: '0.75rem',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'secondary.dark',
          cursor: onClick && documentId ? 'pointer' : 'default',
          transition: 'all 150ms ease-in-out',
          verticalAlign: 'middle',
          '&:hover': onClick &&
            documentId && {
              backgroundColor: alpha(theme.palette.secondary.main, 0.2),
              textDecoration: 'underline',
            },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 1,
          },
        }}
      >
        <IconifyIcon
          icon="mdi:file-document-outline"
          sx={{ fontSize: 12, flexShrink: 0 }}
        />
        [{truncatedText}]
      </Box>
    </Tooltip>
  );
};

export default CitationChip;
