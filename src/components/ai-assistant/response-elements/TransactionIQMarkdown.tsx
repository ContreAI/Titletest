/**
 * Transaction IQ Markdown Component
 *
 * Enhanced markdown renderer that parses and renders:
 * - Inline citations: [Document Name, Section]
 * - Calculated values: {{calc:value|description}}
 *
 * Built on top of the base Markdown component with custom remark plugins.
 */

import { memo, useMemo, useCallback, Fragment, ReactNode, lazy, Suspense } from 'react';
import { Tooltip, Typography, Box, Skeleton } from '@mui/material';
import type { MarkdownProps } from 'components/base/Markdown';
import IconifyIcon from 'components/base/IconifyIcon';
import { MarkdownCitation, MarkdownCalculatedValue } from 'components/base/Markdown/MarkdownStyles';

// Lazy load Markdown to reduce initial bundle size
const Markdown = lazy(() => import('components/base/Markdown'));

// Stable fallback components to prevent Suspense re-renders
// These are defined outside the component to maintain referential stability
const MarkdownFallback = <Skeleton variant="text" width="100%" />;

export interface TransactionIQMarkdownProps extends MarkdownProps {
  /** Callback when a citation is clicked */
  onCitationClick?: (documentName: string, section?: string) => void;
}

// Regex patterns for parsing
const CITATION_PATTERN = /\[([^\]]+),\s*([^\]]+)\]/g;
const CALCULATED_VALUE_PATTERN = /\{\{calc:([^|]+)\|([^}]+)\}\}/g;

interface ParsedSegment {
  type: 'text' | 'citation' | 'calculated';
  content: string;
  documentName?: string;
  section?: string;
  description?: string;
}

/**
 * Parse text content for citations and calculated values
 */
const parseContent = (text: string): ParsedSegment[] => {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;

  // Combined pattern to find all special syntax
  const combinedPattern = /\[([^\]]+),\s*([^\]]+)\]|\{\{calc:([^|]+)\|([^}]+)\}\}/g;
  let match;

  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[1] && match[2]) {
      // Citation match
      segments.push({
        type: 'citation',
        content: `[${match[1]}, ${match[2]}]`,
        documentName: match[1].trim(),
        section: match[2].trim(),
      });
    } else if (match[3] && match[4]) {
      // Calculated value match
      segments.push({
        type: 'calculated',
        content: match[3].trim(),
        description: match[4].trim(),
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
};

/**
 * Citation component for inline document references
 */
const InlineCitation = memo(
  ({
    documentName,
    section,
    onClick,
  }: {
    documentName: string;
    section?: string;
    onClick?: () => void;
  }) => {
    const displayText = section ? `${documentName}, ${section}` : documentName;

    return (
      <Tooltip
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {documentName}
            </Typography>
            {section && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {section}
              </Typography>
            )}
            {onClick && (
              <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}>
                Click to view source
              </Typography>
            )}
          </Box>
        }
        arrow
        placement="top"
      >
        <MarkdownCitation
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <IconifyIcon icon="mdi:file-document-outline" sx={{ fontSize: 12 }} />
          [{displayText}]
        </MarkdownCitation>
      </Tooltip>
    );
  }
);

InlineCitation.displayName = 'InlineCitation';

/**
 * Calculated value component with tooltip showing breakdown
 */
const InlineCalculatedValue = memo(
  ({ value, description }: { value: string; description: string }) => {
    return (
      <Tooltip
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <IconifyIcon icon="mdi:calculator-variant" sx={{ fontSize: 14 }} />
              Calculated Value
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'warning.main', display: 'block', mt: 0.5, fontStyle: 'italic' }}
            >
              Verify with your agent
            </Typography>
          </Box>
        }
        arrow
        placement="top"
      >
        <MarkdownCalculatedValue tabIndex={0}>
          <IconifyIcon icon="mdi:calculator-variant" sx={{ fontSize: 14 }} />
          {value}
        </MarkdownCalculatedValue>
      </Tooltip>
    );
  }
);

InlineCalculatedValue.displayName = 'InlineCalculatedValue';

/**
 * Pre-process markdown content to handle special syntax
 * This wraps citations and calculated values in custom components
 */
const TransactionIQMarkdown = memo(
  ({ children, onCitationClick, variant, ...restProps }: TransactionIQMarkdownProps) => {
    // Check if content has any special syntax
    const hasSpecialSyntax = useMemo(() => {
      return CITATION_PATTERN.test(children) || CALCULATED_VALUE_PATTERN.test(children);
    }, [children]);

    // Handle citation click - stabilized with useCallback
    const handleCitationClick = useCallback(
      (documentName: string, section?: string) => {
        onCitationClick?.(documentName, section);
      },
      [onCitationClick]
    );

    // Memoize the props object to prevent useMemo invalidation
    const markdownProps = useMemo(
      () => ({ variant, ...restProps }),
      // Only re-create when variant changes - restProps changes are handled by memo()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [variant]
    );

    // For content with special syntax, we need custom rendering
    // Split by lines and parse each paragraph
    // Note: This hook must be called unconditionally (before any early returns)
    const renderContent = useMemo(() => {
      if (!hasSpecialSyntax) {
        return null;
      }

      const lines = children.split('\n');
      const rendered: ReactNode[] = [];

      lines.forEach((line, lineIndex) => {
        const segments = parseContent(line);

        if (segments.length === 1 && segments[0].type === 'text') {
          // No special content, render as markdown
          rendered.push(
            <Suspense key={lineIndex} fallback={MarkdownFallback}>
              <Markdown {...markdownProps}>
                {line}
              </Markdown>
            </Suspense>
          );
        } else {
          // Has special content, render mixed
          rendered.push(
            <Typography
              key={lineIndex}
              variant={variant || 'body2'}
              component="div"
              sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}
            >
              {segments.map((segment, segIndex) => {
                if (segment.type === 'citation') {
                  return (
                    <InlineCitation
                      key={`${lineIndex}-${segIndex}`}
                      documentName={segment.documentName!}
                      section={segment.section}
                      onClick={
                        onCitationClick
                          ? () => handleCitationClick(segment.documentName!, segment.section)
                          : undefined
                      }
                    />
                  );
                }
                if (segment.type === 'calculated') {
                  return (
                    <InlineCalculatedValue
                      key={`${lineIndex}-${segIndex}`}
                      value={segment.content}
                      description={segment.description!}
                    />
                  );
                }
                return <Fragment key={`${lineIndex}-${segIndex}`}>{segment.content}</Fragment>;
              })}
            </Typography>
          );
        }
      });

      return rendered;
    }, [children, handleCitationClick, hasSpecialSyntax, markdownProps, onCitationClick, variant]);

    // If no special syntax, render normally
    if (!hasSpecialSyntax) {
      return (
        <Suspense fallback={MarkdownFallback}>
          <Markdown {...markdownProps}>{children}</Markdown>
        </Suspense>
      );
    }

    return <Box>{renderContent}</Box>;
  }
);

TransactionIQMarkdown.displayName = 'TransactionIQMarkdown';

export default TransactionIQMarkdown;
