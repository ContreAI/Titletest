/**
 * Response Elements for Transaction IQ Chatbot
 *
 * Specialized UI components for enhanced AI response presentation:
 * - GuardrailAlert: Displays legal/financial advice redirects
 * - CitationChip: Inline document source citations
 * - CitationFooter: Aggregated sources list
 * - StateContextBadge: State-specific regulation indicator
 * - DisclaimerSection: Collapsible legal disclaimers
 * - CalculatedValue: Computed values with breakdown
 * - TransactionIQMarkdown: Enhanced markdown with citation/calculation parsing
 */

export { default as GuardrailAlert } from './GuardrailAlert';
export { default as CitationChip } from './CitationChip';
export { default as CitationFooter } from './CitationFooter';
export { default as StateContextBadge } from './StateContextBadge';
export { default as DisclaimerSection } from './DisclaimerSection';
export { default as CalculatedValue } from './CalculatedValue';
export { default as TransactionIQMarkdown } from './TransactionIQMarkdown';

// Types
export type { GuardrailAlertProps } from './GuardrailAlert';
export type { CitationChipProps } from './CitationChip';
export type { CitationFooterProps, Citation } from './CitationFooter';
export type { StateContextBadgeProps } from './StateContextBadge';
export type { DisclaimerSectionProps } from './DisclaimerSection';
export type { CalculatedValueProps, CalculationStep } from './CalculatedValue';
export type { TransactionIQMarkdownProps } from './TransactionIQMarkdown';
