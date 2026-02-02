import { useEffect, useState, lazy, Suspense } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';
import type { DocumentSummaryDto } from 'modules/documents';
import { renderTemplate } from '../utils/template-renderer';
import { transformTemplateData } from '../utils/transform-template-data';
import { getTemplateForDocumentType } from '../templates';

// Lazy load Markdown to reduce initial bundle size (react-markdown is heavy)
const Markdown = lazy(() => import('components/base/Markdown'));

// Stable fallback to prevent Suspense re-renders
const MarkdownFallback = <Skeleton variant="rectangular" height={200} />;

interface DocumentReportContentProps {
  summary: DocumentSummaryDto | null;
}

const DocumentReportContent = ({ summary }: DocumentReportContentProps) => {
  const theme = useTheme();
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [templateRenderFailed, setTemplateRenderFailed] = useState<boolean>(false);

  // Debug logging (development only)
  if (import.meta.env.DEV) {
    console.log('[DocumentReportContent] Render with summary:', summary ? {
      id: summary.id,
      documentType: summary.documentType,
      summaryContentLength: summary.summaryContent?.length || 0,
      metadata: summary.metadata,
    } : 'null');
  }

  // Check if there's a template for this document type
  // documentType is stored directly on summary (not in metadata)
  const documentType = summary?.documentType;
  const templateHtml = documentType ? getTemplateForDocumentType(documentType) : null;
  const useTemplate = !!templateHtml;

  // Render template with data from summary (for document types with templates)
  useEffect(() => {
    if (!summary?.summaryContent) {
      setRenderedHtml('');
      setTemplateRenderFailed(false);
      return;
    }

    if (useTemplate && templateHtml) {
      // Use HTML template renderer for document types with templates
      try {
        // Extract JSON object from summaryContent (may have surrounding text)
        const jsonMatch = summary.summaryContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          // document_type_mismatch: No JSON found, self-correct by falling back to markdown
          if (import.meta.env.DEV) {
            console.warn('document_type_mismatch: No JSON object found in summary content, falling back to markdown rendering');
          }
          setTemplateRenderFailed(true);
          setRenderedHtml('');
          return;
        }

        // Parse JSON from extracted content
        const parsedData = JSON.parse(jsonMatch[0]);

        // Basic validation: check if parsed data is an object
        if (typeof parsedData !== 'object' || parsedData === null) {
          // document_type_mismatch: Invalid JSON structure, fall back to markdown
          if (import.meta.env.DEV) {
            console.warn('document_type_mismatch: Invalid JSON structure in summary content, falling back to markdown rendering');
          }
          setTemplateRenderFailed(true);
          setRenderedHtml('');
          return;
        }

        // Transform data to match template structure
        const templateData = transformTemplateData(parsedData);

        // Render template with transformed data
        const rendered = renderTemplate(templateHtml, templateData);
        setRenderedHtml(rendered);
        setTemplateRenderFailed(false);
      } catch (error) {
        // document_type_mismatch: JSON parse failed, self-correct by falling back to markdown
        if (import.meta.env.DEV) {
          console.warn('document_type_mismatch: Failed to parse summary content as JSON, falling back to markdown rendering', error);
        }
        setTemplateRenderFailed(true);
        setRenderedHtml('');
      }
    } else {
      // For other document types, don't render HTML template
      setRenderedHtml('');
      setTemplateRenderFailed(false);
    }
  }, [summary, useTemplate, templateHtml]);

  return (
    <Box>
      {summary ? (
        useTemplate && !templateRenderFailed ? (
          // Render HTML template for document types with templates
          <Box
            sx={{
              width: '100%',
              '& iframe': {
                width: '100%',
                border: 'none',
                minHeight: '800px',
              },
            }}
          >
            <iframe
              title="Document Report"
              srcDoc={renderedHtml}
              style={{
                width: '100%',
                border: 'none',
                minHeight: '800px',
              }}
              sandbox="allow-same-origin"
            />
          </Box>
        ) : (
          // Render markdown for other document types or as fallback for template failures
          <Box
            sx={{
              color: 'text.primary',
              lineHeight: 1.7,
            }}
          >
            <Suspense fallback={MarkdownFallback}>
              <Markdown variant="body1">{summary.summaryContent || ''}</Markdown>
            </Suspense>
          </Box>
        )
      ) : (
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 1,
            bgcolor: 'grey.50',
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <IconifyIcon
            icon="mdi:file-document-alert-outline"
            width={40}
            height={40}
            style={{ color: theme.palette.grey[400], marginBottom: 12, opacity: 0.6 }}
          />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            }}
          >
            No summary available for this document.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentReportContent;

