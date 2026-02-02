import { Box, Typography, Stack, Chip } from '@mui/material';
import { Settings } from '@mui/icons-material';
import type { Document } from 'modules/documents';
import { getStatusConfig } from '../utils/document-status.utils';
import DocumentTypeCorrectionBadge from './DocumentTypeCorrectionBadge';

interface DocumentRowInfoProps {
  doc: Document;
  hasReport: boolean;
}

const DocumentRowInfo = ({ doc, hasReport: _hasReport }: DocumentRowInfoProps) => {
  const statusConfig = getStatusConfig(doc.parsedStatus, doc.processingStep, doc.progressPercentage);
  const isProcessing = doc.parsedStatus === 'processing' && doc.processingStep;

  return (
    <Box
      sx={{
        flex: 1,
        textAlign: 'left',
        p: 0,
        minWidth: 0,
        width: { xs: '100%', md: 'auto' },
      }}
    >
      <Stack spacing={0.5}>
        {/* Document name + type badge */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
          <Typography
            className="doc-title"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.4,
              transition: 'color 0.15s ease',
            }}
          >
            {doc.documentName}
          </Typography>
          {doc.documentType && (
            <>
              <Chip
                label={doc.documentType}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '10px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  bgcolor: 'background.elevation1',
                  color: 'text.secondary',
                  borderRadius: '9999px',
                  '& .MuiChip-label': { px: 1, py: 0.25 },
                }}
              />
              {doc.documentTypeCorrected && doc.originalDocumentType && (
                <DocumentTypeCorrectionBadge
                  originalDocumentType={doc.originalDocumentType}
                  correctedDocumentType={doc.documentType}
                />
              )}
            </>
          )}
        </Stack>

        {/* Status pill + uploaded date */}
        <Stack spacing={0.5}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexWrap="wrap"
            sx={{ fontSize: '11px', color: 'text.secondary' }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: '9999px',
                bgcolor: statusConfig.bgColor,
                fontSize: '10px',
                fontWeight: 500,
                color: statusConfig.textColor,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: statusConfig.dotColor,
                  ...(isProcessing && {
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        opacity: 1,
                      },
                      '50%': {
                        opacity: 0.5,
                      },
                    },
                  }),
                }}
              />
              {statusConfig.label}
            </Box>
            {doc.createdAt && (
              <Typography component="span" sx={{ color: 'text.disabled', fontSize: '11px' }}>
                · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
              </Typography>
            )}
          </Stack>

          {/* Processing progress with percentage and message */}
          {isProcessing && statusConfig.message && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                fontSize: '11px',
                color: 'text.secondary',
                pl: 0.5,
              }}
            >
              <Settings
                sx={{
                  fontSize: '14px',
                  color: 'text.secondary',
                  animation: 'spin 2s linear infinite',
                  '@keyframes spin': {
                    '0%': {
                      transform: 'rotate(0deg)',
                    },
                    '100%': {
                      transform: 'rotate(360deg)',
                    },
                  },
                }}
              />
              {doc.progressPercentage !== undefined && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {doc.progressPercentage}%
                </Typography>
              )}
              <Typography
                component="span"
                sx={{
                  fontSize: '11px',
                  color: 'text.secondary',
                }}
              >
                {statusConfig.message}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default DocumentRowInfo;

