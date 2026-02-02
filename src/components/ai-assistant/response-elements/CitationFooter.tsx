/**
 * Citation Footer Component
 *
 * Aggregated list of all document sources referenced in an AI response.
 * Collapsible section displayed at the bottom of the message.
 */

import { useState } from 'react';
import { Box, Collapse, Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

export interface Citation {
  /** Unique identifier for the citation */
  id: string;
  /** Document name */
  documentName: string;
  /** Section or page reference */
  section?: string;
  /** Document ID for navigation */
  documentId: string;
  /** Relevance score (0-1) */
  score?: number;
}

export interface CitationFooterProps {
  /** List of citations to display */
  citations: Citation[];
  /** Callback when a citation is clicked */
  onCitationClick?: (documentId: string, section?: string) => void;
  /** Initially expanded state (default: false) */
  defaultExpanded?: boolean;
}

const CitationFooter = ({
  citations,
  onCitationClick,
  defaultExpanded = false,
}: CitationFooterProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!citations.length) {
    return null;
  }

  // Group citations by document
  const groupedCitations = citations.reduce(
    (acc, citation) => {
      const key = citation.documentId;
      if (!acc[key]) {
        acc[key] = {
          documentName: citation.documentName,
          documentId: citation.documentId,
          sections: [],
        };
      }
      if (citation.section && !acc[key].sections.includes(citation.section)) {
        acc[key].sections.push(citation.section);
      }
      return acc;
    },
    {} as Record<string, { documentName: string; documentId: string; sections: string[] }>
  );

  const groupedList = Object.values(groupedCitations);

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 1, borderStyle: 'dashed', opacity: 0.5 }} />

      {/* Header - clickable to expand/collapse */}
      <Box
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        role="button"
        tabIndex={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          cursor: 'pointer',
          py: 0.5,
          px: 1,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.04),
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 1,
          },
        }}
      >
        <IconifyIcon
          icon="mdi:file-document-multiple-outline"
          sx={{ fontSize: 16, color: 'text.secondary' }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            flex: 1,
          }}
        >
          Sources ({citations.length})
        </Typography>
        <IconifyIcon
          icon={expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
          sx={{
            fontSize: 16,
            color: 'text.secondary',
            transition: 'transform 200ms ease-in-out',
          }}
        />
      </Box>

      {/* Expanded content */}
      <Collapse in={expanded} timeout={200}>
        <List dense disablePadding sx={{ pl: 1, pt: 0.5 }}>
          {groupedList.map((group) => (
            <ListItem
              key={group.documentId}
              onClick={() => onCitationClick?.(group.documentId)}
              sx={{
                py: 0.5,
                px: 1,
                borderRadius: 1,
                cursor: onCitationClick ? 'pointer' : 'default',
                '&:hover': onCitationClick
                  ? {
                      backgroundColor: alpha(theme.palette.action.hover, 0.08),
                    }
                  : undefined,
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <IconifyIcon
                  icon="mdi:file-document-outline"
                  sx={{ fontSize: 14, color: 'secondary.main' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {group.documentName}
                  </Typography>
                }
                secondary={
                  group.sections.length > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                      }}
                    >
                      {group.sections.join(', ')}
                    </Typography>
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

export default CitationFooter;
