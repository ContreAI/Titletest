import { Skeleton, Stack } from '@mui/material';

interface SkeletonTextProps {
  /** Number of text lines to show */
  lines?: number;
  /** Line height for each skeleton line */
  lineHeight?: number;
  /** Spacing between lines (theme spacing units) */
  spacing?: number;
  /** Whether to vary line widths for a more natural look */
  varyWidths?: boolean;
}

/**
 * SkeletonText - Skeleton loader for text content like summaries
 *
 * Used to show loading state for text-heavy content while
 * preserving the expected layout.
 */
const SkeletonText = ({
  lines = 4,
  lineHeight = 20,
  spacing = 0.75,
  varyWidths = true,
}: SkeletonTextProps) => {
  // Generate varied widths for more natural appearance
  const getWidth = (index: number): string => {
    if (!varyWidths) return '100%';
    // Pattern: full, full, shorter, full, shorter...
    const patterns = ['100%', '95%', '75%', '100%', '85%', '90%', '70%', '100%'];
    // Last line is always shorter
    if (index === lines - 1) return '60%';
    return patterns[index % patterns.length];
  };

  return (
    <Stack spacing={spacing}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={getWidth(index)}
          height={lineHeight}
        />
      ))}
    </Stack>
  );
};

/**
 * SkeletonParagraph - Multi-paragraph skeleton for longer content
 */
interface SkeletonParagraphProps {
  /** Number of paragraphs */
  paragraphs?: number;
  /** Lines per paragraph */
  linesPerParagraph?: number;
}

const SkeletonParagraph = ({
  paragraphs = 2,
  linesPerParagraph = 4,
}: SkeletonParagraphProps) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: paragraphs }).map((_, index) => (
        <SkeletonText key={index} lines={linesPerParagraph} />
      ))}
    </Stack>
  );
};

export default SkeletonText;
export { SkeletonParagraph };
