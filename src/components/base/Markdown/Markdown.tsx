import { memo, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, SxProps, Theme } from '@mui/material';
import {
  MarkdownH1,
  MarkdownH2,
  MarkdownH3,
  MarkdownH4,
  MarkdownH5,
  MarkdownH6,
  MarkdownParagraph,
  MarkdownLink,
  MarkdownBlockquote,
  MarkdownInlineCode,
  MarkdownPre,
  MarkdownUl,
  MarkdownOl,
  MarkdownLi,
  MarkdownTaskListItem,
  MarkdownCheckbox,
  MarkdownTable,
  MarkdownTableHead,
  MarkdownTableBody,
  MarkdownTableRow,
  MarkdownTableCell,
  MarkdownHr,
  MarkdownDel,
  MarkdownStrong,
  MarkdownEm,
} from './MarkdownStyles';

export interface MarkdownProps {
  /** The markdown content to render */
  children: string;
  /** Override default styling */
  sx?: SxProps<Theme>;
  /** Typography variant for base text (default: 'body2') */
  variant?: 'body1' | 'body2';
  /** Enable/disable GFM features (default: true) */
  gfm?: boolean;
  /** Custom component overrides */
  components?: Partial<Components>;
}

const Markdown = memo(({
  children,
  sx,
  variant = 'body2',
  gfm = true,
  components: customComponents,
}: MarkdownProps) => {
  // Memoize plugins array to prevent unnecessary re-renders
  const remarkPlugins = useMemo(() => (gfm ? [remarkGfm] : []), [gfm]);

  // Build component mappings
  const defaultComponents: Partial<Components> = useMemo(() => ({
    h1: ({ children }) => <MarkdownH1>{children}</MarkdownH1>,
    h2: ({ children }) => <MarkdownH2>{children}</MarkdownH2>,
    h3: ({ children }) => <MarkdownH3>{children}</MarkdownH3>,
    h4: ({ children }) => <MarkdownH4>{children}</MarkdownH4>,
    h5: ({ children }) => <MarkdownH5>{children}</MarkdownH5>,
    h6: ({ children }) => <MarkdownH6>{children}</MarkdownH6>,
    p: ({ children }) => <MarkdownParagraph variant={variant}>{children}</MarkdownParagraph>,
    a: ({ href, children }) => (
      <MarkdownLink
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </MarkdownLink>
    ),
    blockquote: ({ children }) => <MarkdownBlockquote>{children}</MarkdownBlockquote>,
    code: ({ children, className }) => {
      // Check if this is a code block (inside pre) or inline code
      // Code blocks have a className like "language-xxx"
      const isCodeBlock = className?.startsWith('language-');
      if (isCodeBlock) {
        return <code>{children}</code>;
      }
      return <MarkdownInlineCode>{children}</MarkdownInlineCode>;
    },
    pre: ({ children }) => <MarkdownPre>{children}</MarkdownPre>,
    ul: ({ children }) => <MarkdownUl>{children}</MarkdownUl>,
    ol: ({ children }) => <MarkdownOl>{children}</MarkdownOl>,
    li: ({ children, node }) => {
      // Check if this is a task list item (GFM)
      const hasCheckbox = node?.children?.some(
        (child) => child.type === 'element' && (child as { tagName?: string }).tagName === 'input'
      );

      if (hasCheckbox) {
        return <MarkdownTaskListItem>{children}</MarkdownTaskListItem>;
      }
      return <MarkdownLi>{children}</MarkdownLi>;
    },
    input: ({ checked, disabled }) => (
      <MarkdownCheckbox
        checked={checked}
        disabled={disabled}
        size="small"
      />
    ),
    table: ({ children }) => <MarkdownTable size="small">{children}</MarkdownTable>,
    thead: ({ children }) => <MarkdownTableHead>{children}</MarkdownTableHead>,
    tbody: ({ children }) => <MarkdownTableBody>{children}</MarkdownTableBody>,
    tr: ({ children }) => <MarkdownTableRow>{children}</MarkdownTableRow>,
    th: ({ children }) => <MarkdownTableCell component="th">{children}</MarkdownTableCell>,
    td: ({ children }) => <MarkdownTableCell>{children}</MarkdownTableCell>,
    hr: () => <MarkdownHr />,
    del: ({ children }) => <MarkdownDel>{children}</MarkdownDel>,
    strong: ({ children }) => <MarkdownStrong>{children}</MarkdownStrong>,
    em: ({ children }) => <MarkdownEm>{children}</MarkdownEm>,
  }), [variant]);

  // Merge custom components
  const mergedComponents = useMemo(() => ({
    ...defaultComponents,
    ...customComponents,
  }), [defaultComponents, customComponents]);

  return (
    <Box
      sx={{
        wordBreak: 'break-word',
        '& > *:first-of-type': { mt: 0 },
        '& > *:last-child': { mb: 0 },
        ...sx,
      }}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={mergedComponents}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
});

Markdown.displayName = 'Markdown';

export default Markdown;
