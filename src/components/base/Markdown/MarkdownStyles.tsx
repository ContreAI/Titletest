import { styled } from '@mui/material/styles';
import { Box, Typography, Link, Table, TableHead, TableBody, TableRow, TableCell, Checkbox } from '@mui/material';
import { fontFamilies } from 'theme/typography';

// Headings - use Bebas Neue (headers font)
export const MarkdownH1 = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamilies.headers,
  fontWeight: 600,
  fontSize: '1.75rem',
  lineHeight: 1.25,
  letterSpacing: '0.05em',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  '&:first-of-type': { marginTop: 0 },
}));

export const MarkdownH2 = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamilies.headers,
  fontWeight: 500,
  fontSize: '1.375rem',
  lineHeight: 1.3,
  letterSpacing: '0.05em',
  marginTop: theme.spacing(2.5),
  marginBottom: theme.spacing(1.5),
  '&:first-of-type': { marginTop: 0 },
}));

export const MarkdownH3 = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamilies.headers,
  fontWeight: 400,
  fontSize: '1.25rem',
  lineHeight: 1.3,
  letterSpacing: '0.05em',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '&:first-of-type': { marginTop: 0 },
}));

export const MarkdownH4 = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamilies.headers,
  fontWeight: 400,
  fontSize: '1.125rem',
  lineHeight: 1.3,
  letterSpacing: '0.05em',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '&:first-of-type': { marginTop: 0 },
}));

export const MarkdownH5 = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamilies.headers,
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.35,
  letterSpacing: '0.05em',
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(0.75),
  '&:first-of-type': { marginTop: 0 },
}));

export const MarkdownH6 = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamilies.headers,
  fontWeight: 400,
  fontSize: '0.875rem',
  lineHeight: 1.4,
  letterSpacing: '0.05em',
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(0.75),
  '&:first-of-type': { marginTop: 0 },
}));

// Paragraph
export const MarkdownParagraph = styled(Typography)(({ theme }) => ({
  fontFamily: fontFamilies.primary,
  marginBottom: theme.spacing(1.5),
  '&:last-child': { marginBottom: 0 },
}));

// Link
export const MarkdownLink = styled(Link)(({ theme }) => ({
  color: theme.vars.palette.primary.main,
  textDecoration: 'underline',
  '&:hover': {
    color: theme.vars.palette.primary.dark,
  },
}));

// Blockquote
export const MarkdownBlockquote = styled(Box)(({ theme }) => ({
  borderLeft: `4px solid ${theme.vars.palette.info.main}`,
  backgroundColor: theme.vars.palette.background.elevation1,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(0.5),
  fontStyle: 'italic',
  '& p': {
    margin: 0,
  },
}));

// Inline code - matches existing Code.tsx pattern
export const MarkdownInlineCode = styled('code')(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.elevation1,
  border: `1px solid ${theme.vars.palette.background.elevation3}`,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.25, 0.75),
  fontFamily: fontFamilies.monospace,
  fontSize: '0.75rem',
  lineHeight: 1.5,
  color: theme.vars.palette.chGrey[700],
}));

// Code block (pre element) - no syntax highlighting
export const MarkdownPre = styled('pre')(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.elevation1,
  border: `1px solid ${theme.vars.palette.background.elevation3}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  overflow: 'auto',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& code': {
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    fontFamily: fontFamilies.monospace,
    fontSize: '0.8125rem',
    lineHeight: 1.54,
    color: theme.vars.palette.text.primary,
  },
}));

// Unordered list
export const MarkdownUl = styled('ul')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  fontFamily: fontFamilies.primary,
}));

// Ordered list
export const MarkdownOl = styled('ol')(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  fontFamily: fontFamilies.primary,
}));

// List item
export const MarkdownLi = styled('li')(({ theme }) => ({
  fontFamily: fontFamilies.primary,
  fontSize: '0.8125rem',
  lineHeight: 1.54,
  marginBottom: theme.spacing(0.5),
  '&::marker': {
    color: theme.vars.palette.text.secondary,
  },
}));

// Task list item (GFM)
export const MarkdownTaskListItem = styled('li')(({ theme }) => ({
  fontFamily: fontFamilies.primary,
  fontSize: '0.8125rem',
  lineHeight: 1.54,
  listStyle: 'none',
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  marginLeft: theme.spacing(-3),
  marginBottom: theme.spacing(0.5),
}));

// Task checkbox
export const MarkdownCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 0,
  marginTop: 2,
  color: theme.vars.palette.primary.main,
  '&.Mui-checked': {
    color: theme.vars.palette.primary.main,
  },
}));

// GFM Tables
export const MarkdownTable = styled(Table)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderCollapse: 'collapse',
  width: '100%',
}));

export const MarkdownTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.elevation1,
  '& th': {
    fontWeight: 600,
    borderBottom: `1px solid ${theme.vars.palette.divider}`,
  },
}));

export const MarkdownTableBody = styled(TableBody)({});

export const MarkdownTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.vars.palette.background.elevation1,
  },
}));

export const MarkdownTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: fontFamilies.primary,
  fontSize: '0.8125rem',
  lineHeight: 1.54,
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
}));

// Horizontal rule
export const MarkdownHr = styled('hr')(({ theme }) => ({
  border: 'none',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

// Strikethrough (GFM)
export const MarkdownDel = styled('del')(({ theme }) => ({
  color: theme.vars.palette.text.disabled,
}));

// Strong/Bold
export const MarkdownStrong = styled('strong')({
  fontWeight: 600,
});

// Emphasis/Italic
export const MarkdownEm = styled('em')({
  fontStyle: 'italic',
});

// Citation - inline document reference
export const MarkdownCitation = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  backgroundColor: `rgba(${theme.vars.palette.secondary.mainChannel} / 0.12)`,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.25, 0.75),
  marginLeft: theme.spacing(0.5),
  fontFamily: fontFamilies.monospace,
  fontSize: '0.75rem',
  color: theme.vars.palette.secondary.dark,
  cursor: 'pointer',
  transition: 'all 150ms ease-in-out',
  verticalAlign: 'middle',
  '&:hover': {
    backgroundColor: `rgba(${theme.vars.palette.secondary.mainChannel} / 0.2)`,
    textDecoration: 'underline',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.vars.palette.primary.main}`,
    outlineOffset: 1,
  },
}));

// Calculated Value - computed values with breakdown
export const MarkdownCalculatedValue = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.08)`,
  border: `1px solid rgba(${theme.vars.palette.primary.mainChannel} / 0.2)`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5, 1.5),
  fontFamily: fontFamilies.monospace,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.vars.palette.primary.dark,
  cursor: 'pointer',
  transition: 'all 150ms ease-in-out',
  verticalAlign: 'middle',
  '&:hover': {
    backgroundColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.12)`,
    borderColor: `rgba(${theme.vars.palette.primary.mainChannel} / 0.3)`,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.vars.palette.primary.main}`,
    outlineOffset: 1,
  },
}));
